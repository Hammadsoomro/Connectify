import { Request, Response } from "express";
import SafePayService from "../services/safepayService.js";
import { addFunds } from "./wallet.js";

// Create payment intent for adding funds
export const createPaymentIntent = async (req: any, res: Response) => {
  try {
    const { amount, currency = 'PKR' } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount > 500000) { // 500k PKR limit
      return res
        .status(400)
        .json({ message: "Maximum amount is PKR 500,000 per transaction" });
    }

    // Create SafePay payment intent
    const paymentIntent = await SafePayService.createPaymentIntent(
      amount,
      currency,
      { 
        userId: userId.toString(),
        type: "wallet_topup",
        userEmail: req.user.email
      }
    );

    if (!paymentIntent.success) {
      return res.status(400).json({ message: paymentIntent.error });
    }

    res.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntent?.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

// Create payment session for hosted checkout
export const createPaymentSession = async (req: any, res: Response) => {
  try {
    const { amount, currency = 'PKR' } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount > 500000) { // 500k PKR limit
      return res
        .status(400)
        .json({ message: "Maximum amount is PKR 500,000 per transaction" });
    }

    // Create SafePay checkout session
    const session = await SafePayService.createPaymentSession(
      amount, 
      currency,
      { 
        userId: userId.toString(),
        type: "wallet_topup",
        userEmail: req.user.email
      }
    );

    if (!session.success) {
      return res.status(400).json({ message: session.error });
    }

    res.json({
      sessionId: session.session?.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Payment session creation error:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

// Confirm payment and add funds to wallet
export const confirmPayment = async (req: any, res: Response) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user._id;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID required" });
    }

    // Retrieve payment from SafePay
    const paymentResult = await SafePayService.retrievePayment(paymentId);

    if (!paymentResult.success) {
      return res.status(400).json({ message: paymentResult.error });
    }

    const payment = paymentResult.payment;

    if (payment.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment not completed",
        status: payment.status,
      });
    }

    // Verify the payment belongs to this user
    if (payment.metadata?.userId !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized payment" });
    }

    // Add funds to wallet
    const amount = payment.amount / 100; // Convert from smallest currency unit
    await addFunds(
      userId,
      amount,
      `SafePay payment: ${paymentId}`,
      paymentId,
    );

    res.json({
      message: "Payment confirmed and funds added to wallet",
      amount,
      paymentId,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};

// Handle SafePay webhooks
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers["safepay-signature"] as string;
    const body = req.body;

    if (!sig) {
      return res.status(400).json({ message: "Missing signature" });
    }

    // Validate webhook signature
    const isValid = SafePayService.validateWebhookSignature(
      JSON.stringify(body),
      sig,
      process.env.SAFEPAY_WEBHOOK_SECRET || ""
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Process the event
    const result = await SafePayService.processWebhookEvent(body);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

// Get SafePay account balance
export const getAccountBalance = async (req: any, res: Response) => {
  try {
    const balanceResult = await SafePayService.getBalance();

    if (!balanceResult.success) {
      return res.status(400).json({ message: balanceResult.error });
    }

    res.json({
      balance: balanceResult.balance,
    });
  } catch (error) {
    console.error("Get account balance error:", error);
    res.status(500).json({ message: "Failed to retrieve account balance" });
  }
};

// Refund payment
export const refundPayment = async (req: any, res: Response) => {
  try {
    const { paymentId, amount } = req.body;
    const userId = req.user._id;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID required" });
    }

    // Only admins can process refunds
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can process refunds" });
    }

    const refundResult = await SafePayService.refundPayment(paymentId, amount);

    if (!refundResult.success) {
      return res.status(400).json({ message: refundResult.error });
    }

    res.json({
      message: "Refund processed successfully",
      refund: refundResult.refund,
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
};
