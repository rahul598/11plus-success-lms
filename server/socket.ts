import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import type { SelectUser } from "@db/schema";

interface ServerToClientEvents {
  userJoinedRoom: (data: { userId: string }) => void;
  userLeftRoom: (userId: string) => void;
  receivedOffer: (data: { userId: string; offer: RTCSessionDescriptionInit }) => void;
  receivedAnswer: (data: { userId: string; answer: RTCSessionDescriptionInit }) => void;
  receivedIceCandidate: (data: { userId: string; candidate: RTCIceCandidateInit }) => void;
  notification: (data: { id: string; message: string; type: string; timestamp: string }) => void;
  chatMessage: (data: { message: string; from: string; timestamp: string; to?: string }) => void;
  userStatus: (data: { userId: number; status: "online" | "offline" }) => void;
  error: (error: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (data: { roomId: string }) => void;
  leaveRoom: (roomId: string) => void;
  sendOffer: (data: { userId: string; offer: RTCSessionDescriptionInit }) => void;
  sendAnswer: (data: { userId: string; answer: RTCSessionDescriptionInit }) => void;
  sendIceCandidate: (data: { userId: string; candidate: RTCIceCandidateInit }) => void;
  authenticate: (user: SelectUser) => void;
  sendMessage: (message: string, to?: string) => void;
  markNotificationRead: (notificationId: string) => void;
}

export function setupWebSocketServer(httpServer: Server) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map<string, Set<string>>();
  const userSockets = new Map<number, string>();
  const activeUsers = new Map<string, SelectUser>();

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("authenticate", (user: SelectUser) => {
      activeUsers.set(socket.id, user);
      userSockets.set(user.id, socket.id);

      socket.broadcast.emit("notification", {
        id: `status-${Date.now()}`,
        message: `${user.username} is now online`,
        type: "userStatus",
        timestamp: new Date().toISOString(),
      });
      socket.broadcast.emit("userStatus", {
        userId: user.id,
        status: "online"
      });

      socket.emit("notification", {
        id: `welcome-${Date.now()}`,
        message: `Welcome back, ${user.username}!`,
        type: "info",
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      const room = rooms.get(roomId) || new Set();

      // Notify existing users about the new peer
      room.forEach((peerId) => {
        if (peerId !== socket.id) {
          io.to(peerId).emit("userJoinedRoom", { userId: socket.id });
        }
      });

      room.add(socket.id);
      rooms.set(roomId, room);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          rooms.delete(roomId);
        } else {
          // Notify remaining users
          room.forEach((peerId) => {
            io.to(peerId).emit("userLeftRoom", socket.id);
          });
        }
      }
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on("sendOffer", ({ userId, offer }) => {
      io.to(userId).emit("receivedOffer", {
        userId: socket.id,
        offer
      });
    });

    socket.on("sendAnswer", ({ userId, answer }) => {
      io.to(userId).emit("receivedAnswer", {
        userId: socket.id,
        answer
      });
    });

    socket.on("sendIceCandidate", ({ userId, candidate }) => {
      io.to(userId).emit("receivedIceCandidate", {
        userId: socket.id,
        candidate
      });
    });

    socket.on("sendMessage", (message: string, to?: string) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit("notification", {
            id: `error-${Date.now()}`,
            message: "You must be authenticated to send messages",
            type: "error",
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const chatMessage: { message: string; from: string; timestamp: string; to?: string } = {
          message,
          from: user.username,
          timestamp: new Date().toISOString(),
          to,
        };

        if (to) {
          // Private message
          const recipientSocket = userSockets.get(parseInt(to));
          if (recipientSocket) {
            io.to(recipientSocket).emit("chatMessage", chatMessage);
            socket.emit("chatMessage", chatMessage);
          }
        } else {
          // Broadcast to all
          io.emit("chatMessage", chatMessage);
        }
      } catch (error) {
        console.error("Message sending error:", error);
      }
    });

    socket.on("markNotificationRead", (notificationId: string) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;
      console.log(`Notification ${notificationId} marked as read by ${user.username}`);
    });

    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit("notification", {
          id: `status-${Date.now()}`,
          message: `${user.username} has gone offline`,
          type: "userStatus",
          timestamp: new Date().toISOString(),
        });
        socket.broadcast.emit("userStatus", {
          userId: user.id,
          status: "offline"
        });

        activeUsers.delete(socket.id);
        userSockets.delete(user.id);
      }

      // Clean up room participation
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          if (participants.size === 0) {
            rooms.delete(roomId);
          } else {
            // Notify remaining participants
            participants.forEach((peerId) => {
              io.to(peerId).emit("userLeftRoom", socket.id);
            });
          }
        }
      });
    });
  });

  return io;
}