import useWebSocket, { ReadyState } from "react-use-websocket";
import { useTranscription } from "./useTransciption";
import { useEffect, useState } from "react";

function App() {
  const { isRecording, startTranscription, stopTranscription } =
    useTranscription();

  const { readyState, ...ws } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: false,
    shouldReconnect: () => true,
  });

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      console.log("WebSocket is open");
    }
  }, [readyState]);

  useEffect(() => {
    if (ws.lastMessage != null) {
      const { data } = ws.lastMessage;
      console.log("Received message:", data);
      setResponse((prev) => prev + "\n\n" + data);
    }
  }, [ws.lastMessage]);

  const sendMessage = (message: string = "Whats good gang") => {
    if (readyState === ReadyState.OPEN) {
      console.log("Sending message:", message);
      ws.sendMessage(message);
    }
    setMessage("");
  };

  return (
    <div className="min-h-screen w-screen bg-gray-700 text-white flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-900 p-4 flex flex-col items-center">
        {/* Header */}
        <header className="text-4xl font-bold my-6">Talkfish</header>

        {/* Recording Button */}
        <button
          onClick={isRecording ? stopTranscription : startTranscription}
          className={`${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white font-semibold py-2 px-6 rounded shadow-md transition-all`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        {/* WebSocket Status */}
        <div className="mt-6 w-full text-center">
          <h3 className="text-lg font-semibold mb-2">WebSocket Status</h3>
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

        {/* Message Input */}
        <div className="mt-4 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="bg-gray-800 text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Send Message */}
        <div className="mt-4 w-full">
          <button
            onClick={() => sendMessage(message)}
            className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-all w-full cursor-pointer"
          >
            Send Message
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-800 p-4 flex flex-col items-center">
        {/* Transcript Section */}
        <div className="w-full text-left">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          <div className="bg-gray-900 p-4 rounded shadow-md">
            <p className="text-gray-300">{response || "Nothing yet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
