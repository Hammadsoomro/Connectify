import { Request, Response } from "express";

// Debug endpoint to check environment variables (remove in production)
export const debugEnvironment = async (req: Request, res: Response) => {
  try {
    const twilioSid = process.env.TWILIO_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    res.json({
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      twilioDebug: {
        sidExists: !!twilioSid,
        sidValue: twilioSid || "NOT_SET",
        sidLength: twilioSid?.length || 0,
        sidValid: twilioSid?.startsWith("AC") || false,
        tokenExists: !!twilioAuthToken,
        tokenLength: twilioAuthToken?.length || 0,
        tokenStart: twilioAuthToken?.substring(0, 8) + "..." || "NOT_SET",
        expectedTokenStart: "1d2a0665...",
        isNewToken: twilioAuthToken?.startsWith("1d2a0665") || false,
      },
      allTwilioVars: Object.keys(process.env).filter((key) =>
        key.toUpperCase().includes("TWILIO"),
      ),
      deploymentPlatform: {
        netlify: !!process.env.NETLIFY,
        vercel: !!process.env.VERCEL,
        railway: !!process.env.RAILWAY_ENVIRONMENT,
        fly: !!process.env.FLY_APP_NAME,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
};
