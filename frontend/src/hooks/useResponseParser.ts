import { useState } from "react";

type ResponseType = "feedback" | "tips" | "NO_OP";

type FeedbackResponse = {
  type: "feedback";
  content?: string;
  score?: number;
};

type TipsResponse = {
  type: "tips";
  content?: string;
};

type NoOpResponse = {
  type: "NO_OP";
};

type CoachResponse = FeedbackResponse | TipsResponse | NoOpResponse;

export default function useResponseParser() {
  const [responses, setResponses] = useState<Record<number, CoachResponse>>({});
  const [dataCache, setDataCache] = useState<Record<number, string>>({});

  const parseResponse = (content: string): CoachResponse | null => {
    try {
      const properXml = "<root>" + content + "</root>";
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(properXml, "text/xml");
      const typeElement = xmlDoc.querySelector("type");

      if (!typeElement) return null;

      const type = typeElement.textContent?.trim() as ResponseType;

      let score: string | null | undefined;
      switch (type) {
        case "feedback":
          score = xmlDoc.querySelector("score")?.textContent;
          return {
            type: "feedback",
            content: xmlDoc.querySelector("content")?.textContent ?? undefined,
            score: score ? parseInt(score, 10) : undefined,
          };
        case "tips":
          return {
            type: "tips",
            content: xmlDoc.querySelector("content")?.textContent ?? undefined,
          };
        case "NO_OP":
          return { type: "NO_OP" };
        default:
          return null;
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      return null;
    }
  };

  const sendData = (id: number, content: string): void => {
    const currentData = dataCache[id] || "";
    const appended = currentData + content;
    setDataCache((prev) => ({ ...prev, [id]: appended }));

    const parsed = parseResponse(appended);
    if (parsed) {
      setResponses((prev) => ({
        ...prev,
        [id]: parsed,
      }));
    }
  };

  return { responses, sendData };
}

export type {
  CoachResponse,
  FeedbackResponse,
  TipsResponse,
  NoOpResponse,
  ResponseType,
};