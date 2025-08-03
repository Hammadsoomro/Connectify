import axios from 'axios';

class SafePayService {
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly baseURL: string;

  constructor() {
    this.publicKey = process.env.SAFEPAY_PUBLIC_KEY || 'sec_9bad6514-f1ed-418b-9cf9-72feed720d21';
    this.secretKey = process.env.SAFEPAY_SECRET_KEY || '2532e8f296fb5f06e5c8ee9efdc8d9812f5521904d943379d9bbbb8c1e72bdc8';
    this.baseURL = 'https://api.safepay.pk/v1'; // SafePay API base URL
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  // Create payment intent
  async createPaymentIntent(amount: number, currency: string = 'PKR', metadata?: any) {
    try {
      const payload = {
        amount: Math.round(amount * 100), // SafePay expects amount in smallest currency unit
        currency: currency.toUpperCase(),
        metadata: metadata || {},
        capture_method: 'automatic',
      };

      const response = await axios.post(
        `${this.baseURL}/payment_intents`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        paymentIntent: response.data,
        clientSecret: response.data.client_secret,
      };
    } catch (error: any) {
      console.error('SafePay payment intent creation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment intent creation failed',
      };
    }
  }

  // Create payment session for hosted checkout
  async createPaymentSession(amount: number, currency: string = 'PKR', metadata?: any) {
    try {
      const payload = {
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        metadata: metadata || {},
      };

      const response = await axios.post(
        `${this.baseURL}/checkout/sessions`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        session: response.data,
        url: response.data.url,
      };
    } catch (error: any) {
      console.error('SafePay payment session creation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment session creation failed',
      };
    }
  }

  // Retrieve payment details
  async retrievePayment(paymentId: string) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        payment: response.data,
      };
    } catch (error: any) {
      console.error('SafePay payment retrieval failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment retrieval failed',
      };
    }
  }

  // Confirm payment
  async confirmPayment(paymentId: string, paymentMethodId?: string) {
    try {
      const payload: any = {};
      if (paymentMethodId) {
        payload.payment_method = paymentMethodId;
      }

      const response = await axios.post(
        `${this.baseURL}/payment_intents/${paymentId}/confirm`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        payment: response.data,
      };
    } catch (error: any) {
      console.error('SafePay payment confirmation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment confirmation failed',
      };
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, amount?: number) {
    try {
      const payload: any = {};
      if (amount) {
        payload.amount = Math.round(amount * 100);
      }

      const response = await axios.post(
        `${this.baseURL}/refunds`,
        { payment_intent: paymentId, ...payload },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        refund: response.data,
      };
    } catch (error: any) {
      console.error('SafePay refund failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Refund failed',
      };
    }
  }

  // Get account balance
  async getBalance() {
    try {
      const response = await axios.get(
        `${this.baseURL}/balance`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        balance: response.data,
      };
    } catch (error: any) {
      console.error('SafePay balance retrieval failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Balance retrieval failed',
      };
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
      
      return computedSignature === signature;
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      return false;
    }
  }

  // Process webhook event
  async processWebhookEvent(event: any) {
    try {
      console.log('Processing SafePay webhook event:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          console.log('Payment succeeded:', event.data);
          break;
        
        case 'payment_intent.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data);
          break;
        
        case 'payment_intent.canceled':
          // Handle canceled payment
          console.log('Payment canceled:', event.data);
          break;
        
        default:
          console.log('Unhandled event type:', event.type);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Webhook event processing failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SafePayService();
