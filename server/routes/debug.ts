import { Request, Response } from "express";
import twilio from "twilio";

// Debug endpoint to test Twilio credentials
export const testTwilioCredentials = async (req: Request, res: Response) => {
  try {
    console.log("Testing Twilio credentials...");
    console.log("TWILIO_SID:", process.env.TWILIO_SID?.substring(0, 8) + "...");
    console.log("TWILIO_AUTH_TOKEN exists:", !!process.env.TWILIO_AUTH_TOKEN);

    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    // Test 1: Get account info
    console.log("Testing account fetch...");
    const account = await client.api.accounts(process.env.TWILIO_SID).fetch();

    // Test 2: Get balance
    console.log("Testing balance fetch...");
    const balance = await client.balance.fetch();

    // Test 3: List phone numbers
    console.log("Testing phone numbers list...");
    const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 5 });

    res.json({
      success: true,
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
      },
      balance: {
        balance: balance.balance,
        currency: balance.currency,
      },
      phoneNumbers: phoneNumbers.map((num) => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        smsUrl: num.smsUrl,
      })),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL,
      },
    });
  } catch (error: any) {
    console.error("Twilio test error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.moreInfo || error.details,
      credentials: {
        sidProvided: !!process.env.TWILIO_SID,
        tokenProvided: !!process.env.TWILIO_AUTH_TOKEN,
        sidFormat: process.env.TWILIO_SID?.startsWith("AC")
          ? "valid"
          : "invalid",
      },
    });
  }
};

// Test webhook endpoint
export const testWebhook = async (req: Request, res: Response) => {
  try {
    console.log("Webhook test received:");
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Query:", req.query);

    res.json({
      success: true,
      message: "Webhook endpoint is working",
      received: {
        method: req.method,
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Webhook test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update phone number webhook URLs
export const updateWebhookUrls = async (req: Request, res: Response) => {
  try {
    const { webhookUrl } = req.body;
    const targetUrl =
      webhookUrl || "https://connectlify.netlify.app/api/twilio/webhook";

    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    // Get all phone numbers
    const phoneNumbers = await client.incomingPhoneNumbers.list();

    const updatePromises = phoneNumbers.map(async (number) => {
      try {
        const updated = await client.incomingPhoneNumbers(number.sid).update({
          smsUrl: targetUrl,
          smsMethod: "POST",
        });

        return {
          phoneNumber: number.phoneNumber,
          sid: number.sid,
          success: true,
          newSmsUrl: updated.smsUrl,
        };
      } catch (error: any) {
        return {
          phoneNumber: number.phoneNumber,
          sid: number.sid,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Updated webhook URLs for ${results.length} phone numbers`,
      targetUrl,
      results,
    });
  } catch (error: any) {
    console.error("Update webhook URLs error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
