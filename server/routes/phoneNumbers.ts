import { Request, Response } from "express";
import PhoneNumber from "../models/PhoneNumber.js";

// Get user's phone numbers
export const getPhoneNumbers = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    console.log(
      `Getting phone numbers for user: ${user.email}, role: ${user.role}`,
    );

    let phoneNumbers = [];

    if (user.role === "admin") {
      // Admin sees all their purchased numbers
      const adminNumbers = await PhoneNumber.find({ userId, status: "active" });
      phoneNumbers = adminNumbers.map((num) => ({
        id: num._id,
        number: num.number,
        isActive: num.isActive,
        location: num.location,
        type: num.type,
        status: num.status,
        isOwned: true,
      }));
      console.log(`Admin found ${phoneNumbers.length} phone numbers`);
    } else if (user.role === "sub-account") {
      console.log("Sub-account assigned numbers:", user.assignedNumbers);
      console.log("Sub-account admin ID:", user.adminId);

      // Sub-account sees only assigned numbers
      if (user.assignedNumbers && user.assignedNumbers.length > 0) {
        const assignedNumbers = await PhoneNumber.find({
          userId: user.adminId,
          number: { $in: user.assignedNumbers },
          status: "active",
        });

        phoneNumbers = assignedNumbers.map((num) => ({
          id: num._id,
          number: num.number,
          isActive: num.isActive,
          location: num.location,
          type: num.type,
          status: num.status,
          isOwned: false,
          isAssigned: true,
        }));
        console.log(
          `Sub-account found ${phoneNumbers.length} assigned phone numbers`,
        );
      } else {
        console.log("No assigned numbers found for sub-account");
      }
    }

    if (phoneNumbers.length === 0) {
      const message =
        user.role === "admin"
          ? "No phone numbers purchased yet"
          : "No phone numbers assigned to this account";
      console.log(message);
      return res.status(404).json({ message });
    }

    console.log(`Returning ${phoneNumbers.length} formatted phone numbers`);
    res.json(phoneNumbers);
  } catch (error) {
    console.error("Get phone numbers error:", error);
    res.status(500).json({ message: "Failed to fetch phone numbers" });
  }
};

// Set active phone number
export const setActiveNumber = async (req: any, res: Response) => {
  try {
    const { numberId } = req.params;
    const user = req.user;

    console.log(
      `Setting active number for user: ${user.email}, role: ${user.role}, numberId: ${numberId}`,
    );

    let phoneNumber;

    if (user.role === "admin") {
      // Admin can activate their own numbers
      await PhoneNumber.updateMany({ userId: user._id }, { isActive: false });

      phoneNumber = await PhoneNumber.findOneAndUpdate(
        { _id: numberId, userId: user._id },
        { isActive: true },
        { new: true },
      );
    } else if (user.role === "sub-account") {
      // Sub-account can only activate numbers assigned to them
      console.log("Sub-account assigned numbers:", user.assignedNumbers);

      // First, find the phone number to check if it's assigned to this sub-account
      const targetNumber = await PhoneNumber.findOne({
        _id: numberId,
        userId: user.adminId,
      });

      if (!targetNumber) {
        console.log("Phone number not found or not owned by admin");
        return res.status(404).json({ message: "Phone number not found" });
      }

      if (
        !user.assignedNumbers ||
        !user.assignedNumbers.includes(targetNumber.number)
      ) {
        console.log("Phone number not assigned to this sub-account");
        return res
          .status(403)
          .json({ message: "Phone number not assigned to your account" });
      }

      // Set all admin's numbers to inactive (for this specific sub-account usage)
      await PhoneNumber.updateMany(
        { userId: user.adminId },
        { isActive: false },
      );

      // Set the specific number to active
      phoneNumber = await PhoneNumber.findOneAndUpdate(
        { _id: numberId, userId: user.adminId },
        { isActive: true },
        { new: true },
      );
    }

    if (!phoneNumber) {
      console.log("Failed to update phone number active status");
      return res.status(404).json({ message: "Phone number not found" });
    }

    console.log(
      `Successfully set phone number ${phoneNumber.number} as active for user ${user.email}`,
    );

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
