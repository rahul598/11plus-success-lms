declare module 'socket.io-client';

declare global {
  interface WindowEventMap {
    'webrtc-stream-added': CustomEvent<{ userId: string; stream: MediaStream }>;
    'webrtc-stream-removed': CustomEvent<{ userId: string }>;
  }
}

export {};