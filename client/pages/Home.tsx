import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Phone,
  DollarSign,
  Plus,
  Globe,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  Settings,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SMSNavbar from "@/components/SMSNavbar";
import ApiService from "@/services/api";

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

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [stats, setStats] = useState({
    contacts: 0,
    phoneNumbers: 0,
    unreadMessages: 0,
  });

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % messagingQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [userProfile, phoneNumbersData, contactsData] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getPhoneNumbers(),
        ApiService.getContacts(),
      ]);

      setProfile(userProfile);
      setPhoneNumbers(phoneNumbersData);

      const unreadCount = contactsData.reduce(
        (total: number, contact: any) => total + (contact.unreadCount || 0),
        0,
      );

      setStats({
        contacts: contactsData.length,
        phoneNumbers: phoneNumbersData.length,
        unreadMessages: unreadCount,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleLogout = () => {
    ApiService.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <SMSNavbar
        unreadCount={stats.unreadMessages}
        phoneNumbers={phoneNumbers}
        activeNumber={phoneNumbers.find((p) => p.isActive)?.id || null}
        profile={profile}
        onSelectNumber={() => {}}
        onBuyNewNumber={() => navigate("/buy-numbers")}
        onUpdateProfile={() => {}}
        onLogout={handleLogout}
      />

      {/* Action Buttons */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-center gap-4 px-6 py-4">
          <Button
            onClick={() => navigate("/conversations")}
            variant="default"
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Conversations
            {stats.unreadMessages > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {stats.unreadMessages}
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => navigate("/buy-numbers")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Buy New Number
          </Button>
          <Button
            onClick={() => navigate("/pricing")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Pricing
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
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

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Connect with
            <span className="text-primary"> Anyone</span>
            <br />
            Anywhere
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Professional SMS messaging platform with real-time conversations,
            global reach, and enterprise-grade reliability.
          </p>

          {/* Quote Rotation */}
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 max-w-3xl mx-auto border border-gray-200/50 dark:border-gray-700/50 shadow-xl mb-12">
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

        {/* Features Overview */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why Choose Our Platform?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Messaging
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Instant message delivery with live typing indicators and read
                receipts
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Global Reach
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Phone numbers available in 50+ countries with competitive
                pricing
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Enterprise Security
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Bank-level encryption with compliance standards for businesses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
