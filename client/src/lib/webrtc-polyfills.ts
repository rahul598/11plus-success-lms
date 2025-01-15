// WebRTC polyfills and browser compatibility
import { Buffer } from 'buffer';
import process from 'process';
import util from 'util';
import stream from 'stream-browserify';

// Initialize required globals before any WebRTC operations
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
  window.global = window;
  (window as any).util = util;
  (window as any).stream = stream;
}

export function checkWebRTCSupport(): boolean {
  return !!(
    window.RTCPeerConnection &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

// Initialize polyfills
export function initializeWebRTCPolyfills() {
  if (!checkWebRTCSupport()) {
    console.warn('WebRTC is not fully supported in this browser');
  }
}