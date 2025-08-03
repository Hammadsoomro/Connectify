import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PhoneNumber from "../models/PhoneNumber.js";

// Create sub-account (Admin only)
export const createSubAccount = async (req: any, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const adminId = req.user._id;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create sub-accounts" });
    }

    // Check sub-account limit (max 3)
    const subAccountCount = await User.countDocuments({ adminId });
    if (subAccountCount >= 3) {
      return res
        .status(400)
        .json({ message: "Maximum 3 sub-accounts allowed per admin" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create sub-account
    const subAccount = new User({
      name,
      email,
      password: hashedPassword,
      role: "sub-account",
      adminId,
    });

    await subAccount.save();

    // Add to admin's sub-accounts list
    await User.findByIdAndUpdate(adminId, {
      $push: { subAccounts: subAccount._id },
    });

    res.status(201).json({
      id: subAccount._id,
      name: subAccount.name,
      email: subAccount.email,
      role: subAccount.role,
      isActive: subAccount.isActive,
      assignedNumbers: subAccount.assignedNumbers,
    });
  } catch (error) {
    console.error("Create sub-account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sub-accounts (Admin only)
export const getSubAccounts = async (req: any, res: Response) => {
  try {
    const adminId = req.user._id;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view sub-accounts" });
    }

    const subAccounts = await User.find({ adminId })
      .select("-password")
      .sort({ createdAt: -1 });

    // Get wallet balances for each sub-account
    const Wallet = (await import("../models/Wallet.js")).default;
    const subAccountsWithWallet = await Promise.all(
      subAccounts.map(async (account) => {
        const wallet = await Wallet.findOne({ userId: account._id });
        return {
          ...account.toObject(),
          walletBalance: wallet ? wallet.balance : 0,
        };
      })
    );

    res.json(subAccountsWithWallet);
  } catch (error) {
    console.error("Get sub-accounts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign phone number to sub-account (Admin only)
export const assignNumberToSubAccount = async (req: any, res: Response) => {
  try {
    const { subAccountId, phoneNumberId } = req.body;
    const adminId = req.user._id;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can assign numbers" });
    }

    console.log(`Assign number request - subAccountId: ${subAccountId}, phoneNumberId: ${phoneNumberId}, adminId: ${adminId}`);

    // Check if phoneNumberId is actually a phone number string or ObjectId
    let phoneNumber;
    if (phoneNumberId.startsWith('+')) {
      // It's a phone number string, find by number
      phoneNumber = await PhoneNumber.findOne({
        number: phoneNumberId,
        userId: adminId,
        status: "active",
      });
    } else {
      // It's an ObjectId, find by _id
      phoneNumber = await PhoneNumber.findOne({
        _id: phoneNumberId,
        userId: adminId,
        status: "active",
      });
    }

    if (!phoneNumber) {
      console.log(`Phone number not found: ${phoneNumberId}`);
      return res
        .status(404)
        .json({ message: "Phone number not found or not owned by admin" });
    }

    // Verify the sub-account belongs to the admin
    const subAccount = await User.findOne({
      _id: subAccountId,
      adminId,
      role: "sub-account",
    });

    if (!subAccount) {
      console.log(`Sub-account not found: ${subAccountId}`);
      return res.status(404).json({ message: "Sub-account not found" });
    }

    // Check if number is already assigned
    if (subAccount.assignedNumbers?.includes(phoneNumber.number)) {
      return res
        .status(400)
        .json({ message: "Number already assigned to this sub-account" });
    }

    // Assign the number
    await User.findByIdAndUpdate(subAccountId, {
      $addToSet: { assignedNumbers: phoneNumber.number }, // Use $addToSet to avoid duplicates
    });

    console.log(`Successfully assigned number ${phoneNumber.number} to sub-account ${subAccount.name}`);
    res.json({ message: "Number assigned successfully" });
  } catch (error) {
    console.error("Assign number error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove number assignment (Admin only)
export const removeNumberAssignment = async (req: any, res: Response) => {
  try {
    const { subAccountId, phoneNumber } = req.body;
    const adminId = req.user._id;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can remove number assignments" });
    }

    // Verify the sub-account belongs to the admin
    const subAccount = await User.findOne({
      _id: subAccountId,
      adminId,
      role: "sub-account",
    });

    if (!subAccount) {
      return res.status(404).json({ message: "Sub-account not found" });
    }

    // Remove the number assignment
    await User.findByIdAndUpdate(subAccountId, {
      $pull: { assignedNumbers: phoneNumber },
    });

    res.json({ message: "Number assignment removed successfully" });
  } catch (error) {
    console.error("Remove assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Deactivate sub-account (Admin only)
export const deactivateSubAccount = async (req: any, res: Response) => {
  try {
    const { subAccountId } = req.params;
    const adminId = req.user._id;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can deactivate sub-accounts" });
    }

    // Verify the sub-account belongs to the admin
    const subAccount = await User.findOne({
      _id: subAccountId,
      adminId,
      role: "sub-account",
    });

    if (!subAccount) {
      return res.status(404).json({ message: "Sub-account not found" });
    }

    // Deactivate the sub-account
    await User.findByIdAndUpdate(subAccountId, { isActive: false });

    res.json({ message: "Sub-account deactivated successfully" });
  } catch (error) {
    console.error("Deactivate sub-account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const adminId = req.user._id;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view dashboard" });
    }

    const [subAccountCount, phoneNumberCount, activeSubAccounts] =
      await Promise.all([
        User.countDocuments({ adminId }),
        PhoneNumber.countDocuments({ userId: adminId, status: "active" }),
        User.countDocuments({ adminId, isActive: true }),
      ]);

    res.json({
      subAccounts: {
        total: subAccountCount,
        active: activeSubAccounts,
        limit: 3,
        remaining: Math.max(0, 3 - subAccountCount),
      },
      phoneNumbers: phoneNumberCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
