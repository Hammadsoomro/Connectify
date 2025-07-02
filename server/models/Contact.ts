import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phoneNumber: string;
  avatar?: string;
  associatedPhoneNumbers: string[]; // Array of phone numbers this contact is associated with
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
    associatedPhoneNumbers: {
      type: [String],
      default: [],
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
