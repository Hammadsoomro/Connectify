import mongoose, { Document, Schema } from "mongoose";

export interface IPhoneNumber extends Document {
  userId: mongoose.Types.ObjectId;
  number: string;
  twilioSid: string;
  isActive: boolean;
  location: string;
  country: string;
  type: "local" | "toll-free";
  price: string;
  status: "active" | "inactive" | "pending";
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneNumberSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    twilioSid: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "United States",
    },
    type: {
      type: String,
      enum: ["local", "toll-free"],
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
PhoneNumberSchema.index({ userId: 1 });
PhoneNumberSchema.index({ number: 1 });
PhoneNumberSchema.index({ twilioSid: 1 });

export default mongoose.model<IPhoneNumber>("PhoneNumber", PhoneNumberSchema);
