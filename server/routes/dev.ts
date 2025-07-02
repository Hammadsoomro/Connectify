import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PhoneNumber from "../models/PhoneNumber.js";
import { generateToken } from "../middleware/auth.js";

// Development helper to create admin user
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" });
    }

    const {
      email = "admin@connectify.com",
      password = "admin123",
      name = "Admin User",
    } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = "admin";
      await existingAdmin.save();

      const token = generateToken(existingAdmin._id.toString());

      return res.json({
        message: "Admin user updated",
        token,
        user: {
          id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    // Generate token
    const token = generateToken(adminUser._id.toString());

    res.status(201).json({
      message: "Admin user created successfully",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Failed to create admin user" });
  }
};

// Development helper to reset all data
export const resetDatabase = async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" });
    }

    // You can uncomment these lines if you want to reset all data
    // await User.deleteMany({});
    // await Contact.deleteMany({});
    // await Message.deleteMany({});
    // await PhoneNumber.deleteMany({});

    res.json({
      message: "Database reset completed (commented out for safety)",
    });
  } catch (error) {
    console.error("Reset database error:", error);
    res.status(500).json({ message: "Failed to reset database" });
  }
};

// Development helper to add phone numbers to admin
export const addPhoneNumbers = async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" });
    }

    const phoneNumbers = ["+16138017161", "+15878573620", "+19032705603"];

    // Find admin user
    const adminUser = await User.findOne({ email: "admin@connectify.com" });
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    console.log(`Found admin user: ${adminUser.email} (ID: ${adminUser._id})`);

    const addedNumbers = [];

    // Add phone numbers
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i];

      // Check if phone number already exists
      const existingPhone = await PhoneNumber.findOne({ number: phoneNumber });
      if (existingPhone) {
        console.log(`Phone number ${phoneNumber} already exists, skipping...`);
        continue;
      }

      // Create new phone number
      const newPhoneNumber = new PhoneNumber({
        userId: adminUser._id,
        number: phoneNumber,
        twilioSid: `PN${Date.now()}${i}`, // Generate fake Twilio SID
        isActive: i === 0, // Make first number active
        location: "North America",
        country: "United States",
        type: "local",
        price: "$1.00",
        status: "active",
        purchasedAt: new Date(),
      });

      await newPhoneNumber.save();
      addedNumbers.push(phoneNumber);
      console.log(`✅ Added phone number: ${phoneNumber} (Active: ${i === 0})`);
    }

    res.json({
      message: "Phone numbers added successfully",
      addedNumbers,
      totalNumbers: addedNumbers.length,
    });
  } catch (error) {
    console.error("Add phone numbers error:", error);
    res.status(500).json({ message: "Failed to add phone numbers" });
  }
};
