import Wallet from "../models/Wallet.js";
import PhoneNumber from "../models/PhoneNumber.js";
import User from "../models/User.js";

export class BillingService {
  /**
   * Process monthly charges for all admins
   * This should be called by a cron job or scheduled task
   */
  static async processMonthlyCharges() {
    try {
      console.log("Starting monthly billing process...");

      // Get all admin users
      const adminUsers = await User.find({ role: "admin", isActive: true });

      let processedCount = 0;
      let errorCount = 0;

      for (const admin of adminUsers) {
        try {
          await this.processAdminMonthlyCharges(admin._id.toString());
          processedCount++;
        } catch (error) {
          console.error(
            `Error processing charges for admin ${admin._id}:`,
            error,
          );
          errorCount++;
        }
      }

      console.log(
        `Monthly billing completed. Processed: ${processedCount}, Errors: ${errorCount}`,
      );

      return {
        success: true,
        processed: processedCount,
        errors: errorCount,
      };
    } catch (error) {
      console.error("Monthly billing process failed:", error);
      throw error;
    }
  }

  /**
   * Process monthly charges for a specific admin
   */
  static async processAdminMonthlyCharges(adminId: string) {
    // Get admin's phone numbers
    const phoneNumbers = await PhoneNumber.find({
      userId: adminId,
      status: "active",
    });

    if (phoneNumbers.length === 0) {
      console.log(`No active phone numbers for admin ${adminId}`);
      return;
    }

    // Calculate total monthly charges
    let totalCharges = 0;
    const chargeDetails: string[] = [];

    for (const phoneNumber of phoneNumbers) {
      let monthlyRate = 0;

      // Determine monthly rate based on number type
      if (phoneNumber.type === "toll-free") {
        monthlyRate = 2.0;
      } else {
        monthlyRate = 1.0;
      }

      totalCharges += monthlyRate;
      chargeDetails.push(`${phoneNumber.number}: $${monthlyRate.toFixed(2)}`);
    }

    if (totalCharges === 0) {
      console.log(`No charges to process for admin ${adminId}`);
      return;
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId: adminId });
    if (!wallet) {
      wallet = new Wallet({
        userId: adminId,
        balance: 0,
        currency: "USD",
        transactions: [],
      });
      await wallet.save();
    }

    // Check if admin has sufficient balance
    if (!wallet.hasBalance(totalCharges)) {
      console.log(
        `Insufficient balance for admin ${adminId}. Required: $${totalCharges}, Available: $${wallet.balance}`,
      );

      // Deactivate phone numbers if balance is insufficient
      await this.suspendServicesForAdmin(adminId);

      // Record the failed charge attempt
      wallet.transactions.push({
        type: "debit",
        amount: totalCharges,
        description: `Monthly charge failed - Insufficient balance (${chargeDetails.join(", ")})`,
        reference: `MONTHLY_FAILED_${Date.now()}`,
        createdAt: new Date(),
      });
      await wallet.save();

      throw new Error(
        `Insufficient balance for monthly charges: $${totalCharges}`,
      );
    }

    // Deduct monthly charges
    await wallet.deductFunds(
      totalCharges,
      `Monthly subscription charges (${chargeDetails.join(", ")})`,
      `MONTHLY_${Date.now()}`,
    );

    console.log(`Successfully charged admin ${adminId}: $${totalCharges}`);
  }

  /**
   * Suspend services for admin with insufficient balance
   */
  static async suspendServicesForAdmin(adminId: string) {
    try {
      // Mark phone numbers as suspended
      await PhoneNumber.updateMany(
        { userId: adminId, status: "active" },
        { status: "suspended" },
      );

      console.log(
        `Services suspended for admin ${adminId} due to insufficient balance`,
      );
    } catch (error) {
      console.error(`Error suspending services for admin ${adminId}:`, error);
    }
  }

  /**
   * Reactivate services for admin (when they add funds)
   */
  static async reactivateServicesForAdmin(adminId: string) {
    try {
      // Check if admin has sufficient balance for at least one month
      const wallet = await Wallet.findOne({ userId: adminId });
      if (!wallet) return;

      const phoneNumbers = await PhoneNumber.find({
        userId: adminId,
        status: "suspended",
      });

      let totalMonthlyCharges = 0;
      for (const phoneNumber of phoneNumbers) {
        if (phoneNumber.type === "toll-free") {
          totalMonthlyCharges += 2.0;
        } else {
          totalMonthlyCharges += 1.0;
        }
      }

      if (wallet.hasBalance(totalMonthlyCharges)) {
        // Reactivate phone numbers
        await PhoneNumber.updateMany(
          { userId: adminId, status: "suspended" },
          { status: "active" },
        );

        console.log(`Services reactivated for admin ${adminId}`);
      }
    } catch (error) {
      console.error(`Error reactivating services for admin ${adminId}:`, error);
    }
  }

  /**
   * Get billing summary for an admin
   */
  static async getAdminBillingSummary(adminId: string) {
    const [phoneNumbers, wallet] = await Promise.all([
      PhoneNumber.find({
        userId: adminId,
        status: { $in: ["active", "suspended"] },
      }),
      Wallet.findOne({ userId: adminId }),
    ]);

    let totalMonthlyCharges = 0;
    const phoneNumberCharges = phoneNumbers.map((phoneNumber) => {
      const monthlyRate = phoneNumber.type === "toll-free" ? 2.0 : 1.0;
      totalMonthlyCharges += monthlyRate;

      return {
        number: phoneNumber.number,
        type: phoneNumber.type,
        status: phoneNumber.status,
        monthlyRate,
      };
    });

    return {
      phoneNumbers: phoneNumberCharges,
      totalMonthlyCharges,
      currentBalance: wallet?.balance || 0,
      canCoverNextMonth: wallet?.hasBalance(totalMonthlyCharges) || false,
      daysUntilNextBilling: this.getDaysUntilNextBilling(),
    };
  }

  /**
   * Calculate days until next billing cycle
   */
  static getDaysUntilNextBilling(): number {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeDiff = nextMonth.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}

export default BillingService;
