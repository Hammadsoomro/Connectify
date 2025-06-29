import { Response } from "express";

// Get Twilio account balance
export const getTwilioBalance = async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view Twilio balance" });
    }

    // For demo purposes, return a mock balance
    // In production, you would call the Twilio API:
    // const twilioClient = require('twilio')(accountSid, authToken);
    // const balance = await twilioClient.balance.fetch();

    const mockBalance = {
      balance: "42.50",
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    };

    res.json(mockBalance);
  } catch (error) {
    console.error("Get Twilio balance error:", error);
    res.status(500).json({ message: "Failed to fetch Twilio balance" });
  }
};
