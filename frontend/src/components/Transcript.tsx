import type { TranscriptEntry } from "./App";

export default function Transcript({
  transcript,
}: {
  transcript: TranscriptEntry[];
}) {
  if (
    transcript.length === 0 ||
    transcript.every((entry) => !entry.text.trim())
  ) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p className="text-lg">No transcript yet. Start recording to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcript.map((entry, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-l-4 ${
            entry.role === "interviewer"
              ? "bg-blue-900/30 border-blue-500 text-blue-100"
              : "bg-green-900/30 border-green-500 text-green-100"
          }`}
        >
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                entry.role === "interviewer" ? "bg-blue-500" : "bg-green-500"
              }`}
            />
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              {entry.role}
            </h3>
          </div>
          <p className="leading-relaxed text-gray-200">
            {entry.text.trim() || (
              <span className="italic text-gray-400">Listening...</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
