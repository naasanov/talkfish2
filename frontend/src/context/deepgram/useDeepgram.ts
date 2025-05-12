import { useContext } from "react";
import { type DeepgramContextType, DeepgramContext } from "./DeepgramContext";

export default function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error(
      "useDeepgram must be used within a DeepgramContextProvider"
    );
  }
  return context;
}