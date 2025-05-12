"use client";

import { createContext, type ReactNode } from "react";

interface MicrophoneContextType {
  microphone: MediaRecorder | null;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  setupMicrophone: () => void;
  microphoneState: MicrophoneState | null;
}

const MicrophoneEvents = {
  DataAvailable: "dataavailable",
  Error: "error",
  Pause: "pause",
  Resume: "resume",
  Start: "start",
  Stop: "stop",
} as const;

type MicrophoneEvents =
  (typeof MicrophoneEvents)[keyof typeof MicrophoneEvents];

const MicrophoneState = {
  NotSetup: -1,
  SettingUp: 0,
  Ready: 1,
  Opening: 2,
  Open: 3,
  Error: 4,
  Pausing: 5,
  Paused: 6,
} as const;

type MicrophoneState = (typeof MicrophoneState)[keyof typeof MicrophoneState];

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined
);

interface MicrophoneContextProviderProps {
  children: ReactNode;
}

export {
  type MicrophoneContextProviderProps,
  MicrophoneContext,
  MicrophoneEvents,
  MicrophoneState,
  type MicrophoneContextType,
};
