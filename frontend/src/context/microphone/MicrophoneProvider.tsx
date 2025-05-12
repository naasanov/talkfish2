import { useState, useCallback } from "react";
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

  const setupMicrophone = async () => {
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
    setMicrophoneState(MicrophoneState.Pausing);

    if (microphone?.state === "recording") {
      microphone.pause();
      setMicrophoneState(MicrophoneState.Paused);
    }
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    setMicrophoneState(MicrophoneState.Opening);

    if (microphone?.state === "paused") {
      microphone.resume();
    } else {
      microphone?.start(250);
    }

    setMicrophoneState(MicrophoneState.Open);
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
