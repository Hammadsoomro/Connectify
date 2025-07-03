import { Request, Response } from "express";
import StripeService from "../services/stripeService.js";
import { addFunds } from "./wallet.js";

// Create payment intent for adding funds
export const createPaymentIntent = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount > 10000) {
      return res
        .status(400)
        .json({ message: "Maximum amount is $10,000 per transaction" });
    }

    // Create or get Stripe customer
    const customer = await StripeService.createCustomer(
      userEmail,
      req.user.name,
    );

    // Create payment intent
    const paymentIntent = await StripeService.createPaymentIntent(
      amount,
      "usd",
      {
        userId: userId.toString(),
        type: "wallet_topup",
        customerId: customer.id,
      },
    );

    res.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
};

// Create subscription for plan purchases
export const createSubscription = async (req: any, res: Response) => {
  try {
    const { planType, priceId } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    if (!planType || !priceId) {
      return res
        .status(400)
        .json({ message: "Plan type and price ID required" });
    }

    // Create or get Stripe customer
    const customer = await StripeService.createCustomer(
      userEmail,
      req.user.name,
    );

    // Create subscription
    const subscription = await StripeService.createSubscription(
      customer.id,
      priceId,
      {
        userId: userId.toString(),
        planType,
      },
    );

    res.json({
      subscriptionId: subscription.subscriptionId,
      clientSecret: subscription.clientSecret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ message: "Failed to create subscription" });
  }
};

// Confirm payment and add funds to wallet
export const confirmPayment = async (req: any, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user._id;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID required" });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment not completed",
        status: paymentIntent.status,
      });
    }

    // Verify the payment belongs to this user
    if (paymentIntent.metadata.userId !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized payment" });
    }

    // Add funds to wallet
    const amount = paymentIntent.amount / 100; // Convert from cents
    await addFunds(
      userId,
      amount,
      `Stripe payment: ${paymentIntentId}`,
      paymentIntentId,
    );

    res.json({
      message: "Payment confirmed and funds added to wallet",
      amount,
      paymentIntentId,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};

// Get customer's payment methods
export const getPaymentMethods = async (req: any, res: Response) => {
  try {
    const userEmail = req.user.email;

    // Get customer
    const customer = await StripeService.createCustomer(
      userEmail,
      req.user.name,
    );

    // Get payment methods
    const paymentMethods = await StripeService.getCustomerPaymentMethods(
      customer.id,
    );

    res.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            }
          : null,
      })),
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({ message: "Failed to retrieve payment methods" });
  }
};

// Handle Stripe webhooks
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ message: "Missing Stripe signature" });
    }

    // Process webhook
    const event = await StripeService.processWebhook(req.body, signature);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object.id);
        // Handle successful payment
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        // Handle failed payment
        break;

      case "invoice.payment_succeeded":
        console.log("Subscription payment succeeded:", event.data.object.id);
        // Handle successful subscription payment
        break;

      case "customer.subscription.deleted":
        console.log("Subscription cancelled:", event.data.object.id);
        // Handle subscription cancellation
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(400).json({ message: "Webhook processing failed" });
  }
};

// Create setup intent for saving payment methods
export const createSetupIntent = async (req: any, res: Response) => {
  try {
    const userEmail = req.user.email;

    // Create or get customer
    const customer = await StripeService.createCustomer(
      userEmail,
      req.user.name,
    );

    // Create setup intent
    const setupIntent = await StripeService.createSetupIntent(customer.id);

    res.json({
      clientSecret: setupIntent.clientSecret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Create setup intent error:", error);
    res.status(500).json({ message: "Failed to create setup intent" });
  }
};
