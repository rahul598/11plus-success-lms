import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import type { SelectUser } from "@db/schema";

interface ServerToClientEvents {
  notification: (data: { message: string; type: string }) => void;
  chatMessage: (data: { message: string; from: string; timestamp: string }) => void;
}

interface ClientToServerEvents {
  sendMessage: (message: string) => void;
}

export function setupWebSocketServer(httpServer: Server) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store active users
  const activeUsers = new Map<string, SelectUser>();

  io.on("connection", (socket) => {
    console.log("New client connected");

    // Handle user authentication
    socket.on("authenticate", (user: SelectUser) => {
      activeUsers.set(socket.id, user);
      // Notify others that a new user is online
      socket.broadcast.emit("notification", {
        message: `${user.username} is now online`,
        type: "userStatus"
      });
    });

    // Handle chat messages
    socket.on("sendMessage", (message: string) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        io.emit("chatMessage", {
          message,
          from: user.username,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        socket.broadcast.emit("notification", {
          message: `${user.username} has gone offline`,
          type: "userStatus"
        });
        activeUsers.delete(socket.id);
      }
    });
  });

  return io;
}
