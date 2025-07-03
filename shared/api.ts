/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Wallet-related interfaces
 */
export interface WalletTransaction {
  _id?: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string;
  createdAt: string;
}

export interface WalletInfo {
  balance: number;
  currency: string;
  monthlyLimit?: number;
  isActive: boolean;
  transactions: WalletTransaction[];
}

export interface WalletStats {
  totalSpent: number;
  totalAdded: number;
  monthlySpending: number;
  transactionCount: number;
  currentBalance: number;
}

export interface AddFundsRequest {
  amount: number;
  paymentMethod?: string;
}

export interface AddFundsResponse {
  message: string;
  balance: number;
  transaction: WalletTransaction;
}
