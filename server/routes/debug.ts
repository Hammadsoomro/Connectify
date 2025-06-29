import { Request, Response } from "express";
import User from "../models/User.js";
import PhoneNumber from "../models/PhoneNumber.js";
import Wallet from "../models/Wallet.js";

// Debug route to check deployment status
export const debugDeployment = async (req: Request, res: Response) => {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",

      // Environment variables check
      envVars: {
        twilioSid: !!process.env.TWILIO_SID,
        twilioAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        dbUrl: !!process.env.DB_URL,
        jwtSecret: !!process.env.JWT_SECRET,
      },

      // Twilio credentials (masked)
      twilio: {
        sid: process.env.TWILIO_SID
          ? `${process.env.TWILIO_SID.substring(0, 8)}...`
          : "NOT_SET",
        authToken: process.env.TWILIO_AUTH_TOKEN
          ? `${process.env.TWILIO_AUTH_TOKEN.substring(0, 8)}...`
          : "NOT_SET",
      },

      // Database check
      database: {
        connected: false,
        error: null,
      },

      // Data check
      data: {
        users: 0,
        phoneNumbers: 0,
        wallets: 0,
      },
    };

    // Check database connection
    try {
      const userCount = await User.countDocuments();
      const phoneCount = await PhoneNumber.countDocuments();
      const walletCount = await Wallet.countDocuments();

      checks.database.connected = true;
      checks.data.users = userCount;
      checks.data.phoneNumbers = phoneCount;
      checks.data.wallets = walletCount;
    } catch (dbError: any) {
      checks.database.error = dbError.message;
    }

    res.json({
      status: "ok",
      message: "Deployment debug information",
      checks,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Debug check failed",
      error: error.message,
    });
  }
};

// Test SMS configuration
export const testSMSConfig = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check user's phone numbers
    const phoneNumbers = await PhoneNumber.find({
      userId,
      status: "active",
    });

    // Check wallet
    const wallet = await Wallet.findOne({ userId });

    const smsConfig = {
      user: {
        id: userId,
        email: req.user.email,
        role: req.user.role,
      },
      phoneNumbers: phoneNumbers.map((p) => ({
        number: p.number,
        status: p.status,
        type: p.type,
      })),
      wallet: wallet
        ? {
            balance: wallet.balance,
            currency: wallet.currency,
            isActive: wallet.isActive,
          }
        : null,
      twilio: {
        configured: !!(process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN),
        sidMasked: process.env.TWILIO_SID
          ? `${process.env.TWILIO_SID.substring(0, 8)}...`
          : "NOT_SET",
      },
    };

    res.json({
      status: "ok",
      message: "SMS configuration check",
      config: smsConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "SMS config check failed",
      error: error.message,
    });
  }
};
