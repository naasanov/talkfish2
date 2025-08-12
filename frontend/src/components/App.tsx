import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTranscription } from "../hooks/useTransciption.ts";
import { useEffect, useState, useRef } from "react";
import Transcript from "./Transcript.tsx";
import Responses from "./Responses.tsx";
import useResponseParser from "../hooks/useResponseParser.ts";

type Role = "candidate" | "interviewer";

export type TranscriptEntry = {
  role: Role;
  text: string;
};

function App() {
  const { lastChunk, isRecording, startTranscription, stopTranscription } =
    useTranscription();

  const { readyState, ...ws } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });

  const { responses, sendData } = useResponseParser();

  const [role, setRole] = useState<Role>("interviewer");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { role: "interviewer", text: "" },
  ]);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  const appendToTranscript = (chunk: string) => {
    setTranscript((prev) => {
      const updated = [...prev];
      const lastElement = updated[updated.length - 1];
      updated[updated.length - 1] = {
        ...lastElement,
        text: `${lastElement.text} ${chunk}`,
      };
      return updated;
    });
  };

  useEffect(() => {
    if (lastChunk) {
      appendToTranscript(lastChunk);
    }
  }, [lastChunk]);

  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop =
        transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (ws.lastMessage != null) {
      const { data } = ws.lastMessage;
      console.log("Received message:", data);
      const { id, content }: { id: number; content: string } = JSON.parse(data);
      if (content !== "NO_OP") {
        sendData(id, content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws.lastMessage]);

  const sendMessage = (message: string = "Whats good gang") => {
    if (readyState === ReadyState.OPEN) {
      console.log("Sending message:", message);
      ws.sendMessage(
        JSON.stringify({
          role,
          content: message,
        })
      );
    } else {
      console.log("WS not open");
    }
  };

  const handleSwapRole = () => {
    sendMessage(transcript[transcript.length - 1].text);
    setRole((prevRole) =>
      prevRole === "candidate" ? "interviewer" : "candidate"
    );
    const newRole = role === "candidate" ? "interviewer" : "candidate";
    setTranscript((prevTranscript) => [
      ...prevTranscript,
      { role: newRole, text: "" },
    ]);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden text-white bg-gray-700">
      {/* Sidebar */}
      <div className="flex flex-col items-center flex-shrink-0 w-1/6 p-4 bg-gray-900 min-w-44">
        {/* Header */}
        <header className="my-6 text-4xl font-bold">Talkfish</header>

        {/* Recording Button */}
        <button
          onClick={isRecording ? stopTranscription : startTranscription}
          className={`${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white font-semibold py-2 px-6 rounded shadow-md transition-all cursor-pointer w-full`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>

        {/* Swap Role Button */}
        <button
          onClick={handleSwapRole}
          className="w-full px-4 py-2 mt-4 font-semibold text-white transition-all bg-purple-500 rounded shadow-md cursor-pointer hover:bg-green-700"
        >
          {"Current: " + (role === "candidate" ? "Candidate" : "Interviewer")}
        </button>

        {/* WebSocket Status */}
        <div className="w-full mt-6 text-center">
          <h3 className="mb-2 text-lg font-semibold">WebSocket Status</h3>
          <p
            className={`${
              readyState === ReadyState.OPEN
                ? "text-green-500"
                : readyState === ReadyState.CLOSED
                ? "text-red-500"
                : "text-yellow-500"
            }`}
          >
            {readyState === ReadyState.OPEN
              ? "Connected"
              : readyState === ReadyState.CLOSED
              ? "Disconnected"
              : "Connecting..."}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-screen min-w-0 p-4 bg-gray-800">
        {/* Transcript Section */}
        <div className="flex flex-col w-full mb-2 text-left h-1/2">
          <h2 className="flex-shrink-0 mb-4 text-xl font-semibold">
            Transcript
          </h2>
          <div
            ref={transcriptScrollRef}
            className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-900 rounded shadow-md"
          >
            <Transcript transcript={transcript} />
          </div>
        </div>
        {/* Response Section */}
        <div className="flex flex-col w-full pt-2 text-left border-t border-gray-600 h-1/2">
          <h2 className="flex-shrink-0 mb-4 text-xl font-semibold">Response</h2>
          <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-900 rounded shadow-md">
            <Responses responses={responses} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
