import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phoneNumbers: string[];
  role: "admin" | "sub-account";
  adminId?: mongoose.Types.ObjectId; // For sub-accounts, reference to admin
  subAccounts?: mongoose.Types.ObjectId[]; // For admins, list of sub-accounts
  assignedNumbers?: string[]; // Numbers assigned by admin to sub-account
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    phoneNumbers: [
      {
        type: String,
        trim: true,
      },
    ],
    role: {
      type: String,
      enum: ["admin", "sub-account"],
      default: "admin", // First user becomes admin by default
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role === "sub-account";
      },
    },
    subAccounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedNumbers: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Email index already created by unique: true option

export default mongoose.model<IUser>("User", UserSchema);
