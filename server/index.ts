import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { auth } from "./middleware/auth.js";

// Route imports
import { handleDemo } from "./routes/demo.js";
import { register, login, getMe, updateProfile } from "./routes/auth.js";
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  markAsRead,
} from "./routes/contacts.js";
import {
  sendSMS,
  getMessages,
  handleIncomingSMS,
  getAvailableNumbers,
  purchaseNumber,
} from "./routes/sms.js";
import {
  getPhoneNumbers,
  setActiveNumber,
  releaseNumber,
} from "./routes/phoneNumbers.js";
import {
  createSubAccount,
  getSubAccounts,
  assignNumberToSubAccount,
  removeNumberAssignment,
  deactivateSubAccount,
  getDashboardStats,
} from "./routes/admin.js";
import {
  getWallet,
  addFunds,
  getWalletStats,
  updateMonthlyLimit,
} from "./routes/wallet.js";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Connect to MongoDB
  connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Public routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Connectify server!" });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", auth, getMe);
  app.put("/api/auth/profile", auth, updateProfile);

  // Contact routes
  app.get("/api/contacts", auth, getContacts);
  app.post("/api/contacts", auth, addContact);
  app.put("/api/contacts/:contactId", auth, updateContact);
  app.delete("/api/contacts/:contactId", auth, deleteContact);
  app.put("/api/contacts/:contactId/read", auth, markAsRead);

  // SMS routes
  app.post("/api/sms/send", auth, sendSMS);
  app.get("/api/sms/messages/:contactId", auth, getMessages);
  app.post("/api/twilio/webhook", handleIncomingSMS); // Twilio webhook (no auth)

  // Phone number routes
  app.get("/api/phone-numbers", auth, getPhoneNumbers);
  app.put("/api/phone-numbers/:numberId/activate", auth, setActiveNumber);
  app.delete("/api/phone-numbers/:numberId", auth, releaseNumber);
  app.get("/api/phone-numbers/available", getAvailableNumbers);
  app.post("/api/phone-numbers/purchase", auth, purchaseNumber);

  // Admin routes
  app.post("/api/admin/sub-accounts", auth, createSubAccount);
  app.get("/api/admin/sub-accounts", auth, getSubAccounts);
  app.post("/api/admin/assign-number", auth, assignNumberToSubAccount);
  app.post("/api/admin/remove-assignment", auth, removeNumberAssignment);
  app.put(
    "/api/admin/sub-accounts/:subAccountId/deactivate",
    auth,
    deactivateSubAccount,
  );
  app.get("/api/admin/dashboard-stats", auth, getDashboardStats);

  // Wallet routes
  app.get("/api/wallet", auth, getWallet);
  app.post("/api/wallet/add-funds", auth, addFunds);
  app.get("/api/wallet/stats", auth, getWalletStats);
  app.put("/api/wallet/monthly-limit", auth, updateMonthlyLimit);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "Connectify API",
      version: "1.0.0",
    });
  });

  return app;
}
