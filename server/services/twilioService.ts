import twilio from "twilio";

// Messaging Service SID for better delivery and webhook reliability
const MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || "MG21589ec4b84e864";

// Create Twilio client dynamically to ensure env vars are available
function createTwilioClient() {
  const twilioSid = process.env.TWILIO_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!twilioSid || !twilioAuthToken) {
    throw new Error("Twilio credentials not configured in environment");
  }

  if (!twilioSid.startsWith("AC")) {
    throw new Error("Invalid Twilio Account SID format");
  }

  return twilio(twilioSid, twilioAuthToken);
}

export interface TwilioMessage {
  sid: string;
  body: string;
  from: string;
  to: string;
  status: string;
  dateCreated: Date;
}

export interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  lata?: string;
  rateCenter?: string;
}

class TwilioService {
  // Send SMS message
  async sendSMS(
    from: string,
    to: string,
    body: string,
  ): Promise<TwilioMessage> {
    try {
      // Create client dynamically
      const client = createTwilioClient();

      console.log(
        `Twilio Auth - SID: ${process.env.TWILIO_SID}, Token: ${process.env.TWILIO_AUTH_TOKEN?.substring(0, 8)}...`,
      );

      // Validate phone numbers
      if (!from || !to) {
        throw new Error("From and To phone numbers are required");
      }

      console.log(
        `Sending SMS from ${from} to ${to}: ${body.substring(0, 50)}...`,
      );

      // Use Messaging Service for better delivery and webhook handling
      const message = await client.messages.create({
        body,
        messagingServiceSid: MESSAGING_SERVICE_SID,
        to,
      });

      console.log(`SMS sent successfully. SID: ${message.sid}`);

      return {
        sid: message.sid,
        body: message.body,
        from: message.from,
        to: message.to,
        status: message.status,
        dateCreated: message.dateCreated,
      };
    } catch (error: any) {
      console.error("Error sending SMS:", error);

      // Handle specific Twilio errors
      if (
        error.code === 20003 ||
        error.message?.includes("authenticate") ||
        error.message?.includes("Authentication")
      ) {
        console.error("Twilio Authentication Failed:", {
          errorCode: error.code,
          errorMessage: error.message,
          sidProvided: !!process.env.TWILIO_SID,
          tokenProvided: !!process.env.TWILIO_AUTH_TOKEN,
          sidValue: process.env.TWILIO_SID?.substring(0, 8) + "...",
        });
        throw new Error(
          "Twilio authentication failed - Check your Account SID and Auth Token in environment variables",
        );
      } else if (error.code === 21211) {
        throw new Error("Invalid 'To' phone number");
      } else if (error.code === 21212) {
        throw new Error("Invalid 'From' phone number");
      } else if (error.code === 21608) {
        throw new Error("The number you are trying to message is unsubscribed");
      } else if (error.code === 21614) {
        throw new Error("'To' number is not a valid mobile number");
      } else {
        throw new Error(`Twilio error: ${error.message || error}`);
      }
    }
  }

  // Get available phone numbers for multiple countries
  async getAvailableNumbers(
    areaCode?: string,
    limit: number = 20,
    countryCode: string = "US",
  ): Promise<AvailableNumber[]> {
    try {
      const client = createTwilioClient();
      const availableNumbers = await client
        .availablePhoneNumbers(countryCode)
        .local.list({
          areaCode,
          limit,
          smsEnabled: true,
        });

      return availableNumbers.map((num) => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        lata: num.lata,
        rateCenter: num.rateCenter,
      }));
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      throw new Error(`Failed to fetch available numbers: ${error}`);
    }
  }

  // Get available numbers for multiple countries
  async getAvailableNumbersAllCountries(
    areaCode?: string,
    limit: number = 5,
  ): Promise<AvailableNumber[]> {
    const countries = ["US", "CA", "GB", "AU", "DE", "FR"];
    const allNumbers: AvailableNumber[] = [];

    for (const country of countries) {
      try {
        const numbers = await this.getAvailableNumbers(
          areaCode,
          limit,
          country,
        );
        allNumbers.push(...numbers);
      } catch (error) {
        console.error(`Error fetching numbers for ${country}:`, error);
        // Continue with other countries if one fails
      }
    }

    return allNumbers;
  }

  // Get Twilio account balance
  async getBalance(): Promise<{ balance: string; currency: string }> {
    try {
      const client = createTwilioClient();
      const balance = await client.balance.fetch();
      return {
        balance: balance.balance,
        currency: balance.currency,
      };
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error(`Failed to fetch balance: ${error}`);
    }
  }

  // Get available toll-free numbers
  async getAvailableTollFreeNumbers(
    limit: number = 10,
  ): Promise<AvailableNumber[]> {
    try {
      const client = createTwilioClient();
      const availableNumbers = await client
        .availablePhoneNumbers("US")
        .tollFree.list({
          limit,
          smsEnabled: true,
        });

      return availableNumbers.map((num) => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality || "United States",
        region: num.region || "US",
      }));
    } catch (error) {
      console.error("Error fetching toll-free numbers:", error);
      throw new Error(`Failed to fetch toll-free numbers: ${error}`);
    }
  }

  // Purchase a phone number
  async purchaseNumber(phoneNumber: string): Promise<any> {
    try {
      const client = createTwilioClient();
      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber,
        smsUrl: `${process.env.BASE_URL || "http://localhost:8080"}/api/twilio/webhook`,
        smsMethod: "POST",
      });

      return purchasedNumber;
    } catch (error) {
      console.error("Error purchasing number:", error);
      throw new Error(`Failed to purchase number: ${error}`);
    }
  }

  // Get message status
  async getMessageStatus(messageSid: string): Promise<string> {
    try {
      const client = createTwilioClient();
      const message = await client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      console.error("Error fetching message status:", error);
      throw new Error(`Failed to fetch message status: ${error}`);
    }
  }

  // Handle incoming webhook
  validateWebhook(signature: string, url: string, params: any): boolean {
    try {
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      if (!twilioAuthToken) {
        console.error("Twilio Auth Token not available for webhook validation");
        return false;
      }

      return twilio.validateRequest(twilioAuthToken, signature, url, params);
    } catch (error) {
      console.error("Error validating webhook:", error);
      return false;
    }
  }
}

export default new TwilioService();
