import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import { initializeWebRTCPolyfills, checkWebRTCSupport } from './webrtc-polyfills';

// Initialize polyfills before using WebRTC
initializeWebRTCPolyfills();

interface SignalData {
  type: RTCSdpType;
  sdp?: string;
}

class WebRTCService {
  private socket: Socket;
  private peers: Map<string, Peer.Instance> = new Map();
  private localStream: MediaStream | null = null;
  private roomId: string | null = null;

  constructor() {
    // Initialize socket connection with error handling
    try {
      this.socket = io(window.location.origin, {
        path: '/ws',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Failed to initialize WebRTC service:', error);
      throw new Error('WebRTC initialization failed');
    }
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('user-joined', ({ userId, signal }: { userId: string; signal: SignalData }) => {
      console.log('New user joined:', userId);
      this.addPeer(signal, userId);
    });

    this.socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      if (this.peers.has(userId)) {
        this.peers.get(userId)?.destroy();
        this.peers.delete(userId);
      }
    });

    this.socket.on('receiving-signal', ({ userId, signal }: { userId: string; signal: SignalData }) => {
      console.log('Received signal from user:', userId);
      const peer = this.peers.get(userId);
      if (peer) {
        try {
          peer.signal(signal);
        } catch (error) {
          console.error('Error handling peer signal:', error);
        }
      }
    });
  }

  async joinRoom(roomId: string, isTeacher: boolean = false): Promise<MediaStream> {
    if (!checkWebRTCSupport()) {
      throw new Error('Your browser does not support WebRTC');
    }

    try {
      this.roomId = roomId;
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      this.socket.emit('join-room', { roomId, isTeacher });
      console.log('Successfully joined room:', roomId);

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  private addPeer(incomingSignal: SignalData, userId: string) {
    if (!this.localStream) {
      console.error('No local stream available');
      return;
    }

    try {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: this.localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peer.on('signal', (signal: SignalData) => {
        this.socket.emit('returning-signal', { signal, userId });
      });

      peer.on('stream', (stream: MediaStream) => {
        window.dispatchEvent(new CustomEvent('new-peer-stream', {
          detail: { stream, userId }
        }));
      });

      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        this.peers.delete(userId);
      });

      peer.on('close', () => {
        console.log('Peer connection closed:', userId);
        this.peers.delete(userId);
      });

      peer.signal(incomingSignal);
      this.peers.set(userId, peer);
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  }

  leaveRoom() {
    if (this.roomId) {
      console.log('Leaving room:', this.roomId);
      this.socket.emit('leave-room', this.roomId);

      // Clean up media streams
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
        this.localStream = null;
      }

      // Clean up peer connections
      this.peers.forEach(peer => {
        try {
          peer.destroy();
        } catch (error) {
          console.error('Error destroying peer:', error);
        }
      });
      this.peers.clear();
      this.roomId = null;
    }
  }
}

// Create and export a singleton instance
export const webRTCService = new WebRTCService();