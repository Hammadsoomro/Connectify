import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import PhoneNumber from "../models/PhoneNumber.js";

// Load environment variables
dotenv.config();

const phoneNumbers = ["+1 613 801 7161", "+1 587 857 3620", "+1 903 270 5603"];

async function addPhoneNumbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    // Find admin user
    const adminUser = await User.findOne({ email: "admin@connectify.com" });
    if (!adminUser) {
      console.log("Admin user not found");
      return;
    }

    console.log(`Found admin user: ${adminUser.email} (ID: ${adminUser._id})`);

    // Add phone numbers
    for (let i = 0; i < phoneNumbers.length; i++) {
      const phoneNumber = phoneNumbers[i];
      const cleanNumber = phoneNumber.replace(/\s+/g, ""); // Remove spaces

      // Check if phone number already exists
      const existingPhone = await PhoneNumber.findOne({ number: cleanNumber });
      if (existingPhone) {
        console.log(`Phone number ${cleanNumber} already exists, skipping...`);
        continue;
      }

      // Create new phone number
      const newPhoneNumber = new PhoneNumber({
        userId: adminUser._id,
        number: cleanNumber,
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
      console.log(`✅ Added phone number: ${cleanNumber} (Active: ${i === 0})`);
    }

    console.log("\n🎉 All phone numbers added successfully!");
  } catch (error) {
    console.error("Error adding phone numbers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

addPhoneNumbers();
