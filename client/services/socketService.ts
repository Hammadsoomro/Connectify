import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    console.log("Attempting to connect to Socket.IO server...");

    try {
      this.socket = io(window.location.origin, {
        auth: {
          token,
        },
        transports: ["polling", "websocket"],
        timeout: 10000,
        forceNew: true,
        reconnection: false, // Disable auto-reconnection to prevent spam
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log(
          "✅ Connected to Socket.IO server - Real-time messaging enabled",
        );
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from Socket.IO server:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.warn("Socket.IO connection failed:", error.message);
        console.log(
          "📱 Real-time messaging unavailable - using polling fallback",
        );
        // Don't throw errors, just log and continue without real-time features
      });
    } catch (error) {
      console.warn("Failed to initialize Socket.IO:", error);
      console.log(
        "📱 Real-time messaging unavailable - continuing without Socket.IO",
      );
    }

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting from Socket.IO server...");
      try {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      } catch (error) {
        console.error("Error during socket disconnect:", error);
      } finally {
        this.socket = null;
        this.listeners.clear();
      }
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
