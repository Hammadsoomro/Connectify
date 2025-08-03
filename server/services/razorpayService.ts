import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  private razorpay: any;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
    });
  }

  // Create order for payment
  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        receipt: receipt || `order_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await this.razorpay.orders.create(options);
      
      return {
        success: true,
        order: order,
        orderId: order.id,
      };
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      return {
        success: false,
        error: error.message || 'Order creation failed',
      };
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
      const body = orderId + '|' + paymentId;
      
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Payment signature verification failed:', error);
      return false;
    }
  }

  // Get payment details
  async getPayment(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      
      return {
        success: true,
        payment: payment,
      };
    } catch (error: any) {
      console.error('Payment fetch failed:', error);
      return {
        success: false,
        error: error.message || 'Payment fetch failed',
      };
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundData: any = {};
      if (amount) {
        refundData.amount = amount * 100; // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      
      return {
        success: true,
        refund: refund,
      };
    } catch (error: any) {
      console.error('Refund failed:', error);
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }

  // Process webhook event
  async processWebhookEvent(event: any, signature: string) {
    try {
      // Verify webhook signature
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(event))
        .digest('hex');

      if (expectedSignature !== signature) {
        return { success: false, error: 'Invalid signature' };
      }

      // Handle different event types
      switch (event.event) {
        case 'payment.captured':
          console.log('Payment captured:', event.payload.payment.entity);
          break;
        
        case 'payment.failed':
          console.log('Payment failed:', event.payload.payment.entity);
          break;
        
        case 'order.paid':
          console.log('Order paid:', event.payload.order.entity);
          break;
        
        default:
          console.log('Unhandled event type:', event.event);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Webhook processing failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new RazorpayService();
