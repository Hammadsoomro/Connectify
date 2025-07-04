import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer as createExpressServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  appType: "spa", // Ensure SPA mode for proper client-side routing
}));

function expressPlugin(): Plugin {
  let expressServer: any = null;

  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Create the full Express server with Socket.IO
      expressServer = createExpressServer();

      // Start the Express server on a different port
      const expressPort = 3001;
      expressServer.listen(expressPort, () => {
        console.log(
          `Express server with Socket.IO running on port ${expressPort}`,
        );
      });

      // Proxy API requests to the Express server
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/api")) {
          // Proxy to Express server
          const proxyUrl = `http://localhost:${expressPort}${req.url}`;

          // Simple proxy implementation
          const options = {
            hostname: "localhost",
            port: expressPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
          };

          const http = require("http");
          const proxyReq = http.request(options, (proxyRes: any) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          });

          proxyReq.on("error", (err: any) => {
            console.error("Proxy error:", err);
            res.writeHead(500);
            res.end("Proxy error");
          });

          req.pipe(proxyReq);
        } else {
          next();
        }
      });
    },

    closeBundle() {
      if (expressServer) {
        expressServer.close();
      }
    },
  };
}
