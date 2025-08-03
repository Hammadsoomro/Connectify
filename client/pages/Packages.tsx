import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Star,
  Package,
  Zap,
  Crown,
  Rocket,
} from "lucide-react";
// SMSNavbar removed as requested
import AnimatedBackground from "@/components/AnimatedBackground";

const packages = [
  {
    name: "Starter",
    price: "$0",
    period: "/Forever",
    description: "Perfect for testing and small projects",
    features: [
      "100 SMS messages/month",
      "1 Phone number",
      "Basic support",
      "SMS delivery reports",
      "Contact management",
    ],
    popular: false,
    icon: Package,
    color: "border-gray-200 bg-gray-50 dark:bg-gray-800",
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/per month",
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
    icon: Zap,
    color: "border-primary scale-105 bg-primary/5 dark:bg-primary/10",
    buttonText: "Choose Plan",
    buttonVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/per month",
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
    popular: false,
    icon: Crown,
    color: "border-gray-200 bg-purple-50 dark:bg-purple-900/20",
    buttonText: "Choose Plan",
    buttonVariant: "outline" as const,
  },
];

export default function Packages() {
  const navigate = useNavigate();
  const [profile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    avatar: "",
    role: "admin",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <AnimatedBackground />

      {/* Navigation removed as requested */}

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                Choose Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-3">
                  Package
                </span>
              </h1>
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Select the perfect package for your SMS messaging needs. Scale up or down anytime with no long-term commitments.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card
                key={pkg.name}
                className={`relative border-2 hover:shadow-xl transition-all duration-300 ${pkg.color}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-2xl ${
                      pkg.popular
                        ? "bg-gradient-to-br from-blue-500 to-purple-600"
                        : "bg-gradient-to-br from-slate-500 to-slate-600"
                    }`}>
                      <pkg.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>

                  <div className="text-4xl font-bold text-primary mb-2">
                    {pkg.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      {pkg.period}
                    </span>
                  </div>

                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-6"
                    variant={pkg.buttonVariant}
                    size="lg"
                  >
                    {pkg.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  Why Choose Our Packages?
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-300">
                  All packages include our core features with no hidden fees
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      No Setup Fees
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Get started immediately with zero upfront costs
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Instant Activation
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Your package is activated immediately upon payment
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Scalable Solutions
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Upgrade or downgrade your package anytime
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Connectlify for their SMS messaging needs.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
                View Pricing Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
