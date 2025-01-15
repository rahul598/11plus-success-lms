// Create a global object if it doesn't exist
let globalObject: any;

if (typeof window !== 'undefined') {
  globalObject = window;
} else if (typeof global !== 'undefined') {
  globalObject = global;
} else if (typeof self !== 'undefined') {
  globalObject = self;
} else {
  globalObject = {};
}

// Ensure global is available
if (!globalObject.global) {
  globalObject.global = globalObject;
}

// Now import the required modules
import { Buffer } from 'buffer';
import process from 'process';
import util from 'util';
import stream from 'stream-browserify';

// Initialize remaining polyfills after imports
function initializeGlobals() {
  try {
    if (typeof window !== 'undefined') {
      window.global = window;
      window.Buffer = window.Buffer || Buffer;
      window.process = window.process || process;
      window.util = window.util || util;
      window.stream = window.stream || stream;

      // Initialize RTCPeerConnection if not available
      if (!window.RTCPeerConnection) {
        console.warn('RTCPeerConnection not available, using polyfill');
        // Add basic WebRTC polyfill if needed
        window.RTCPeerConnection = window.webkitRTCPeerConnection || 
                                 window.mozRTCPeerConnection;
      }

      console.log('WebRTC polyfills initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize WebRTC polyfills:', error);
    throw new Error('WebRTC initialization failed');
  }
}

export function checkWebRTCSupport(): boolean {
  try {
    return !!(
      window.RTCPeerConnection &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  } catch (error) {
    console.error('Error checking WebRTC support:', error);
    return false;
  }
}

// Initialize polyfills with error handling
export function initializeWebRTCPolyfills() {
  try {
    initializeGlobals();
    if (!checkWebRTCSupport()) {
      console.warn('WebRTC is not fully supported in this browser');
    }
  } catch (error) {
    console.error('Failed to initialize WebRTC polyfills:', error);
    throw new Error('WebRTC initialization failed');
  }
}

// Initialize immediately when imported
initializeWebRTCPolyfills();