import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = "hammadsoomro810@gmail.com";
const ADMIN_NAME = "Hammad Soomro";
const ADMIN_PASSWORD = "admin123"; // You can change this after first login

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL as string, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = "admin";
      existingAdmin.adminId = undefined; // Remove adminId if it exists
      await existingAdmin.save();
      console.log(`✅ Updated existing user ${ADMIN_EMAIL} to admin role`);
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      const adminUser = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isActive: true,
        phoneNumbers: [],
        subAccounts: [],
      });

      await adminUser.save();
      console.log(`✅ Created new admin user: ${ADMIN_EMAIL}`);
      console.log(`📧 Email: ${ADMIN_EMAIL}`);
      console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
      console.log("⚠️  Please change the password after first login");
    }

    console.log("🎉 Admin setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seed function
seedAdmin();
