import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTranscription } from "./useTransciption";
import { useEffect, useState } from "react";

function App() {
  const {
    lastFinalChunk,
    lastChunk,
    isRecording,
    startTranscription,
    stopTranscription,
  } = useTranscription();

  const { readyState, ...ws } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });

  const [role, setRole] = useState<"candidate" | "interviewer">("interviewer");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (lastChunk) {
      setTranscript((prev) =>
        prev == null ? lastChunk : `${prev} ${lastChunk}`
      );
    }
  }, [lastChunk]);

  useEffect(() => {
    setTranscript((prev) =>
      prev === null ? null : `${prev} \n[${role.toUpperCase()}]\n`
    );
  }, [role]);

  useEffect(() => {
    if (lastFinalChunk) {
      sendMessage(lastFinalChunk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFinalChunk]);

  useEffect(() => {
    if (ws.lastMessage != null) {
      const { data } = ws.lastMessage;
      console.log("Received message:", data);
      setResponse((prev) => prev + data);
    }
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

  return (
    <div className="flex w-screen min-h-screen text-white bg-gray-700">
      {/* Sidebar */}
      <div className="flex flex-col items-center w-1/6 p-4 bg-gray-900 min-w-44">
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
          onClick={() =>
            setRole((prev) =>
              prev === "candidate" ? "interviewer" : "candidate"
            )
          }
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
      <div className="flex flex-col items-center flex-1 p-4 bg-gray-800">
        {/* Transcript Section */}
        <div className="w-full pt-4 text-left h-1/2">
          <h2 className="mb-4 text-xl font-semibold">Transcript</h2>
          <div className="p-4 bg-gray-900 rounded shadow-md">
            <p className="text-gray-300 whitespace-pre-line">
              {transcript || "Nothing yet"}
            </p>
          </div>
        </div>
        {/* Response Section */}
        <div className="w-full pt-4 text-left border-t border-gray-600 h-1/2">
          <h2 className="mb-4 text-xl font-semibold">Response</h2>
          <div className="p-4 bg-gray-900 rounded shadow-md">
            <p className="text-gray-300 whitespace-pre-line">
              {response || "Nothing yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
