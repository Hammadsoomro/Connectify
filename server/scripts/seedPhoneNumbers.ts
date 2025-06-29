import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import PhoneNumber from "../models/PhoneNumber.js";
import connectDB from "../db/connection.js";

// Load environment variables
dotenv.config();

const phoneNumbersToSeed = [
  {
    number: "+19032705603",
    twilioSid: "PN_seed_19032705603",
    location: "Dallas, TX",
    type: "local" as const,
    price: "$1.00/month",
  },
  {
    number: "+16138017161",
    twilioSid: "PN_seed_16138017161",
    location: "Ottawa, ON",
    type: "local" as const,
    price: "$1.00/month",
  },
  {
    number: "+15878573620",
    twilioSid: "PN_seed_15878573620",
    location: "Calgary, AB",
    type: "local" as const,
    price: "$1.00/month",
  },
];

async function seedPhoneNumbers() {
  try {
    // Connect to database
    await connectDB();

    // Find the first admin user (assuming this is your account)
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.error(
        "No admin user found. Please create an admin account first.",
      );
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);

    // Check if numbers already exist
    const existingNumbers = await PhoneNumber.find({
      number: { $in: phoneNumbersToSeed.map((p) => p.number) },
    });

    if (existingNumbers.length > 0) {
      console.log("Some phone numbers already exist:");
      existingNumbers.forEach((num) => {
        console.log(`- ${num.number} (Status: ${num.status})`);
      });

      // Update existing numbers to be active and associated with admin
      await PhoneNumber.updateMany(
        { number: { $in: phoneNumbersToSeed.map((p) => p.number) } },
        {
          userId: adminUser._id,
          status: "active",
          isActive: false,
        },
      );
      console.log(
        "Updated existing numbers to be associated with admin account",
      );
    }

    // Add new numbers that don't exist
    for (const phoneData of phoneNumbersToSeed) {
      const existingNumber = await PhoneNumber.findOne({
        number: phoneData.number,
      });

      if (!existingNumber) {
        const newPhoneNumber = new PhoneNumber({
          userId: adminUser._id,
          number: phoneData.number,
          twilioSid: phoneData.twilioSid,
          isActive: false,
          location: phoneData.location,
          country: "United States",
          type: phoneData.type,
          price: phoneData.price,
          status: "active",
          purchasedAt: new Date(),
        });

        await newPhoneNumber.save();
        console.log(`Added phone number: ${phoneData.number}`);
      }
    }

    // Update user's phoneNumbers array
    const userPhoneNumbers = phoneNumbersToSeed.map((p) => p.number);
    await User.findByIdAndUpdate(adminUser._id, {
      $addToSet: {
        phoneNumbers: { $each: userPhoneNumbers },
      },
    });

    console.log("✅ Successfully seeded phone numbers for admin account");
    console.log(`Admin: ${adminUser.email}`);
    console.log("Phone numbers:");
    phoneNumbersToSeed.forEach((phone) => {
      console.log(`- ${phone.number} (${phone.location})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding phone numbers:", error);
    process.exit(1);
  }
}

// Run the seeding script
seedPhoneNumbers();
