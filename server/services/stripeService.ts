import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2024-06-20",
});

export class StripeService {
  /**
   * Create a payment intent for one-time payments
   */
  static async createPaymentIntent(
    amount: number,
    currency: string = "usd",
    metadata: Record<string, string> = {},
  ) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("Stripe payment intent creation error:", error);
      throw error;
    }
  }

  /**
   * Create a subscription for recurring payments
   */
  static async createSubscription(
    customerId: string,
    priceId: string,
    metadata: Record<string, string> = {},
  ) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata,
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent
          ?.client_secret,
      };
    } catch (error) {
      console.error("Stripe subscription creation error:", error);
      throw error;
    }
  }

  /**
   * Create or retrieve a customer
   */
  static async createCustomer(email: string, name: string) {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
      });

      return customer;
    } catch (error) {
      console.error("Stripe customer creation error:", error);
      throw error;
    }
  }

  /**
   * Retrieve payment intent status
   */
  static async getPaymentIntent(paymentIntentId: string) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error("Stripe payment intent retrieval error:", error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error("Stripe subscription cancellation error:", error);
      throw error;
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  static async createSetupIntent(customerId: string) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      };
    } catch (error) {
      console.error("Stripe setup intent creation error:", error);
      throw error;
    }
  }

  /**
   * List customer's payment methods
   */
  static async getCustomerPaymentMethods(customerId: string) {
    try {
      return await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });
    } catch (error) {
      console.error("Stripe payment methods retrieval error:", error);
      throw error;
    }
  }

  /**
   * Process webhook events
   */
  static async processWebhook(rawBody: Buffer, signature: string) {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error("Stripe webhook secret not configured");
      }

      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );

      return event;
    } catch (error) {
      console.error("Stripe webhook processing error:", error);
      throw error;
    }
  }

  /**
   * Create pricing products for subscriptions
   */
  static async createPricingProducts() {
    try {
      // Create products and prices for subscription plans
      const products = [
        {
          name: "Professional Plan",
          description: "Perfect for small to medium businesses",
          amount: 2900, // $29.00
          interval: "month",
        },
        {
          name: "Enterprise Plan",
          description: "For large organizations",
          amount: 9900, // $99.00
          interval: "month",
        },
      ];

      const createdProducts = [];

      for (const productData of products) {
        // Create product
        const product = await stripe.products.create({
          name: productData.name,
          description: productData.description,
        });

        // Create price
        const price = await stripe.prices.create({
          unit_amount: productData.amount,
          currency: "usd",
          recurring: { interval: productData.interval as any },
          product: product.id,
        });

        createdProducts.push({
          product,
          price,
        });
      }

      return createdProducts;
    } catch (error) {
      console.error("Stripe product creation error:", error);
      throw error;
    }
  }
}

export default StripeService;
