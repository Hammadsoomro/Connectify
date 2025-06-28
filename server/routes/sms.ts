import { Request, Response } from "express";
import twilioService from "../services/twilioService.js";
import Message from "../models/Message.js";
import Contact from "../models/Contact.js";
import PhoneNumber from "../models/PhoneNumber.js";

// Send SMS message
export const sendSMS = async (req: any, res: Response) => {
  try {
    const { contactId, content, fromNumber } = req.body;
    const userId = req.user._id;

    // Get contact
    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Verify user owns the from number
    const phoneNumber = await PhoneNumber.findOne({
      userId,
      number: fromNumber,
      status: "active",
    });
    if (!phoneNumber) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Send via Twilio
    const twilioMessage = await twilioService.sendSMS(
      fromNumber,
      contact.phoneNumber,
      content,
    );

    // Save to database
    const message = new Message({
      userId,
      contactId,
      content,
      isOutgoing: true,
      twilioSid: twilioMessage.sid,
      fromNumber,
      toNumber: contact.phoneNumber,
      status: "sent",
      type: "text",
    });

    await message.save();

    res.json({
      id: message._id,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      isOutgoing: true,
      status: "sent",
      type: "text",
    });
  } catch (error) {
    console.error("Send SMS error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a contact
export const getMessages = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({ userId, contactId })
      .sort({ createdAt: 1 })
      .limit(100);

    const formattedMessages = messages.map((msg) => ({
      id: msg._id,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      isOutgoing: msg.isOutgoing,
      status: msg.status,
      type: msg.type,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Handle incoming Twilio webhook
export const handleIncomingSMS = async (req: Request, res: Response) => {
  try {
    const { From, To, Body, MessageSid } = req.body;

    // Find the user who owns this phone number
    const phoneNumber = await PhoneNumber.findOne({ number: To });
    if (!phoneNumber) {
      return res.status(404).send("Phone number not found");
    }

    // Find or create contact
    let contact = await Contact.findOne({
      userId: phoneNumber.userId,
      phoneNumber: From,
    });

    if (!contact) {
      contact = new Contact({
        userId: phoneNumber.userId,
        name: From, // Use phone number as name initially
        phoneNumber: From,
        isOnline: false,
      });
      await contact.save();
    }

    // Save message
    const message = new Message({
      userId: phoneNumber.userId,
      contactId: contact._id,
      content: Body,
      isOutgoing: false,
      twilioSid: MessageSid,
      fromNumber: From,
      toNumber: To,
      status: "delivered",
      type: "text",
    });

    await message.save();

    // Respond to Twilio
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
};

// Get available numbers for purchase
export const getAvailableNumbers = async (req: Request, res: Response) => {
  try {
    const { areaCode } = req.query;

    const [localNumbers, tollFreeNumbers] = await Promise.all([
      twilioService.getAvailableNumbers(areaCode as string, 15),
      twilioService.getAvailableTollFreeNumbers(5),
    ]);

    const formattedNumbers = [
      ...localNumbers.map((num) => ({
        id: `local_${num.phoneNumber}`,
        number: num.phoneNumber,
        location: `${num.locality}, ${num.region}`,
        country: "United States",
        type: "Local",
        price: "$1.00/month",
        features: ["SMS", "MMS"],
        provider: "Twilio",
      })),
      ...tollFreeNumbers.map((num) => ({
        id: `tollfree_${num.phoneNumber}`,
        number: num.phoneNumber,
        location: "United States",
        country: "United States",
        type: "Toll-Free",
        price: "$2.00/month",
        features: ["SMS", "MMS"],
        provider: "Twilio",
      })),
    ];

    res.json(formattedNumbers);
  } catch (error) {
    console.error("Get available numbers error:", error);
    res.status(500).json({ message: "Failed to fetch available numbers" });
  }
};

// Purchase a phone number
export const purchaseNumber = async (req: any, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id;

    // Purchase via Twilio
    const twilioNumber = await twilioService.purchaseNumber(phoneNumber);

    // Save to database
    const purchasedNumber = new PhoneNumber({
      userId,
      number: phoneNumber,
      twilioSid: twilioNumber.sid,
      isActive: false,
      location: twilioNumber.friendlyName || "United States",
      type:
        phoneNumber.includes("844") || phoneNumber.includes("833")
          ? "toll-free"
          : "local",
      price:
        phoneNumber.includes("844") || phoneNumber.includes("833")
          ? "$2.00/month"
          : "$1.00/month",
      status: "active",
    });

    await purchasedNumber.save();

    // Update user's phone numbers
    await User.findByIdAndUpdate(userId, {
      $push: { phoneNumbers: phoneNumber },
    });

    res.json({
      id: purchasedNumber._id,
      number: purchasedNumber.number,
      isActive: false,
      location: purchasedNumber.location,
      type: purchasedNumber.type,
      status: "active",
    });
  } catch (error) {
    console.error("Purchase number error:", error);
    res.status(500).json({ message: "Failed to purchase number" });
  }
};
