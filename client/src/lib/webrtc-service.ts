import { io, Socket } from 'socket.io-client';

interface PeerConnection {
  peerConnection: RTCPeerConnection;
  stream?: MediaStream;
}

class WebRTCService {
  private socket: Socket;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private roomId: string | null = null;

  constructor() {
    this.socket = io(window.location.origin);
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('userJoinedRoom', async ({ userId }) => {
      console.log('New user joined:', userId);
      await this.createPeerConnection(userId, true);
    });

    this.socket.on('userLeftRoom', (userId: string) => {
      this.removePeerConnection(userId);
    });

    this.socket.on('receivedOffer', async ({ userId, offer }) => {
      console.log('Received offer from:', userId);
      const peerConnection = await this.createPeerConnection(userId, false);
      await peerConnection.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.peerConnection.createAnswer();
      await peerConnection.peerConnection.setLocalDescription(answer);
      this.socket.emit('sendAnswer', { userId, answer });
    });

    this.socket.on('receivedAnswer', async ({ userId, answer }) => {
      console.log('Received answer from:', userId);
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        await peerConnection.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    this.socket.on('receivedIceCandidate', async ({ userId, candidate }) => {
      console.log('Received ICE candidate for:', userId);
      const peerConnection = this.peerConnections.get(userId);
      if (peerConnection) {
        await peerConnection.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  private async createPeerConnection(userId: string, isInitiator: boolean): Promise<PeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('sendIceCandidate', { userId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      const connection = this.peerConnections.get(userId);
      if (connection) {
        connection.stream = remoteStream;
        this.dispatchStreamEvent(userId, remoteStream);
      }
    };

    const connection: PeerConnection = { peerConnection };
    this.peerConnections.set(userId, connection);

    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.socket.emit('sendOffer', { userId, offer });
    }

    return connection;
  }

  private removePeerConnection(userId: string) {
    const connection = this.peerConnections.get(userId);
    if (connection) {
      connection.peerConnection.close();
      this.peerConnections.delete(userId);
      this.dispatchStreamEndEvent(userId);
    }
  }

  private dispatchStreamEvent(userId: string, stream: MediaStream) {
    window.dispatchEvent(new CustomEvent('webrtc-stream-added', {
      detail: { userId, stream }
    }));
  }

  private dispatchStreamEndEvent(userId: string) {
    window.dispatchEvent(new CustomEvent('webrtc-stream-removed', {
      detail: { userId }
    }));
  }

  async joinRoom(roomId: string): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.roomId = roomId;
      this.socket.emit('joinRoom', { roomId });
      return this.localStream;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.emit('leaveRoom', this.roomId);

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      this.peerConnections.forEach((connection) => {
        connection.peerConnection.close();
      });
      this.peerConnections.clear();
      this.roomId = null;
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }
}

export const webRTCService = new WebRTCService();