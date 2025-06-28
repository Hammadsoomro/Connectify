import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  content: string;
  isOutgoing: boolean;
  twilioSid?: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  fromNumber: string;
  toNumber: string;
  type: "text" | "image" | "file";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isOutgoing: {
      type: Boolean,
      required: true,
    },
    twilioSid: {
      type: String,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read", "failed"],
      default: "sending",
    },
    fromNumber: {
      type: String,
      required: true,
    },
    toNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
MessageSchema.index({ userId: 1, contactId: 1, createdAt: -1 });
MessageSchema.index({ twilioSid: 1 }, { sparse: true });

export default mongoose.model<IMessage>("Message", MessageSchema);
