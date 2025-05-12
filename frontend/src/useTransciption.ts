import { useEffect, useRef, useState } from "react";
import useDeepgram from "./context/deepgram/useDeepgram";
import useMicrophone from "./context/microphone/useMicrophone";
import {
  MicrophoneEvents,
  MicrophoneState,
} from "./context/microphone/MicrophoneContext";
import {
  LiveTranscriptionEvents,
  SOCKET_STATES,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

export function useTranscription() {
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    microphoneState,
    stopMicrophone,
  } = useMicrophone();
  const [transcript, setTranscript] = useState<string>("");
  const keepAliveInterval = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    console.log("[Hook] Setting up microphone");
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      console.log("[Hook] Microphone is ready, connecting to Deepgram");
      connectToDeepgram({
        model: "nova-3",
        smart_format: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      console.log("[Hook] Got data from microphone", e.data);
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const text = data.channel.alternatives[0].transcript;
      console.log("[Hook] Got transcript", text);

      if (text == "") {
        return;
      }

      setTranscript((prev) => prev + " " + text);
    };

    if (connectionState === SOCKET_STATES.open) {
      console.log("[Hook] Connection is open, setting up listeners");
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      // startMicrophone();
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === SOCKET_STATES.open
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    }

    return () => {
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  return {
    startTranscription: startMicrophone,
    stopTranscription: stopMicrophone,
    transcript,
    connection,
    connectionState,
    microphone,
    microphoneState,
    isRecording: microphoneState === MicrophoneState.Open,
  };
}
