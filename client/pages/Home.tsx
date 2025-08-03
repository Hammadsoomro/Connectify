import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BarChart3,
  Smartphone,
  Target,
  Award,
  Rocket,
  Heart,
  Database,
  Lock,
  Wifi,
  Layers,
  MousePointer,
  Sparkles,
  Play,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SMSNavbar from "@/components/SMSNavbar";
import PhoneNumberSelectionModal from "@/components/PhoneNumberSelectionModal";
import AdBanner from "@/components/AdBanner";
import AnimatedBackground from "@/components/AnimatedBackground";
import WalletDepositModal from "@/components/WalletDepositModal";
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
  {
    text: "The single biggest problem in communication is the illusion that it has taken place.",
    author: "George Bernard Shaw",
  },
];

const features = [
  {
    icon: Clock,
    title: "Real-time Messaging",
    description:
      "Instant message delivery with live typing indicators and read receipts",
    color: "from-emerald-500 to-green-600",
    delay: "delay-100",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Phone numbers available in 50+ countries with competitive pricing",
    color: "from-purple-500 to-blue-600",
    delay: "delay-200",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-level encryption with compliance standards for businesses",
    color: "from-blue-500 to-purple-600",
    delay: "delay-300",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed insights and reporting for your messaging campaigns",
    color: "from-purple-600 to-emerald-600",
    delay: "delay-400",
  },
  {
    icon: Smartphone,
    title: "Multi-Platform",
    description:
      "Access from web, mobile apps, and integrate with your existing tools",
    color: "from-pink-500 to-rose-600",
    delay: "delay-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "99.9% uptime with ultra-fast message delivery worldwide",
    color: "from-yellow-500 to-amber-600",
    delay: "delay-600",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "Salesforce",
    content:
      "Connectlify transformed our customer communication. The real-time features are incredible!",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b1-7?w=150",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "CEO",
    company: "Uber",
    content:
      "Best SMS platform we've used. The global reach and reliability are unmatched.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Operations Manager",
    company: "E-commerce Plus",
    content:
      "The analytics and automation features helped us increase engagement by 300%.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    rating: 5,
  },
];

const heroStats = [
  { number: "10M+", label: "Messages Sent", icon: MessageSquare },
  { number: "50+", label: "Countries", icon: Globe },
  { number: "99.9%", label: "Uptime", icon: Zap },
  { number: "24/7", label: "Support", icon: Heart },
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
  const [userStats, setUserStats] = useState({
    contacts: 0,
    phoneNumbers: 0,
    unreadMessages: 0,
  });
  const [isPhoneNumberModalOpen, setIsPhoneNumberModalOpen] = useState(false);
  const [phoneNumberUnreadCounts, setPhoneNumberUnreadCounts] = useState<{
    [phoneNumber: string]: number;
  }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Rotate quotes every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % messagingQuotes.length);
    }, 4000);
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

      setUserStats({
        contacts: contactsData.length,
        phoneNumbers: phoneNumbersData.length,
        unreadMessages: unreadCount,
      });

      // Load wallet balance
      try {
        const walletData = await ApiService.getWallet();
        setWalletBalance(walletData.balance || 0);

        // Show wallet modal if balance is 0 for new users
        if (walletData.balance === 0) {
          setTimeout(() => setIsWalletModalOpen(true), 2000);
        }
      } catch (error) {
        console.error("Error loading wallet:", error);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleConversationsClick = () => {
    if (profile.role === "admin" && phoneNumbers.length > 1) {
      setIsPhoneNumberModalOpen(true);
    } else if (phoneNumbers.length === 1) {
      navigate(`/conversations?phoneNumber=${phoneNumbers[0].id}`);
    } else if (phoneNumbers.length === 0) {
      alert("Please purchase a phone number first to access conversations");
    } else {
      navigate("/conversations");
    }
  };

  const handlePhoneNumberSelected = (phoneNumber: any) => {
    navigate(`/conversations?phoneNumber=${phoneNumber.id}`);
  };

  const handleLogout = () => {
    ApiService.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Enhanced Navbar */}
        <SMSNavbar
          unreadCount={userStats.unreadMessages}
          phoneNumbers={phoneNumbers}
          activeNumber={phoneNumbers.find((p) => p.isActive)?.id || null}
          profile={profile}
          onSelectNumber={() => {}}
          onBuyNewNumber={() => navigate("/buy-numbers")}
          onUpdateProfile={() => {}}
          onLogout={handleLogout}
        />

        {/* Enhanced Action Buttons with Animations */}
        <div className="border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-4 animate-fade-in">
              <Button
                onClick={handleConversationsClick}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <MessageSquare className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Conversations
                {userStats.unreadMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-6 w-6 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
                  >
                    {userStats.unreadMessages}
                  </Badge>
                )}
                <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              {/* Admin-only buttons */}
              {profile.role === "admin" && (
                <>
                  <Button
                    onClick={() => navigate("/buy-numbers")}
                    variant="outline"
                    className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950 dark:hover:to-emerald-950 transform hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <Phone className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Buy New Number
                  </Button>

                  <Button
                    onClick={() => navigate("/sub-accounts")}
                    variant="outline"
                    className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-950 dark:hover:to-indigo-950 transform hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <Users className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Sub-Accounts
                  </Button>
                </>
              )}

              {/* Sub-account and admin can see pricing and packages */}
              {(profile.role === "admin" || profile.role === "sub-account") && (
                <>
                  <Button
                    onClick={() => navigate("/pricing")}
                    variant="outline"
                    className="group hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-950 dark:hover:to-yellow-950 transform hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <DollarSign className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Pricing
                  </Button>

                  <Button
                    onClick={() => navigate("/pricing")}
                    variant="outline"
                    className="group hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-950 dark:hover:to-blue-950 transform hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <Package className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Packages
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Enhanced Hero Section */}
          <div
            ref={heroRef}
            className={`text-center py-20 mb-20 relative transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
              <div
                className="absolute top-20 left-1/2 w-60 h-60 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-bounce"
                style={{ animationDuration: "3s" }}
              />
            </div>

            <div className="relative z-10">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 border border-blue-200/50 dark:border-blue-800/50 animate-fade-in-up delay-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Zap className="w-4 h-4" />
                Enterprise SMS Platform • Real-time • Secure
              </div>

              {/* Main Heading with Animation */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 mb-8 leading-tight animate-fade-in-up delay-300">
                Connect the
                <span className="block text-gradient animate-pulse">World</span>
                Instantly
              </h1>

              {/* Enhanced Description */}
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-500">
                Transform your business communication with our{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  enterprise-grade SMS platform
                </span>
                . Real-time messaging, global reach, and unmatched reliability.
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up delay-700">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  onClick={handleConversationsClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Start Messaging Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => navigate("/pricing")}
                >
                  <Target className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  View Pricing
                </Button>
              </div>

              {/* Enhanced Quote Section */}
              <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-slate-200/50 dark:border-slate-700/50 shadow-2xl animate-fade-in-up delay-900">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-2xl shadow-lg">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                </div>

                <div className="mt-4">
                  <blockquote className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    "{messagingQuotes[currentQuote].text}"
                  </blockquote>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">
                    — {messagingQuotes[currentQuote].author}
                  </p>
                </div>

                {/* Quote Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {messagingQuotes.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentQuote
                          ? "bg-blue-500 scale-125"
                          : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                      }`}
                      onClick={() => setCurrentQuote(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {heroStats.map((stat, index) => (
                <Card
                  key={index}
                  className="text-center p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100 + 1100}ms` }}
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Main Action Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-7xl mx-auto">
            {/* Conversations Card */}
            <Card
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden transform hover:scale-105 animate-fade-in-up delay-1200"
              onClick={handleConversationsClick}
            >
              <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageSquare className="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                {userStats.unreadMessages > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white animate-pulse">
                    {userStats.unreadMessages} unread
                  </Badge>
                )}
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      Real-time Active
                    </span>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span>Smart Conversations</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Access real-time SMS conversations with advanced features like
                  typing indicators, read receipts, and smart contact
                  management.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Total Contacts
                    </span>
                    <span className="font-bold text-blue-600">
                      {userStats.contacts}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      Active Numbers
                    </span>
                    <span className="font-bold text-green-600">
                      {userStats.phoneNumbers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Response Time
                    </span>
                    <span className="font-bold text-yellow-600">
                      &lt; 100ms
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buy Numbers Card */}
            <Card
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden transform hover:scale-105 animate-fade-in-up delay-1300"
              onClick={() => navigate("/buy-numbers")}
            >
              <div className="relative h-64 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Phone className="w-20 h-20 text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    50+ Countries
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">$1.00</div>
                  <div className="text-sm opacity-90">Starting price/month</div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span>Global Numbers</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Purchase premium phone numbers from 50+ countries with instant
                  activation and full regulatory compliance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Global Coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">
                      Instant Activation
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Fully Compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Premium Quality</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden transform hover:scale-105 animate-fade-in-up delay-1400"
              onClick={() => navigate("/pricing")}
            >
              <div className="relative h-64 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    No Setup Fees
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-2xl font-bold">Pay as you go</div>
                  <div className="text-sm opacity-90">Transparent pricing</div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span>Flexible Plans</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Choose from flexible pricing plans designed for businesses of
                  all sizes. No hidden fees, no long-term contracts.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Pay-as-you-go</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">
                      Volume discounts
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">24/7 support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Cancel anytime</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Features Grid */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Why Choose{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Connectlify
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Advanced features designed for modern businesses that demand
                reliability, security, and performance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`group p-8 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-fade-in-up ${feature.delay}`}
                >
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Trusted by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  Thousands
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                See what our customers say about their experience with
                Connectlify.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className={`p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 200 + 2000}ms` }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 dark:text-slate-300 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {testimonial.name}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-sm">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center py-20 mb-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Ready to Transform Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Communication?
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
                Join thousands of businesses already using Connectlify to
                enhance their customer communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  onClick={handleConversationsClick}
                >
                  <Rocket className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => navigate("/pricing")}
                >
                  <Phone className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Advertisement Section */}
          <div className="text-center py-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-center mb-6">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Advertisement
              </span>
            </div>
            <div className="flex justify-center">
              <AdBanner width={728} height={90} />
            </div>
          </div>
        </div>

        {/* Phone Number Selection Modal */}
        <PhoneNumberSelectionModal
          isOpen={isPhoneNumberModalOpen}
          onClose={() => setIsPhoneNumberModalOpen(false)}
          phoneNumbers={phoneNumbers}
          phoneNumberUnreadCounts={phoneNumberUnreadCounts}
          onSelectPhoneNumber={handlePhoneNumberSelected}
        />

        {/* Wallet Deposit Modal */}
        <WalletDepositModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          currentBalance={walletBalance}
          onBalanceUpdate={setWalletBalance}
        />
      </div>
    </div>
  );
}
