"use client";

import { LiveClient, SOCKET_STATES, type LiveSchema } from "@deepgram/sdk";

import { createContext, type ReactNode } from "react";

interface DeepgramContextType {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(
  undefined
);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  return import.meta.env.VITE_DEEPGRAM_KEY!;
  // const response = await fetch("/api/authenticate", { cache: "no-store" });
  // const result = await response.json();
  // return result.key;
};

export {
  getApiKey,
  DeepgramContext,
  type DeepgramContextProviderProps,
  type DeepgramContextType,
};
