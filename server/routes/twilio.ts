import { Response } from "express";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Get Twilio account balance
export const getTwilioBalance = async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view Twilio balance" });
    }

    // Get real balance from Twilio API
    try {
      const balance = await client.balance.fetch();

      res.json({
        balance: balance.balance,
        currency: balance.currency,
        lastUpdated: new Date().toISOString(),
      });
    } catch (twilioError: any) {
      console.error("Twilio API error:", twilioError);

      // If Twilio API fails, return error but don't crash
      if (twilioError.code === 20003) {
        return res.status(401).json({
          message: "Twilio authentication failed - check credentials",
          balance: "0.00",
          currency: "USD",
          error: true,
        });
      }

      // For other errors, return a fallback
      res.json({
        balance: "0.00",
        currency: "USD",
        lastUpdated: new Date().toISOString(),
        error: true,
        message: "Could not fetch balance",
      });
    }
  } catch (error) {
    console.error("Get Twilio balance error:", error);
    res.status(500).json({ message: "Failed to fetch Twilio balance" });
  }
};
