import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App.tsx";
import MicrophoneContextProvider from "./context/microphone/MicrophoneProvider.tsx";
import DeepgramContextProvider from "./context/deepgram/DeepgramProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MicrophoneContextProvider>
      <DeepgramContextProvider>
        <App />
      </DeepgramContextProvider>
    </MicrophoneContextProvider>
  </StrictMode>
);
