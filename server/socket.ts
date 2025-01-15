import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import type { SelectUser } from "@db/schema";

interface ChatMessage {
  message: string;
  from: string;
  timestamp: string;
  to?: string;
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "userStatus";
  timestamp: string;
  read?: boolean;
}

interface ServerToClientEvents {
  notification: (data: Notification) => void;
  chatMessage: (data: ChatMessage) => void;
  userStatus: (data: { userId: number; status: "online" | "offline" }) => void;
  // WebRTC specific events
  userJoinedRoom: (data: { userId: string; signal: any }) => void;
  userLeftRoom: (userId: string) => void;
  receivingSignal: (data: { userId: string; signal: any }) => void;
  error: (error: string) => void;
}

interface ClientToServerEvents {
  sendMessage: (message: string, to?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  authenticate: (user: SelectUser) => void;
  // WebRTC specific events
  joinRoom: (data: { roomId: string; isTeacher: boolean }) => void;
  leaveRoom: (roomId: string) => void;
  sendSignal: (data: { signal: any; userId: string }) => void;
  returningSignal: (data: { signal: any; userId: string }) => void;
}

export function setupWebSocketServer(httpServer: Server) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store active users and their socket IDs
  const activeUsers = new Map<string, SelectUser>();
  const userSockets = new Map<number, string>();
  const rooms = new Map<string, Set<string>>(); // Store room participants

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle user authentication
    socket.on("authenticate", (user: SelectUser) => {
      try {
        activeUsers.set(socket.id, user);
        userSockets.set(user.id, socket.id);

        // Notify others that a new user is online
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
      } catch (error) {
        console.error("Authentication error:", error);
      }
    });

    // Handle joining a room
    socket.on("joinRoom", ({ roomId, isTeacher }) => {
      try {
        socket.join(roomId);
        const room = rooms.get(roomId) || new Set();
        room.add(socket.id);
        rooms.set(roomId, room);

        // Notify existing users in the room about the new peer
        socket.to(roomId).emit("userJoinedRoom", {
          userId: socket.id,
          signal: null // Initial signal will be sent later
        });

        console.log(`User ${socket.id} joined room ${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", "Failed to join room");
      }
    });

    // Handle leaving a room
    socket.on("leaveRoom", (roomId) => {
      try {
        socket.leave(roomId);
        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket.id);
          if (room.size === 0) {
            rooms.delete(roomId);
          }
        }
        socket.to(roomId).emit("userLeftRoom", socket.id);
        console.log(`User ${socket.id} left room ${roomId}`);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    // Handle WebRTC signaling
    socket.on("sendSignal", ({ signal, userId }) => {
      io.to(userId).emit("receivingSignal", {
        userId: socket.id,
        signal
      });
    });

    socket.on("returningSignal", ({ signal, userId }) => {
      io.to(userId).emit("receivingSignal", {
        userId: socket.id,
        signal
      });
    });

    // Handle chat messages
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

        const chatMessage: ChatMessage = {
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

    // Handle notification read status
    socket.on("markNotificationRead", (notificationId: string) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;
      console.log(`Notification ${notificationId} marked as read by ${user.username}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        // Notify others about user going offline
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

        // Clean up user data
        activeUsers.delete(socket.id);
        userSockets.delete(user.id);

        // Clean up room participation
        rooms.forEach((participants, roomId) => {
          if (participants.has(socket.id)) {
            participants.delete(socket.id);
            if (participants.size === 0) {
              rooms.delete(roomId);
            }
            socket.to(roomId).emit("userLeftRoom", socket.id);
          }
        });
      }
    });
  });

  return io;
}