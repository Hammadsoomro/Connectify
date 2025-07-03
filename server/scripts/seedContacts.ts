import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Contact from "../models/Contact.js";
import connectDB from "../db/connection.js";

// Load environment variables
dotenv.config();

async function seedContacts() {
  try {
    // Connect to database
    await connectDB();

    // Find the admin user
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.error(
        "No admin user found. Please create an admin account first.",
      );
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);

    // Check if contacts already exist
    const existingContacts = await Contact.find({ userId: adminUser._id });

    if (existingContacts.length > 0) {
      console.log(`Admin already has ${existingContacts.length} contacts:`);
      existingContacts.forEach((contact) => {
        console.log(`- ${contact.name}: ${contact.phoneNumber}`);
      });
      process.exit(0);
    }

    // Create test contacts
    const testContacts = [
      {
        name: "Test Contact",
        phoneNumber: "+1234567890",
      },
      {
        name: "John Doe",
        phoneNumber: "+1555123456",
      },
    ];

    for (const contactData of testContacts) {
      const contact = new Contact({
        userId: adminUser._id,
        name: contactData.name,
        phoneNumber: contactData.phoneNumber,
        isOnline: false,
      });

      await contact.save();
      console.log(
        `Added contact: ${contactData.name} (${contactData.phoneNumber})`,
      );
    }

    console.log("✅ Successfully seeded test contacts for admin account");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding contacts:", error);
    process.exit(1);
  }
}

// Run the seeding script
seedContacts();
