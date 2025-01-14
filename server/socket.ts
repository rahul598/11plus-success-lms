import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import type { SelectUser } from "@db/schema";

interface ChatMessage {
  message: string;
  from: string;
  timestamp: string;
  to?: string; // For private messages
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
}

interface ClientToServerEvents {
  sendMessage: (message: string, to?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  authenticate: (user: SelectUser) => void;
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

        // Broadcast user status
        socket.broadcast.emit("userStatus", {
          userId: user.id,
          status: "online"
        });

        // Send welcome notification to the user
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
            socket.emit("chatMessage", chatMessage); // Send to sender as well
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

      // Here you would typically update the notification status in the database
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

        // Broadcast user status
        socket.broadcast.emit("userStatus", {
          userId: user.id,
          status: "offline"
        });

        // Clean up user data
        activeUsers.delete(socket.id);
        userSockets.delete(user.id);
      }
    });
  });

  return io;
}