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

    this.socket.on('userJoinedRoom', ({ userId, signal }: { userId: string; signal: SignalData }) => {
      console.log('New user joined:', userId);
      this.createPeer(userId, false);
    });

    this.socket.on('userLeftRoom', (userId: string) => {
      console.log('User left:', userId);
      if (this.peers.has(userId)) {
        this.peers.get(userId)?.destroy();
        this.peers.delete(userId);

        // Dispatch event to remove video element
        window.dispatchEvent(new CustomEvent('peer-left', { detail: { userId } }));
      }
    });

    this.socket.on('receivingSignal', ({ userId, signal }: { userId: string; signal: SignalData }) => {
      console.log('Received signal from user:', userId);
      if (this.peers.has(userId)) {
        try {
          this.peers.get(userId)?.signal(signal);
        } catch (error) {
          console.error('Error handling peer signal:', error);
        }
      } else {
        this.createPeer(userId, false, signal);
      }
    });

    this.socket.on('error', (error: string) => {
      console.error('WebRTC error:', error);
    });
  }

  private createPeer(userId: string, initiator: boolean, incomingSignal?: SignalData) {
    try {
      if (!this.localStream) {
        throw new Error('Local stream not available');
      }

      const peer = new Peer({
        initiator,
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
        if (initiator) {
          this.socket.emit('sendSignal', { signal, userId });
        } else {
          this.socket.emit('returningSignal', { signal, userId });
        }
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
        window.dispatchEvent(new CustomEvent('peer-left', { detail: { userId } }));
      });

      if (incomingSignal) {
        peer.signal(incomingSignal);
      }

      this.peers.set(userId, peer);
      return peer;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
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

      this.socket.emit('joinRoom', { roomId, isTeacher });
      console.log('Successfully joined room:', roomId);

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  leaveRoom() {
    if (this.roomId) {
      console.log('Leaving room:', this.roomId);
      this.socket.emit('leaveRoom', this.roomId);

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

      // Dispatch event to clear all remote videos
      window.dispatchEvent(new CustomEvent('clear-remote-videos'));
    }
  }

  toggleAudioTrack(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideoTrack(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }
}

// Create and export a singleton instance
export const webRTCService = new WebRTCService();