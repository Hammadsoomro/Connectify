import { Request, Response } from "express";
import twilioService from "../services/twilioService.js";
import Message from "../models/Message.js";
import Contact from "../models/Contact.js";
import PhoneNumber from "../models/PhoneNumber.js";
import { deductFunds, checkBalance } from "./wallet.js";

// Helper function to map region codes to country names
const getCountryFromRegion = (region: string): string => {
  const countryMap: { [key: string]: string } = {
    US: "United States",
    CA: "Canada",
    GB: "United Kingdom",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
  };
  return countryMap[region] || region;
};

// Send SMS message
export const sendSMS = async (req: any, res: Response) => {
  try {
    const { contactId, content, fromNumber } = req.body;
    const user = req.user;

    // For sub-accounts, use admin's userId for contact lookup
    const lookupUserId = user.role === "sub-account" ? user.adminId : user._id;

    console.log(
      `SMS Request - User: ${user.email} (${user.role}), Contact: ${contactId}, From: ${fromNumber}, LookupUserId: ${lookupUserId}`,
    );

    // Get contact using appropriate userId
    const contact = await Contact.findOne({
      _id: contactId,
      userId: lookupUserId,
    });
    if (!contact) {
      console.log(`Contact not found: ${contactId} for userId ${lookupUserId}`);
      return res.status(404).json({ message: "Contact not found" });
    }

    console.log(`Found contact: ${contact.name} (${contact.phoneNumber})`);

    // Prevent sending message to the same number (self-messaging)
    if (contact.phoneNumber === fromNumber) {
      return res.status(400).json({
        message:
          "Cannot send message to the same phone number you're sending from",
        code: "SELF_MESSAGE_NOT_ALLOWED",
      });
    }

    let canUseNumber = false;
    let phoneNumber = null;

    if (user.role === "admin") {
      // Admin can use any of their purchased numbers
      phoneNumber = await PhoneNumber.findOne({
        userId: lookupUserId,
        number: fromNumber,
        status: "active",
      });
      canUseNumber = !!phoneNumber;
      console.log(
        `Admin phone number check: ${fromNumber} - ${canUseNumber ? "Found" : "Not found"}`,
      );
      if (phoneNumber) {
        console.log(
          `Phone number details: ${phoneNumber.number} (${phoneNumber.status})`,
        );
      }
    } else if (user.role === "sub-account") {
      // Sub-account can only use assigned numbers
      if (user.assignedNumbers && user.assignedNumbers.includes(fromNumber)) {
        // Verify the number still exists and belongs to their admin
        phoneNumber = await PhoneNumber.findOne({
          userId: user.adminId,
          number: fromNumber,
          status: "active",
        });
        canUseNumber = !!phoneNumber;
      }
    }

    if (!canUseNumber) {
      if (user.role === "admin") {
        // Check if admin has any numbers at all
        const adminNumbers = await PhoneNumber.countDocuments({
          userId: lookupUserId,
          status: "active",
        });

        if (adminNumbers === 0) {
          return res.status(400).json({
            message: "Please buy a phone number first to send SMS messages",
            code: "NO_PHONE_NUMBER",
          });
        } else {
          return res.status(400).json({
            message: "Invalid phone number selected",
            code: "INVALID_NUMBER",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "No phone number assigned to your account. Contact your admin to assign a number.",
          code: "NO_ASSIGNED_NUMBER",
        });
      }
    }

    // Check wallet balance for admin users (SMS cost: $0.01 per message)
    const smsPrice = 0.01;
    if (user.role === "admin") {
      const hasBalance = await checkBalance(userId, smsPrice);
      if (!hasBalance) {
        return res.status(400).json({
          message:
            "Insufficient wallet balance. Please add funds to continue sending SMS.",
          code: "INSUFFICIENT_BALANCE",
          requiredAmount: smsPrice,
        });
      }
    }

    // Send via Twilio
    const twilioMessage = await twilioService.sendSMS(
      fromNumber,
      contact.phoneNumber,
      content,
    );

    // Save to database using correct userId
    const message = new Message({
      userId: lookupUserId,
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

    // Deduct SMS cost from admin's wallet (always use admin for billing)
    const billingUserId = user.role === "sub-account" ? user.adminId : user._id;
    try {
      await deductFunds(
        billingUserId,
        smsPrice,
        `SMS sent to ${contact.phoneNumber} by ${user.email}`,
        `SMS_${twilioMessage.sid}`,
      );
    } catch (walletError) {
      console.error("Wallet deduction error:", walletError);
      // Message already sent, but wallet deduction failed
      // Could implement compensating action here if needed
    }

    res.json({
      id: message._id,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      isOutgoing: true,
      status: "sent",
      type: "text",
    });
  } catch (error: any) {
    console.error("Send SMS error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send message";
    let statusCode = 500;

    if (error.message?.includes("To' and 'From' number cannot be the same")) {
      errorMessage =
        "Cannot send message to the same phone number you're sending from.";
      statusCode = 400;
    } else if (error.message?.includes("Twilio")) {
      errorMessage = "SMS service unavailable. Please try again later.";
      statusCode = 503;
    } else if (error.message?.includes("Wallet")) {
      errorMessage = "Wallet error. Please check your balance.";
      statusCode = 400;
    } else if (error.message?.includes("balance")) {
      errorMessage = "Insufficient wallet balance. Please add funds.";
      statusCode = 400;
    } else if (error.message?.includes("not found")) {
      errorMessage = "Contact or phone number not found.";
      statusCode = 404;
    } else if (error.code === 11000) {
      errorMessage = "Duplicate message detected.";
      statusCode = 409;
    }

    res.status(statusCode).json({
      message: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get messages for a contact filtered by phone number
export const getMessages = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const { phoneNumber } = req.query;
    const user = req.user;

    // For sub-accounts, use admin's userId for message lookup
    const messageUserId = user.role === "sub-account" ? user.adminId : user._id;

    // Build query to filter by contact and phone number (MUST include phone number for isolation)
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number is required for message filtering" });
    }

    const messageQuery = {
      userId: messageUserId,
      contactId,
      $or: [{ fromNumber: phoneNumber }, { toNumber: phoneNumber }],
    };

    const messages = await Message.find(messageQuery)
      .sort({ createdAt: 1 })
      .limit(100);

    const formattedMessages = messages.map((msg) => ({
      id: msg._id,
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      isOutgoing: msg.isOutgoing,
      status: msg.status,
      type: msg.type,
      fromNumber: msg.fromNumber,
      toNumber: msg.toNumber,
    }));

    console.log(
      `Retrieved ${formattedMessages.length} messages for contact ${contactId} on phone ${phoneNumber}`,
    );

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

    // Increment unread count for the contact
    await Contact.findByIdAndUpdate(
      contact._id,
      { $inc: { unreadCount: 1 } },
      { new: true },
    );

    console.log(
      `Incoming SMS saved and unread count incremented for contact: ${contact.name}`,
    );

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

    // Get numbers from all supported countries
    const allNumbers = await twilioService.getAvailableNumbersAllCountries(
      areaCode as string,
    );

    const formattedNumbers = allNumbers.map((num) => ({
      id: `number_${num.phoneNumber.replace(/\D/g, "")}`,
      number: num.phoneNumber,
      location: `${num.locality}, ${num.region}`,
      country: getCountryFromRegion(num.region),
      type: "Local",
      price: "$1.00/month",
      features: ["SMS", "MMS"],
      provider: "Twilio",
    }));

    res.json(formattedNumbers);
  } catch (error) {
    console.error("Get available numbers error:", error);
    res.status(500).json({ message: "Failed to fetch available numbers" });
  }
};

// Purchase a phone number (Admin only)
export const purchaseNumber = async (req: any, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin accounts can purchase phone numbers",
        code: "ADMIN_ONLY",
      });
    }

    // Determine price based on number type
    const isTollFree =
      phoneNumber.includes("844") ||
      phoneNumber.includes("833") ||
      phoneNumber.includes("800") ||
      phoneNumber.includes("888") ||
      phoneNumber.includes("877") ||
      phoneNumber.includes("866");
    const setupCost = isTollFree ? 2.0 : 1.0; // One-time setup cost
    const monthlyPrice = isTollFree ? 2.0 : 1.0; // Monthly cost

    // Check wallet balance for setup cost
    const hasBalance = await checkBalance(userId, setupCost);
    if (!hasBalance) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Phone number setup requires $${setupCost.toFixed(2)}. Please add funds to your wallet.`,
        code: "INSUFFICIENT_BALANCE",
        requiredAmount: setupCost,
      });
    }

    // Purchase via Twilio
    const twilioNumber = await twilioService.purchaseNumber(phoneNumber);

    // Save to database
    const purchasedNumber = new PhoneNumber({
      userId,
      number: phoneNumber,
      twilioSid: twilioNumber.sid,
      isActive: false,
      location: twilioNumber.friendlyName || "United States",
      type: isTollFree ? "toll-free" : "local",
      price: `$${monthlyPrice.toFixed(2)}/month`,
      status: "active",
    });

    await purchasedNumber.save();

    // Deduct setup cost from wallet
    await deductFunds(
      userId,
      setupCost,
      `Phone number purchase: ${phoneNumber}`,
      `PHONE_${twilioNumber.sid}`,
    );

    // Update user's phone numbers
    const User = await import("../models/User.js").then((m) => m.default);
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
      pricePaid: setupCost,
      monthlyPrice: monthlyPrice,
    });
  } catch (error) {
    console.error("Purchase number error:", error);

    // Check if it's a wallet error
    if (error.message === "Insufficient balance") {
      return res.status(400).json({
        message: "Insufficient wallet balance for phone number purchase",
        code: "INSUFFICIENT_BALANCE",
      });
    }

    res.status(500).json({ message: "Failed to purchase number" });
  }
};
