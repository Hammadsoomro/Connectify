import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction {
  _id?: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string; // For tracking purchases, SMS, etc.
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  transactions: ITransaction[];
  monthlyLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const WalletSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "PKR"],
    },
    transactions: [TransactionSchema],
    monthlyLimit: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for better query performance
WalletSchema.index({ userId: 1 }, { unique: true });
WalletSchema.index({ "transactions.createdAt": -1 });

// Methods to add/subtract balance with transaction recording
WalletSchema.methods.addFunds = function (
  amount: number,
  description: string,
  reference?: string,
) {
  this.balance += amount;
  this.transactions.push({
    type: "credit",
    amount,
    description,
    reference,
    createdAt: new Date(),
  });
  return this.save();
};

WalletSchema.methods.deductFunds = function (
  amount: number,
  description: string,
  reference?: string,
) {
  if (this.balance < amount) {
    throw new Error("Insufficient balance");
  }
  this.balance -= amount;
  this.transactions.push({
    type: "debit",
    amount,
    description,
    reference,
    createdAt: new Date(),
  });
  return this.save();
};

WalletSchema.methods.hasBalance = function (amount: number): boolean {
  return this.balance >= amount;
};

export default mongoose.models.Wallet ||
  mongoose.model<IWallet>("Wallet", WalletSchema);
