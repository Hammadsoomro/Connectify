import { createServer } from "./index.js";

// Create and start the full server with Socket.IO for development
const server = createServer();
const PORT = process.env.SOCKET_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Development server with Socket.IO running on port ${PORT}`);
  console.log(`📡 Socket.IO endpoint: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down development server...");
  server.close(() => {
    console.log("Development server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down development server...");
  server.close(() => {
    console.log("Development server closed");
    process.exit(0);
  });
});
