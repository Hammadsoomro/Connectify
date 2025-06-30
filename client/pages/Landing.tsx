import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Phone,
  Globe,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Login from "./Login";

interface LandingProps {
  onLoginSuccess: () => void;
}

const messagingQuotes = [
  {
    text: "The art of communication is the language of leadership.",
    author: "James Humes",
  },
  {
    text: "Communication works for those who work at it.",
    author: "John Powell",
  },
  {
    text: "To effectively communicate, we must realize that we are all different.",
    author: "Tony Robbins",
  },
  {
    text: "Good communication is the bridge between confusion and clarity.",
    author: "Nat Turner",
  },
];

export default function Landing({ onLoginSuccess }: LandingProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % messagingQuotes.length);
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              Connectify
            </h1>
          </div>

          {/* Login/Signup Buttons */}
          <div className="flex items-center gap-3">
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button variant="ghost">Login</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Welcome Back</DialogTitle>
                  <DialogDescription>
                    Sign in to your Connectify account
                  </DialogDescription>
                </DialogHeader>
                <Login
                  onLoginSuccess={() => {
                    setShowLogin(false);
                    onLoginSuccess();
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button>Sign Up</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Account</DialogTitle>
                  <DialogDescription>
                    Join Connectify and start messaging
                  </DialogDescription>
                </DialogHeader>
                <Login
                  onLoginSuccess={() => {
                    onLoginSuccess();
                  }}
                  isSignUp={true}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <img
              src="https://images.pexels.com/photos/4031818/pexels-photo-4031818.jpeg"
              alt="Global Communication"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Professional SMS Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Connect with
            <span className="text-primary"> Anyone</span>
            <br />
            Anywhere
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Professional SMS messaging platform with real-time conversations,
            global reach, and enterprise-grade reliability. Start messaging the
            world today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => setShowLogin(true)}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>

          {/* Quote Rotation */}
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 max-w-3xl mx-auto border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-white p-2 rounded-full">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 mt-4">
              "{messagingQuotes[currentQuote].text}"
            </blockquote>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
              — {messagingQuotes[currentQuote].author}
            </p>

            {/* Indicator dots */}
            <div className="flex justify-center gap-2 mt-4">
              {messagingQuotes.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentQuote ? "bg-primary" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentQuote(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Real-time Messaging
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Instant message delivery with live typing indicators, read
              receipts, and real-time synchronization across all devices.
            </p>
          </div>

          <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Global Reach
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Phone numbers available in 50+ countries with competitive pricing
              and instant activation for worldwide communication.
            </p>
          </div>

          <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Enterprise Security
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Bank-level encryption with compliance standards, data protection,
              and enterprise-grade security for businesses.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Trusted by Thousands
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10M+</div>
              <div className="text-gray-600 dark:text-gray-300">
                Messages Sent
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Connectify for their SMS
            communication needs. Start your free account today.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => setShowLogin(true)}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
