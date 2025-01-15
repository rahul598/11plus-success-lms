// Simple WebRTC support check and initialization
export function checkWebRTCSupport(): boolean {
  return !!(
    window.RTCPeerConnection &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

export function initializeWebRTCPolyfills() {
  if (typeof window !== 'undefined') {
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = 
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection;
    }
  }
}

// Initialize immediately
initializeWebRTCPolyfills();