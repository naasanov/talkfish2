import { useEffect, useRef, useState } from "react";
import useDeepgram from "../context/deepgram/useDeepgram";
import useMicrophone from "../context/microphone/useMicrophone";
import {
  MicrophoneEvents,
  MicrophoneState,
} from "../context/microphone/MicrophoneContext";
import {
  LiveTranscriptionEvents,
  SOCKET_STATES,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

export function useTranscription() {
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const {
    microphone,
    setupMicrophone,
    startMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone();
  const keepAliveInterval = useRef<NodeJS.Timeout>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [lastChunk, setLastChunk] = useState<string | null>(null);
  const [lastFinalChunk, setLastFinalChunk] = useState<string | null>(null);
  const currentChunkRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("[MICROPHONE] Setting up microphone");
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      console.log("[Hook] Microphone is ready, connecting to Deepgram");
      connectToDeepgram({
        model: "nova-3",
        smart_format: true,
        endpointing: 100,
        filler_words: true,
        punctuate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    console.log("\n[Hook] Connection state changed");
    if (!microphone) {
      console.log("[Hook] No microphone, returning\n");
      return;
    }
    if (!connection) {
      console.log("[Hook] No connection, returning\n");
      return;
    }

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const text = data.channel.alternatives[0].transcript;

      if (text == "") {
        // console.log("[Transcript] Empty text, returning")
        return;
      }

      console.log("\n[Transcript] Got transcript data");
      const isPunctuated = ["!", "?", "."].includes(text.slice(-1));
      const isFinal = data.speech_final && isPunctuated;

      console.log("[Transcript] Transcript text:", text);
      console.log(
        "[Transcript] Current chunk before update:",
        currentChunkRef.current
      );
      console.log(
        "[Transcript] Last final chunk before update:",
        lastFinalChunk
      );

      setLastChunk(text);
      setTranscript((prev) => (prev == null ? text : `${prev} ${text}`));
      if (isFinal) {
        console.log(
          "[Transcript] Got final chunk:\n",
          currentChunkRef.current ? `${currentChunkRef.current} ${text}` : text
        );
        setLastFinalChunk(
          currentChunkRef.current ? `${currentChunkRef.current} ${text}` : text
        );
        currentChunkRef.current = null;
      } else {
        console.log("[Transcript] Got continuing chunk:\n", text);
        if (currentChunkRef.current == null) {
          console.log("[Transcript] Previous chunk is null");
          currentChunkRef.current = text;
        } else {
          currentChunkRef.current = `${currentChunkRef.current} ${text}`;
        }
      }
      console.log("\n");
    };

    if (connectionState === SOCKET_STATES.open) {
      console.log("[Hook] Connection is open, setting up listener");
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);

      // startMicrophone();
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
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

  const onData = (e: BlobEvent) => {
    if (e.data.size > 0) {
      console.log("[MICROPHONE] Got data from microphone");
      connection?.send(e.data);
    }
  };

  const startTranscription = () => {
    if (!microphone || !connection) {
      console.log(
        "[Hook] Cannot start transcription - missing microphone or connection"
      );
      return;
    }

    if (connectionState !== SOCKET_STATES.open) {
      console.log("[Hook] Cannot start transcription - connection not open");
      return;
    }

    microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
    startMicrophone();
  };

  const stopTranscription = () => {
    microphone?.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    stopMicrophone();
  };

  return {
    startTranscription,
    stopTranscription,
    lastChunk,
    lastFinalChunk,
    transcript,
    connection,
    connectionState,
    microphone,
    microphoneState,
    isRecording: microphone?.state === "recording",
  };
}
