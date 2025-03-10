import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

const vapi = new Vapi("9ea7f916-dcf5-4878-8202-254a8da34036");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => setAssistantIsSpeaking(true));
    vapi.on("speech-end", () => setAssistantIsSpeaking(false));
    vapi.on("volume-level", (level) => setVolumeLevel(level));

    vapi.on("error", (error) => {
      console.error(error);
      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });
  }, []);

  const startCallInline = async () => {
    try {
      setConnecting(true);
      await vapi.start("244df8bb-e194-4730-b37c-f65b6edf2ca7");
    } catch (error) {
      console.error("Call failed to start:", error);
      setConnecting(false);
    }
  };

  const endCall = () => vapi.stop();

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!connected ? (
        <Button
          label="Vapi Demo"
          onClick={startCallInline}
          isLoading={connecting}
        />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}

      {showPublicKeyInvalidMessage && <PleaseSetYourPublicKeyMessage />}
      {/* <ReturnToDocsLink /> */}
    </div>
  );
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      const timer = setTimeout(() => setShowPublicKeyInvalidMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => (
  <div
    style={{
      position: "fixed",
      bottom: "25px",
      left: "25px",
      padding: "10px",
      color: "#fff",
      backgroundColor: "#f03e3e",
      borderRadius: "5px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    }}
  >
    Is your Vapi Public Key missing? (recheck your code)
  </div>
);

// const ReturnToDocsLink = () => (
//   <a
//     href="https://docs.vapi.ai"
//     target="_blank"
//     rel="noopener noreferrer"
//     style={{
//       position: "fixed",
//       top: "25px",
//       right: "25px",
//       padding: "5px 10px",
//       color: "#fff",
//       textDecoration: "none",
//       borderRadius: "5px",
//       boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
//     }}
//   >
//     return to docs
//   </a>
// );

export default App;
