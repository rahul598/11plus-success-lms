declare module 'stream-browserify';
declare module 'simple-peer';

// Add global declarations for WebRTC polyfills
declare global {
  var global: typeof globalThis;
  var Buffer: typeof Buffer;
  var process: NodeJS.Process;
  var util: any;
  var stream: any;

  interface Window {
    RTCPeerConnection: any;
    global: typeof globalThis;
    Buffer: typeof Buffer;
    process: NodeJS.Process;
    util: any;
    stream: any;
  }
}

export {};