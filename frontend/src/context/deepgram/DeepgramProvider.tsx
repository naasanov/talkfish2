import { LiveClient, SOCKET_STATES, type LiveSchema, createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { type FunctionComponent, useState } from "react";
import { type DeepgramContextProviderProps, getApiKey, DeepgramContext } from "./DeepgramContext";

const DeepgramContextProvider: FunctionComponent<
  DeepgramContextProviderProps
> = ({ children }) => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(
    SOCKET_STATES.closed
  );

  /**
   * Connects to the Deepgram speech recognition service and sets up a live transcription session.
   *
   * @param options - The configuration options for the live transcription session.
   * @param endpoint - The optional endpoint URL for the Deepgram service.
   * @returns A Promise that resolves when the connection is established.
   */
  const connectToDeepgram = async (options: LiveSchema, endpoint?: string) => {
    const key = await getApiKey();
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.on(LiveTranscriptionEvents.Open, () => {
      setConnectionState(SOCKET_STATES.open);
    });

    conn.on(LiveTranscriptionEvents.Close, () => {
      setConnectionState(SOCKET_STATES.closed);
    });

    setConnection(conn);
  };

  const disconnectFromDeepgram = async () => {
    if (connection) {
      connection.requestClose();
      setConnection(null);
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connection,
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

export default DeepgramContextProvider;