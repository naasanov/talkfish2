import { useContext } from "react";
import {
  MicrophoneContext,
  type MicrophoneContextType,
} from "./MicrophoneContext";

export default function useMicrophone(): MicrophoneContextType {
  const context = useContext(MicrophoneContext);

  if (context === undefined) {
    throw new Error(
      "useMicrophone must be used within a MicrophoneContextProvider"
    );
  }

  return context;
}
