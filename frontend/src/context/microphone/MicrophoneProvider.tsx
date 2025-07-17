import { useState, useCallback, useEffect } from "react";
import {
  type MicrophoneContextProviderProps,
  MicrophoneState,
  MicrophoneContext,
} from "./MicrophoneContext";

const MicrophoneContextProvider: React.FC<MicrophoneContextProviderProps> = ({
  children,
}) => {
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>(
    MicrophoneState.NotSetup
  );
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    console.log("[MICROPHONE] Mic state:", microphone?.state);
  }, [microphone?.state]);

  const setupMicrophone = async () => {
    console.log("[MICROPHONE] Settup up mic");
    setMicrophoneState(MicrophoneState.SettingUp);

    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      const microphone = new MediaRecorder(userMedia);

      setMicrophoneState(MicrophoneState.Ready);
      setMicrophone(microphone);
    } catch (err) {
      console.error(err);

      throw err;
    }
  };

  const stopMicrophone = useCallback(() => {
    console.log("[MICROPHONE] Stopping mic")
    setMicrophoneState(MicrophoneState.Pausing);

    if (microphone?.state === "recording") {
      microphone.pause();
      setMicrophoneState(MicrophoneState.Paused);
    }
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    if (!microphone) return;

    setMicrophoneState(MicrophoneState.Opening);
    console.log("[MICROPHONE] Starting microphone");

    const handleStart = () => {
      console.log("[MICROPHONE] Microphone started");
      setMicrophoneState(MicrophoneState.Open);
      microphone.removeEventListener("start", handleStart);
    };

    microphone.addEventListener("start", handleStart);

    if (microphone.state === "paused") {
      microphone.resume();
    } else {
      microphone.start(250);
    }
  }, [microphone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        startMicrophone,
        stopMicrophone,
        setupMicrophone,
        microphoneState,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

export default MicrophoneContextProvider;
