import type { CoachResponse } from "../hooks/useResponseParser";

export default function Responses({
  responses,
}: {
  responses: Record<number, CoachResponse>;
}) {
  const responseEntries = Object.entries(responses).filter(
    ([, response]) => response.type !== "NO_OP"
  ).reverse();

  if (responseEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p className="text-lg">
          No responses yet. Start the conversation to receive feedback.
        </p>
      </div>
    );
  }

  const getResponseColor = (type: CoachResponse["type"]) => {
    switch (type) {
      case "feedback":
        return "bg-orange-900/30 border-orange-500 text-orange-100";
      case "tips":
        return "bg-purple-900/30 border-purple-500 text-purple-100";
      default:
        return "bg-gray-900/30 border-gray-500 text-gray-100";
    }
  };

  const getResponseIndicatorColor = (type: CoachResponse["type"]) => {
    switch (type) {
      case "feedback":
        return "bg-orange-500";
      case "tips":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatResponseTitle = (type: CoachResponse["type"]) => {
    switch (type) {
      case "feedback":
        return "Feedback";
      case "tips":
        return "Tips";
      default:
        return "Unknown";
    }
  };

  const renderResponseContent = (response: CoachResponse) => {
    switch (response.type) {
      case "feedback":
        return (
          <div>
            <div className="flex items-center mb-2">
              {response.score && <span className="text-sm font-medium text-orange-300">
                Score: {response.score}/10
              </span>}
            </div>
            {response.content && <p className="leading-relaxed text-gray-200">{response.content}</p>}
          </div>
        );
      case "tips":
        return (
          <div>
            {response.content && <p className="leading-relaxed text-gray-200">{response.content}</p>}
          </div>
        );
      default:
        return <p className="italic text-gray-400">Unknown response type.</p>;
    }
  };

  return (
    <div className="space-y-4">
      {responseEntries.map(([id, response]) => (
        <div
          key={id}
          className={`p-4 rounded-lg border-l-4 ${getResponseColor(
            response.type
          )}`}
        >
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${getResponseIndicatorColor(
                response.type
              )}`}
            />
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              {formatResponseTitle(response.type)}
            </h3>
          </div>
          {renderResponseContent(response)}
        </div>
      ))}
    </div>
  );
}
