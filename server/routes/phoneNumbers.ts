import { Request, Response } from "express";
import PhoneNumber from "../models/PhoneNumber.js";

// Get user's phone numbers
export const getPhoneNumbers = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const phoneNumbers = await PhoneNumber.find({ userId, status: "active" });

    const formattedNumbers = phoneNumbers.map((num) => ({
      id: num._id,
      number: num.number,
      isActive: num.isActive,
      location: num.location,
      type: num.type,
      status: num.status,
    }));

    res.json(formattedNumbers);
  } catch (error) {
    console.error("Get phone numbers error:", error);
    res.status(500).json({ message: "Failed to fetch phone numbers" });
  }
};

// Set active phone number
export const setActiveNumber = async (req: any, res: Response) => {
  try {
    const { numberId } = req.params;
    const userId = req.user._id;

    // Set all numbers to inactive
    await PhoneNumber.updateMany({ userId }, { isActive: false });

    // Set selected number to active
    const phoneNumber = await PhoneNumber.findOneAndUpdate(
      { _id: numberId, userId },
      { isActive: true },
      { new: true },
    );

    if (!phoneNumber) {
      return res.status(404).json({ message: "Phone number not found" });
    }

    res.json({
      id: phoneNumber._id,
      number: phoneNumber.number,
      isActive: true,
    });
  } catch (error) {
    console.error("Set active number error:", error);
    res.status(500).json({ message: "Failed to set active number" });
  }
};

// Release phone number
export const releaseNumber = async (req: any, res: Response) => {
  try {
    const { numberId } = req.params;
    const userId = req.user._id;

    const phoneNumber = await PhoneNumber.findOne({ _id: numberId, userId });
    if (!phoneNumber) {
      return res.status(404).json({ message: "Phone number not found" });
    }

    // Update status to inactive (keeping for history)
    phoneNumber.status = "inactive";
    await phoneNumber.save();

    res.json({ message: "Phone number released successfully" });
  } catch (error) {
    console.error("Release number error:", error);
    res.status(500).json({ message: "Failed to release number" });
  }
};
