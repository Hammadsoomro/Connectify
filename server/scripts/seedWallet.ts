import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import connectDB from "../db/connection.js";

// Load environment variables
dotenv.config();

async function seedWallet() {
  try {
    // Connect to database
    await connectDB();

    // Find the first admin user
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.error(
        "No admin user found. Please create an admin account first.",
      );
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);

    // Check if wallet already exists
    let wallet = await Wallet.findOne({ userId: adminUser._id });

    if (wallet) {
      console.log(
        `Wallet already exists with balance: $${wallet.balance.toFixed(2)}`,
      );
    } else {
      // Create new wallet with initial funds
      wallet = new Wallet({
        userId: adminUser._id,
        balance: 50.0, // Start with $50
        currency: "USD",
        transactions: [
          {
            type: "credit",
            amount: 50.0,
            description: "Initial wallet setup",
            reference: `INITIAL_${Date.now()}`,
            createdAt: new Date(),
          },
        ],
        isActive: true,
      });

      await wallet.save();
      console.log("✅ Created new wallet with $50.00 initial balance");
    }

    console.log(`Final wallet balance: $${wallet.balance.toFixed(2)}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding wallet:", error);
    process.exit(1);
  }
}

// Run the seeding script
seedWallet();
