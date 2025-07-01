import { Response } from "express";
import twilio from "twilio";

// Get Twilio account balance
export const getTwilioBalance = async (req: any, res: Response) => {
  try {
    console.log("=== TWILIO BALANCE AUTH CHECK ===");
    console.log("User exists:", !!req.user);
    console.log("User ID:", req.user?._id);
    console.log("User role:", req.user?.role);
    console.log("Is admin:", req.user?.role === "admin");
    console.log("=== END AUTH CHECK ===");

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Allow both admin and sub-account users to view balance
    if (req.user.role !== "admin" && req.user.role !== "sub-account") {
      return res.status(403).json({
        message:
          "Only admin and sub-account users can view Twilio balance. Your role: " +
          req.user.role,
      });
    }

    // Validate Twilio credentials
    const twilioSid = process.env.TWILIO_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    console.log("=== TWILIO CREDENTIALS DEBUG ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("SID exists:", !!twilioSid);
    console.log("SID value:", twilioSid);
    console.log("SID format valid:", twilioSid?.startsWith("AC"));
    console.log("Token exists:", !!twilioAuthToken);
    console.log("Token length:", twilioAuthToken?.length);
    console.log("Token starts with:", twilioAuthToken?.substring(0, 4) + "...");
    console.log("Expected token start: 1d2a...");
    console.log(
      "All env vars keys:",
      Object.keys(process.env).filter((key) => key.includes("TWILIO")),
    );
    console.log("=== END DEBUG ===");

    if (!twilioSid || !twilioAuthToken) {
      console.error("Missing Twilio credentials");
      return res.status(500).json({
        message: "Twilio credentials not configured",
        balance: "0.00",
        currency: "USD",
        error: true,
      });
    }

    if (!twilioSid.startsWith("AC")) {
      console.error("Invalid Twilio SID format");
      return res.status(500).json({
        message: "Invalid Twilio SID format",
        balance: "0.00",
        currency: "USD",
        error: true,
      });
    }

    // Create Twilio client dynamically
    const client = twilio(twilioSid, twilioAuthToken);

    // Get real balance from Twilio API
    try {
      console.log("Attempting to fetch Twilio balance...");
      const balance = await client.balance.fetch();
      console.log("Successfully fetched balance:", balance.balance);

      res.json({
        balance: balance.balance,
        currency: balance.currency,
        lastUpdated: new Date().toISOString(),
      });
    } catch (twilioError: any) {
      console.error("Twilio API error:", {
        message: twilioError.message,
        code: twilioError.code,
        status: twilioError.status,
        moreInfo: twilioError.moreInfo,
      });

      // If Twilio API fails, return error but don't crash
      if (twilioError.code === 20003) {
        return res.status(401).json({
          message: "Twilio authentication failed - check credentials",
          balance: "0.00",
          currency: "USD",
          error: true,
          details: "Invalid Account SID or Auth Token",
        });
      }

      // For other errors, return a fallback
      res.json({
        balance: "0.00",
        currency: "USD",
        lastUpdated: new Date().toISOString(),
        error: true,
        message: twilioError.message || "Could not fetch balance",
      });
    }
  } catch (error: any) {
    console.error("Get Twilio balance error:", error);
    res.status(500).json({
      message: "Failed to fetch Twilio balance",
      error: error.message,
    });
  }
};
