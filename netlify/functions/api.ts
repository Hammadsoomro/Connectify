import serverless from "serverless-http";
import { createServer } from "../../server";

// Create the server once and reuse it
const app = createServer();
const handler = serverless(app, {
  // Configure for better performance
  binary: false,
  request: (request: any, event: any, context: any) => {
    // Add request ID for better logging
    request.requestId = context.awsRequestId;
    return request;
  },
  response: (response: any, event: any, context: any) => {
    // Add CORS headers for production
    response.headers = {
      ...response.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    return response;
  },
});

export { handler };
