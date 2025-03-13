import { useEffect, useState } from "react";
import "./App.css";

import Vapi from "@vapi-ai/web";
import { Telephone, TelephoneX } from 'react-bootstrap-icons'; 
import { isPublicKeyMissingError } from "./utils";

const vapi = new Vapi("9ea7f916-dcf5-4878-8202-254a8da34036");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [waitingForAssistant, setWaitingForAssistant] = useState(false);
  const [agentHasSpokenOnce, setAgentHasSpokenOnce] = useState(false);



  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      setShowPublicKeyInvalidMessage(false);

      setWaitingForAssistant(true);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);
      setShowPublicKeyInvalidMessage(false);

      setWaitingForAssistant(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
      setWaitingForAssistant(false);

      setAgentHasSpokenOnce(true);
    })

    vapi.on("speech-end", () => setAssistantIsSpeaking(false));

    vapi.on("error", (error) => {
      console.error(error);
      setConnecting(false);
      setWaitingForAssistant(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });
  }, []);

  const startCallInline = async () => {
    try {
      setConnecting(true);
      setWaitingForAssistant(true);
      await vapi.start("244df8bb-e194-4730-b37c-f65b6edf2ca7");
    } catch (error) {
      console.error("Call failed to start:", error);
      setConnecting(false);
    }
  };

  const endCall = () => vapi.stop();

  return (
    <div className="App">
      <header className="App-header">
        <h2 style={{ marginBottom: '50px', fontFamily: 'Raleway, sans-serif' }}>
        Al Wathba Demo - Arabic
        </h2>


        <div className="pulse-container">

          <div className={`audio-spectrum ${assistantIsSpeaking ? 'active' : ''}`}></div>


          <div className={`pulse-animation ${assistantIsSpeaking ? 'animate' : ''}`}>

            {assistantIsSpeaking && (
              <div className="equalizer">
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
              </div>
            )}


            <img
              src="/images/latin-man-avatar-people-04feb2024__9_-ID32942-2000x2000-removebg-preview.png"
              alt="AI Avatar"
              className="circle-image"
            />
          </div>
        </div>

        {waitingForAssistant && (
          <div className="waiting-loader">
            <p>Connecting...</p>
            <div className="loader-spinner"></div>
          </div>
        )}

        {!assistantIsSpeaking && connected && agentHasSpokenOnce &&<p className="listening-text">Listening...</p>}


        <button
          onClick={connected ? endCall : startCallInline}
          className={`call-button ${connected ? "stop" : "start"}`}
          disabled={connecting}
          style={{
            opacity: connecting ? 0.5 : 1,
            cursor: connecting ? 'not-allowed' : 'pointer'
          }}
        >
          {connected ? <TelephoneX size={40} /> : <Telephone size={40} />}
        </button>

        {showPublicKeyInvalidMessage && <PleaseSetYourPublicKeyMessage />}
      </header>
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

export default App;
