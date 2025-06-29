import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Set mongoose options for better connection handling
    mongoose.set("strictQuery", false);

    // Check if already connected (important for serverless)
    if (mongoose.connection.readyState === 1) {
      console.log("🔄 Using existing MongoDB connection");
      return;
    }

    if (!process.env.DB_URL) {
      throw new Error("DB_URL environment variable is not set");
    }

    const conn = await mongoose.connect(process.env.DB_URL as string, {
      serverSelectionTimeoutMS: 10000, // 10s for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("🔗 Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 Mongoose disconnected");
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    console.error(
      "Connection URL:",
      process.env.DB_URL?.replace(/\/\/.*@/, "//***@"),
    ); // Hide credentials
    process.exit(1);
  }
};

export default connectDB;
