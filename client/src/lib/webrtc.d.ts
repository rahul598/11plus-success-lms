declare module 'stream-browserify';
declare module 'simple-peer';

// Add global declarations for WebRTC polyfills
declare global {
  interface Window {
    global: Window;
    Buffer: typeof Buffer;
    process: NodeJS.Process;
    util: any;
    stream: any;
  }
}

export {};
