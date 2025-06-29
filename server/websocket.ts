import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  user?: any;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();

  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: AuthenticatedWebSocket) => {
      console.log("New WebSocket connection");

      ws.on("message", async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        this.removeClient(ws);
        console.log("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.removeClient(ws);
      });
    });

    console.log("WebSocket server initialized");
  }

  private async handleMessage(
    ws: AuthenticatedWebSocket,
    message: WebSocketMessage,
  ) {
    const { type, payload } = message;

    switch (type) {
      case "auth":
        await this.handleAuthentication(ws, payload);
        break;

      case "join_conversation":
        this.handleJoinConversation(ws, payload);
        break;

      case "leave_conversation":
        this.handleLeaveConversation(ws, payload);
        break;

      case "typing":
        this.handleTyping(ws, payload);
        break;

      default:
        console.log(`Unknown WebSocket message type: ${type}`);
    }
  }

  private async handleAuthentication(ws: AuthenticatedWebSocket, payload: any) {
    try {
      const { token } = payload;

      if (!token) {
        this.sendError(ws, "Authentication token required");
        return;
      }

      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        this.sendError(ws, "User not found");
        return;
      }

      ws.userId = user._id.toString();
      ws.user = user;

      this.addClient(ws);

      this.send(ws, "auth_success", {
        userId: user._id,
        message: "Authentication successful",
      });

      console.log(`User ${user.email} authenticated via WebSocket`);
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      this.sendError(ws, "Authentication failed");
    }
  }

  private handleJoinConversation(ws: AuthenticatedWebSocket, payload: any) {
    const { conversationId } = payload;
    // In a real implementation, you'd track which conversations each user has joined
    console.log(`User ${ws.userId} joined conversation ${conversationId}`);
  }

  private handleLeaveConversation(ws: AuthenticatedWebSocket, payload: any) {
    const { conversationId } = payload;
    console.log(`User ${ws.userId} left conversation ${conversationId}`);
  }

  private handleTyping(ws: AuthenticatedWebSocket, payload: any) {
    const { contactId, isTyping } = payload;

    // Broadcast typing status to relevant users
    this.broadcastToContact(contactId, "typing", {
      contactId: ws.userId,
      isTyping,
    });
  }

  private addClient(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return;

    if (!this.clients.has(ws.userId)) {
      this.clients.set(ws.userId, []);
    }

    this.clients.get(ws.userId)!.push(ws);
  }

  private removeClient(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return;

    const userClients = this.clients.get(ws.userId);
    if (userClients) {
      const index = userClients.indexOf(ws);
      if (index > -1) {
        userClients.splice(index, 1);
      }

      if (userClients.length === 0) {
        this.clients.delete(ws.userId);
      }
    }
  }

  private send(ws: AuthenticatedWebSocket, type: string, payload: any) {
    try {
      ws.send(JSON.stringify({ type, payload }));
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  }

  private sendError(ws: AuthenticatedWebSocket, message: string) {
    this.send(ws, "error", { message });
  }

  // Public methods for broadcasting messages

  public broadcastToUser(userId: string, type: string, payload: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach((ws) => {
        this.send(ws, type, payload);
      });
    }
  }

  public broadcastToContact(contactId: string, type: string, payload: any) {
    // This would typically involve looking up which users should receive this message
    // For now, we'll just broadcast to the specific contact
    this.broadcastToUser(contactId, type, payload);
  }

  public notifyNewMessage(
    recipientUserId: string,
    contactId: string,
    message: any,
  ) {
    this.broadcastToUser(recipientUserId, "new_message", {
      contactId,
      message,
    });
  }

  public notifyMessageStatus(
    recipientUserId: string,
    messageId: string,
    status: string,
  ) {
    this.broadcastToUser(recipientUserId, "message_status", {
      messageId,
      status,
    });
  }

  public notifyContactStatus(
    recipientUserId: string,
    contactId: string,
    isOnline: boolean,
  ) {
    this.broadcastToUser(
      recipientUserId,
      isOnline ? "contact_online" : "contact_offline",
      {
        contactId,
        isOnline,
      },
    );
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  public isUserConnected(userId: string): boolean {
    return this.clients.has(userId);
  }
}

// Singleton instance
export const webSocketManager = new WebSocketManager();

export default webSocketManager;
