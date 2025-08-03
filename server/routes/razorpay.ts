import { Request, Response } from "express";
import RazorpayService from "../services/razorpayService.js";
import { addFunds } from "./wallet.js";

// Create Razorpay order
export const createRazorpayOrder = async (req: any, res: Response) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount > 100000) { // 1 lakh INR limit
      return res
        .status(400)
        .json({ message: "Maximum amount is INR 1,00,000 per transaction" });
    }

    // Create Razorpay order
    const orderResult = await RazorpayService.createOrder(
      amount,
      currency,
      `wallet_${userId}_${Date.now()}`
    );

    if (!orderResult.success) {
      return res.status(400).json({ message: orderResult.error });
    }

    res.json({
      orderId: orderResult.orderId,
      amount: amount,
      currency: currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};

// Verify and confirm payment
export const verifyRazorpayPayment = async (req: any, res: Response) => {
  try {
    const { 
      razorpay_order_id,
      razorpay_payment_id, 
      razorpay_signature,
      amount 
    } = req.body;
    const userId = req.user._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    // Verify payment signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get payment details from Razorpay
    const paymentResult = await RazorpayService.getPayment(razorpay_payment_id);
    
    if (!paymentResult.success) {
      return res.status(400).json({ message: paymentResult.error });
    }

    const payment = paymentResult.payment;

    // Verify payment status
    if (payment.status !== 'captured') {
      return res.status(400).json({ 
        message: "Payment not completed", 
        status: payment.status 
      });
    }

    // Add funds to wallet
    const amountInRupees = payment.amount / 100; // Convert from paise
    await addFunds(
      userId,
      amountInRupees,
      `Razorpay payment: ${razorpay_payment_id}`,
      razorpay_payment_id,
    );

    res.json({
      message: "Payment verified and funds added to wallet",
      amount: amountInRupees,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

// Handle Razorpay webhooks
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = req.body;

    if (!signature) {
      return res.status(400).json({ message: "Missing Razorpay signature" });
    }

    // Process the webhook event
    const result = await RazorpayService.processWebhookEvent(body, signature);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

// Get Razorpay configuration for frontend
export const getRazorpayConfig = async (req: Request, res: Response) => {
  try {
    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      currency: 'INR',
    });
  } catch (error) {
    console.error("Razorpay config error:", error);
    res.status(500).json({ message: "Failed to get payment configuration" });
  }
};
