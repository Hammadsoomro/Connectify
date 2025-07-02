import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

interface AuthenticatedSocket extends any {
  userId?: string;
  user?: any;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  init(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string,
        ) as any;
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.user.email} connected (${socket.id})`);

      // Track user's socket connections
      const userId = socket.userId!;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(socket.id);

      // Join user to their own room for private messages
      socket.join(`user:${userId}`);

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User ${socket.user.email} disconnected (${socket.id})`);

        // Remove socket from tracking
        const sockets = this.userSockets.get(userId);
        if (sockets) {
          const index = sockets.indexOf(socket.id);
          if (index > -1) {
            sockets.splice(index, 1);
          }

          // If no more sockets, remove user
          if (sockets.length === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Handle joining phone number rooms
      socket.on("join:phoneNumber", (phoneNumberId: string) => {
        socket.join(`phone:${phoneNumberId}`);
        console.log(
          `User ${socket.user.email} joined phone room: ${phoneNumberId}`,
        );
      });

      // Handle leaving phone number rooms
      socket.on("leave:phoneNumber", (phoneNumberId: string) => {
        socket.leave(`phone:${phoneNumberId}`);
        console.log(
          `User ${socket.user.email} left phone room: ${phoneNumberId}`,
        );
      });
    });

    console.log("Socket.IO service initialized");
  }

  // Notify user about new message
  notifyNewMessage(userId: string, contactId: string, message: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit("message:new", {
        contactId,
        message,
      });
    }
  }

  // Notify about contact updates
  notifyContactUpdate(userId: string, phoneNumberId: string, contacts: any[]) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit("contacts:updated", {
        phoneNumberId,
        contacts,
      });
    }
  }

  // Notify about unread count changes
  notifyUnreadUpdate(userId: string, phoneNumberId: string, unreadCounts: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit("unread:updated", {
        phoneNumberId,
        unreadCounts,
      });
    }
  }

  // Notify about message status updates
  notifyMessageStatusUpdate(userId: string, messageId: string, status: string) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit("message:statusUpdate", {
        messageId,
        status,
      });
    }
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

export default new SocketService();
