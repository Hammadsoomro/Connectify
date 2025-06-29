import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

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
      // Validate Twilio credentials
      if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.error("Missing Twilio credentials:", {
          sidExists: !!process.env.TWILIO_SID,
          tokenExists: !!process.env.TWILIO_AUTH_TOKEN,
          nodeEnv: process.env.NODE_ENV,
        });
        throw new Error("Twilio credentials not configured in environment");
      }

      // Validate credential format
      if (!process.env.TWILIO_SID.startsWith("AC")) {
        throw new Error("Invalid Twilio Account SID format");
      }

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

      const message = await client.messages.create({
        body,
        from,
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
      if (error.code === 21211) {
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

  // Get available phone numbers
  async getAvailableNumbers(
    areaCode?: string,
    limit: number = 20,
  ): Promise<AvailableNumber[]> {
    try {
      const availableNumbers = await client
        .availablePhoneNumbers("US")
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

  // Get available toll-free numbers
  async getAvailableTollFreeNumbers(
    limit: number = 10,
  ): Promise<AvailableNumber[]> {
    try {
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
      return twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN as string,
        signature,
        url,
        params,
      );
    } catch (error) {
      console.error("Error validating webhook:", error);
      return false;
    }
  }
}

export default new TwilioService();
