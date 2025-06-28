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
      const message = await client.messages.create({
        body,
        from,
        to,
      });

      return {
        sid: message.sid,
        body: message.body,
        from: message.from,
        to: message.to,
        status: message.status,
        dateCreated: message.dateCreated,
      };
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error(`Failed to send SMS: ${error}`);
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
