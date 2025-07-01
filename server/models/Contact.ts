import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user-specific contact lookups
ContactSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

export default mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema);
