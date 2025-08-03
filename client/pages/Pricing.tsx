import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Check,
  CreditCard,
  DollarSign,
  Globe,
  MessageSquare,
  Phone,
  Star,
  Zap,
} from "lucide-react";
import SMSNavbar from "@/components/SMSNavbar";
import ApiService from "@/services/api";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

// Pricing plans moved to separate Packages page

const countryPricing = [
  { country: "🇺🇸 United States", local: "$2.50" },
  { country: "🇨🇦 Canada", local: "$2.50" },
  { country: "🇬🇧 United Kingdom", local: "$3.00" },
  { country: "🇦🇺 Australia", local: "$3.85" },
  { country: "🇩🇪 Germany", local: "$3.75" },
  { country: "🇫🇷 France", local: "$3.95" },
];

const smsPricing = [
  { country: "🇺🇸 United States", price: "$0.01" },
  { country: "🇨🇦 Canada", price: "$0.01" },
  { country: "🇬🇧 United Kingdom", price: "$0.03" },
  { country: "🇦🇺 Australia", price: "$0.08" },
  { country: "🇩🇪 Germany", price: "$0.07" },
  { country: "🇫🇷 France", price: "$0.09" },
];

// Initialize Stripe (use your publishable key)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null; // Will use demo payment mode if Stripe is not configured
export default function Pricing() {
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    if (plan.price !== "$0") {
      setShowPaymentDialog(true);
    } else {
      // Handle free plan activation
      handleFreePlan();
    }
  };

  const handleFreePlan = async () => {
    try {
      // Add free credits to wallet
      await ApiService.addFunds(10.0, "free-plan-bonus");
      alert("Free plan activated! $10 credit added to your wallet.");
    } catch (error) {
      console.error("Error activating free plan:", error);
      alert("Error activating free plan. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !paymentAmount) return;

    setIsProcessing(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe is not configured. Please use Demo Payment mode.");
        setPaymentMethod("demo");
        setIsProcessing(false);
        return;
      }

      const amount = parseFloat(paymentAmount);
      if (amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      // Create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret } = await response.json();

      // Redirect to Stripe Checkout or use Stripe Elements
      const { error } = await stripe.redirectToCheckout({
        // You can also use Stripe Elements for inline payment form
        sessionId: clientSecret, // This would be a checkout session ID in a real implementation
      });

      if (error) {
        console.error("Stripe error:", error);
        alert("Payment failed: " + error.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!paymentAmount) return;

    try {
      const amount = parseFloat(paymentAmount);
      if (amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      // For demo purposes, directly add funds (in production, this would go through Stripe)
      await ApiService.addFunds(amount, "demo-payment");
      alert(`Successfully added $${amount} to your wallet!`);

      setShowPaymentDialog(false);
      setSelectedPlan(null);
      setPaymentAmount("");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <SMSNavbar
        unreadCount={0}
        phoneNumbers={[]}
        activeNumber={null}
        profile={{ name: "", email: "", avatar: "", role: "admin" }}
        onSelectNumber={() => {}}
        onBuyNewNumber={() => navigate("/buy-numbers")}
        onUpdateProfile={() => {}}
        onLogout={() => {
          ApiService.logout();
          navigate("/");
        }}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Transparent
            <span className="text-primary"> Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your SMS messaging needs. No hidden
            fees, no long-term contracts.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 hover:shadow-xl transition-all duration-300 ${
                plan.popular ? "border-primary scale-105" : "border-gray-200"
              } ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <div className="text-4xl font-bold text-primary mb-2">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.price === "$0" ? "Get Started Free" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Phone Number Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Phone Number Pricing
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Monthly Phone Number Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {countryPricing.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="font-medium">{item.country}</span>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Local: <span className="font-bold">{item.local}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Toll-free:{" "}
                        <span className="font-bold">{item.tollFree}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMS Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            SMS Pricing by Region
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Per Message Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {smsPricing.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="font-medium">{item.region}</span>
                    <span className="font-bold text-primary">{item.price}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-semibold mb-2">How does billing work?</h3>
              <p className="text-muted-foreground text-sm">
                You pay monthly for phone numbers and per-message for SMS.
                Credits are deducted from your wallet automatically.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, PayPal, and bank transfers for
                enterprise customers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! The Starter plan is completely free forever with 100 SMS
                messages per month.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <>
                  Subscribe to <strong>{selectedPlan.name}</strong> plan for{" "}
                  <strong>
                    {selectedPlan.price}/{selectedPlan.period}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Add (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="50.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1"
                max="10000"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPlan?.name === "Professional" &&
                  "Recommended: $50 for Professional plan"}
                {selectedPlan?.name === "Enterprise" &&
                  "Recommended: $200 for Enterprise plan"}
                {!selectedPlan?.name.includes("Professional") &&
                  !selectedPlan?.name.includes("Enterprise") &&
                  "Minimum: $1, Maximum: $10,000"}
              </p>
            </div>

            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  variant={paymentMethod === "demo" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("demo")}
                  className="justify-start"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Demo Payment
                </Button>
              </div>
            </div>

            {paymentMethod === "card" && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Real Stripe Integration</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to Stripe's secure payment page to
                  complete your transaction.
                </p>
              </div>
            )}

            {paymentMethod === "demo" && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>Demo Mode</strong>
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This will add funds directly to your wallet for testing
                  purposes. In production, all payments go through Stripe.
                </p>
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Button
                className="w-full"
                onClick={
                  paymentMethod === "card" ? handlePayment : handleDirectPayment
                }
                disabled={isProcessing || !paymentAmount}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {paymentMethod === "card"
                      ? "Pay with Stripe"
                      : "Add Funds (Demo)"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
