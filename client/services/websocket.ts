class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageCallbacks: Map<string, Function[]> = new Map();

  connect() {
    try {
      // In a real app, this would be wss:// for production
      const wsUrl = `ws://localhost:8080/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        // Send authentication token
        const token = localStorage.getItem("authToken");
        if (token) {
          this.send("auth", { token });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.log("Max reconnection attempts reached");
    }
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const callbacks = this.messageCallbacks.get(type) || [];

    callbacks.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in WebSocket callback for type ${type}:`, error);
      }
    });
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  subscribe(type: string, callback: Function) {
    if (!this.messageCallbacks.has(type)) {
      this.messageCallbacks.set(type, []);
    }
    this.messageCallbacks.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.messageCallbacks.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageCallbacks.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

// Message type definitions for real-time events
export interface RealTimeMessage {
  type:
    | "new_message"
    | "message_status"
    | "typing"
    | "contact_online"
    | "contact_offline";
  payload: any;
}

export interface NewMessagePayload {
  contactId: string;
  message: {
    id: string;
    content: string;
    timestamp: string;
    isOutgoing: boolean;
    status: string;
    type: string;
  };
}

export interface MessageStatusPayload {
  messageId: string;
  status: "sent" | "delivered" | "read" | "failed";
}

export interface TypingPayload {
  contactId: string;
  isTyping: boolean;
}

export interface ContactStatusPayload {
  contactId: string;
  isOnline: boolean;
}
