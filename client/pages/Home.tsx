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

      <div className="container mx-auto px-6 py-8">
        {/* Main Action Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {/* Conversations Button */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:scale-105"
            onClick={() => navigate("/conversations")}
          >
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <span>Conversations</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
              {stats.unreadMessages > 0 && (
                <Badge className="mx-auto bg-red-500">
                  {stats.unreadMessages} unread
                </Badge>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Access your real-time SMS conversations and manage contacts
              </p>
              <div className="flex justify-between text-sm">
                <span>Contacts: {stats.contacts}</span>
                <span>Numbers: {stats.phoneNumbers}</span>
              </div>
            </CardContent>
          </Card>

          {/* Buy Numbers Button */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:scale-105"
            onClick={() => navigate("/buy-numbers")}
          >
            <CardHeader className="text-center pb-4">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <span>Buy Numbers</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Purchase phone numbers from 50+ countries worldwide
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span>Global Coverage</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Instant Activation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Button */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:scale-105"
            onClick={() => navigate("/pricing")}
          >
            <CardHeader className="text-center pb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <span>Pricing</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                View pricing and add funds to your wallet
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Pay-as-you-go</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No hidden fees</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          {/* Conversations Card */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
            onClick={() => navigate("/conversations")}
          >
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
              <img
                src="https://images.pexels.com/photos/4149074/pexels-photo-4149074.jpeg"
                alt="Messaging"
                className="w-full h-full object-cover mix-blend-overlay opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-white" />
              </div>
              {stats.unreadMessages > 0 && (
                <Badge className="absolute top-4 right-4 bg-red-500">
                  {stats.unreadMessages} unread
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversations</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access your real-time SMS conversations and manage contacts
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Contacts:</span>
                  <span className="font-medium">{stats.contacts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Numbers:</span>
                  <span className="font-medium">{stats.phoneNumbers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buy Numbers Card */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
            onClick={() => navigate("/buy-numbers")}
          >
            <div className="relative h-48 bg-gradient-to-r from-green-500 to-teal-600 rounded-t-lg overflow-hidden">
              <img
                src="https://images.pexels.com/photos/2265486/pexels-photo-2265486.jpeg"
                alt="Phone Numbers"
                className="w-full h-full object-cover mix-blend-overlay opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Phone className="w-16 h-16 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Buy Numbers</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Purchase phone numbers from 50+ countries worldwide
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span>Global Coverage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Instant Activation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <span>Starting at $1.00/month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
            onClick={() => navigate("/pricing")}
          >
            <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-16 h-16 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pricing & Plans</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View detailed pricing and choose the perfect plan for your needs
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Pay-as-you-go</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
