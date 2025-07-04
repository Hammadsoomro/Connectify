import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    console.log("Connecting to Socket.IO server...");

    // In development, connect to separate Socket.IO server
    const socketUrl = import.meta.env.DEV
      ? "http://localhost:3001"
      : window.location.origin;

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["polling", "websocket"], // Try polling first, then websocket
      timeout: 15000, // 15 second timeout
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from Socket.IO server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
      // Don't emit this as an error to UI components since we have retries
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket.IO failed to reconnect after all attempts");
      this.emit("connection_failed", {
        message: "Failed to establish real-time connection",
      });
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting from Socket.IO server...");
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Listen for new messages
    this.socket.on("message:new", (data) => {
      console.log("📱 New message received via Socket.IO:", data);
      this.emit("newMessage", data);
    });

    // Listen for contact updates
    this.socket.on("contacts:updated", (data) => {
      console.log("👥 Contacts updated via Socket.IO:", data);
      this.emit("contactsUpdated", data);
    });

    // Listen for unread count updates
    this.socket.on("unread:updated", (data) => {
      console.log("🔔 Unread counts updated via Socket.IO:", data);
      this.emit("unreadUpdated", data);
    });

    // Listen for message status updates
    this.socket.on("message:statusUpdate", (data) => {
      console.log("✓ Message status updated via Socket.IO:", data);
      this.emit("messageStatusUpdate", data);
    });
  }

  // Join phone number room
  joinPhoneNumber(phoneNumberId: string) {
    if (this.socket?.connected) {
      console.log(`Joining phone number room: ${phoneNumberId}`);
      this.socket.emit("join:phoneNumber", phoneNumberId);
    }
  }

  // Leave phone number room
  leavePhoneNumber(phoneNumberId: string) {
    if (this.socket?.connected) {
      console.log(`Leaving phone number room: ${phoneNumberId}`);
      this.socket.emit("leave:phoneNumber", phoneNumberId);
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export default new SocketService();
