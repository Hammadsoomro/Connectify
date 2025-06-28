import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Set mongoose options for better connection handling
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.DB_URL as string, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
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
