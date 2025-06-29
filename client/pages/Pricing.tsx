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

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "Forever",
    description: "Perfect for testing and small projects",
    features: [
      "100 SMS messages/month",
      "1 Phone number",
      "Basic support",
      "SMS delivery reports",
      "Contact management",
    ],
    color: "bg-gray-50 dark:bg-gray-800",
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "Ideal for small to medium businesses",
    features: [
      "5,000 SMS messages/month",
      "5 Phone numbers",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Webhook integrations",
      "Custom sender IDs",
    ],
    popular: true,
    color: "bg-primary/5 dark:bg-primary/10",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For large organizations and high-volume usage",
    features: [
      "Unlimited SMS messages",
      "Unlimited phone numbers",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantees",
      "Advanced security",
      "White-label options",
      "Custom billing",
    ],
    color: "bg-purple-50 dark:bg-purple-900/20",
  },
];

const countryPricing = [
  { country: "🇺🇸 United States", local: "$1.00", tollFree: "$2.00" },
  { country: "🇨🇦 Canada", local: "$1.50", tollFree: "$3.00" },
  { country: "🇬🇧 United Kingdom", local: "$1.80", tollFree: "$3.50" },
  { country: "🇦🇺 Australia", local: "$2.00", tollFree: "$4.00" },
  { country: "🇩🇪 Germany", local: "$1.60", tollFree: "$3.20" },
  { country: "🇫🇷 France", local: "$1.70", tollFree: "$3.40" },
];

const smsPricing = [
  { region: "North America", price: "$0.0075" },
  { region: "Europe", price: "$0.0090" },
  { region: "Asia Pacific", price: "$0.0120" },
  { region: "Latin America", price: "$0.0150" },
  { region: "Africa", price: "$0.0200" },
  { region: "Middle East", price: "$0.0180" },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    email: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      // In a real application, you would integrate with Stripe, PayPal, etc.
      // For demo purposes, we'll simulate payment processing

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful payment
      const planAmount = parseInt(selectedPlan.price.replace("$", ""));

      // Add credits to wallet based on plan
      let creditAmount = 0;
      if (selectedPlan.name === "Professional") {
        creditAmount = 50.0; // $50 credit for Professional plan
      } else if (selectedPlan.name === "Enterprise") {
        creditAmount = 200.0; // $200 credit for Enterprise plan
      }

      if (creditAmount > 0) {
        await ApiService.addFunds(
          creditAmount,
          `${selectedPlan.name}-plan-purchase`,
        );
      }

      alert(
        `Payment successful! ${selectedPlan.name} plan activated. $${creditAmount} credit added to your wallet.`,
      );

      setShowPaymentDialog(false);
      setSelectedPlan(null);
      setPaymentForm({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        name: "",
        email: "",
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
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
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, cvv: e.target.value }))
                  }
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={paymentForm.name}
                onChange={(e) =>
                  setPaymentForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={paymentForm.email}
                onChange={(e) =>
                  setPaymentForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="pt-4 space-y-2">
              <Button
                className="w-full"
                onClick={handlePayment}
                disabled={
                  isProcessing ||
                  !paymentForm.cardNumber ||
                  !paymentForm.expiryDate ||
                  !paymentForm.cvv ||
                  !paymentForm.name ||
                  !paymentForm.email
                }
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pay {selectedPlan?.price}
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
