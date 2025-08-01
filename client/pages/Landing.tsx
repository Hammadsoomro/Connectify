import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Shield,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Clock,
  Users,
  BarChart3,
  Award,
  Rocket,
  Heart,
  Target,
  Layers,
  Lock,
  Wifi,
  TrendingUp,
  MousePointer,
  Sparkles,
  Play,
  Eye,
  EyeOff,
  Mail,
  User,
  Building,
  CreditCard,
  Database,
  Smartphone,
  Headphones,
  FileText,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AdBanner from "@/components/AdBanner";
import ApiService from "@/services/api";

interface LandingProps {
  onLoginSuccess: () => void;
}

const heroStats = [
  { number: "10M+", label: "Messages Delivered", icon: MessageSquare },
  { number: "50K+", label: "Happy Customers", icon: Users },
  { number: "99.9%", label: "Uptime", icon: Zap },
  { number: "24/7", label: "Support", icon: Headphones },
];

const features = [
  {
    icon: Clock,
    title: "Real-time Messaging",
    description: "Instant message delivery with typing indicators and read receipts",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Send SMS to 200+ countries with local phone numbers",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption and SOC 2 Type II compliance",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed insights, delivery reports, and campaign analytics",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Smartphone,
    title: "Multi-Platform API",
    description: "RESTful API with SDKs for all major programming languages",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Lock,
    title: "Data Protection",
    description: "GDPR compliant with advanced data protection measures",
    color: "from-indigo-500 to-purple-600",
  },
];

const testimonials = [
  {
    name: "Alex Thompson",
    role: "CTO",
    company: "TechFlow",
    content: "Connectify's API integration was seamless. We saw 40% improvement in customer engagement within the first month.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
  },
  {
    name: "Maria Garcia",
    role: "Marketing Director",
    company: "GrowthLabs",
    content: "The real-time features and analytics dashboard have transformed how we communicate with our customers.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1-7?w=150",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Founder",
    company: "StartupCore",
    content: "Best SMS platform for startups. Affordable, reliable, and scales with your business needs.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    rating: 5,
  },
  {
    name: "Sarah Wilson",
    role: "VP Operations",
    company: "RetailPro",
    content: "Customer support is outstanding. Implementation was smooth and we're seeing great ROI.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses",
    features: [
      "10,000 SMS credits/month",
      "1 phone number included",
      "Basic analytics",
      "Email support",
      "API access",
    ],
    popular: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "Ideal for growing companies",
    features: [
      "50,000 SMS credits/month",
      "5 phone numbers included",
      "Advanced analytics",
      "Priority support",
      "Webhook integrations",
      "Custom sender IDs",
    ],
    popular: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited SMS credits",
      "Unlimited phone numbers",
      "White-label solution",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    popular: false,
    color: "from-orange-500 to-red-500",
  },
];

const faqs = [
  {
    question: "How quickly can I get started?",
    answer: "You can start sending messages within minutes. Simply sign up, verify your account, and you'll receive free credits to test our platform.",
  },
  {
    question: "Do you offer international SMS?",
    answer: "Yes, we support SMS delivery to 200+ countries worldwide with competitive rates and local phone numbers in 50+ countries.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees, no hidden charges. You only pay for what you use with transparent, pay-as-you-go pricing.",
  },
  {
    question: "What support do you provide?",
    answer: "We offer 24/7 email support for all plans, priority support for Professional plans, and dedicated phone support for Enterprise customers.",
  },
  {
    question: "Can I integrate with my existing systems?",
    answer: "Absolutely! We provide RESTful APIs, webhooks, and SDKs for popular programming languages. Our team can help with custom integrations.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use enterprise-grade security with end-to-end encryption, SOC 2 Type II compliance, and GDPR compliance for data protection.",
  },
];

export default function Landing({ onLoginSuccess }: LandingProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ApiService.login(loginData.email, loginData.password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      setIsLoginOpen(false);
      onLoginSuccess();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ApiService.register(registerData.name, registerData.email, registerData.password);
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please log in.",
      });
      setIsRegisterOpen(false);
      setIsLoginOpen(true);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Connectify
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enterprise SMS Platform
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Reviews
              </a>
              <a href="#faq" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                FAQ
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="font-medium">
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Welcome Back</DialogTitle>
                    <DialogDescription className="text-center">
                      Sign in to your Connectify account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                  <div className="text-center">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setIsLoginOpen(false);
                        setIsRegisterOpen(true);
                      }}
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium">
                    Get Started Free
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Create Account</DialogTitle>
                    <DialogDescription className="text-center">
                      Start your free trial today
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-company">Company (Optional)</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="register-company"
                          type="text"
                          placeholder="Your Company"
                          className="pl-10"
                          value={registerData.company}
                          onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                  <div className="text-center">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setIsRegisterOpen(false);
                        setIsLoginOpen(true);
                      }}
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section 
        ref={heroRef}
        className={`py-20 lg:py-32 relative transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-20 left-1/2 w-60 h-60 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 border border-blue-200/50 dark:border-blue-800/50 animate-fade-in-up delay-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Rocket className="w-4 h-4" />
              Trusted by 50,000+ businesses worldwide
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 mb-8 leading-tight animate-fade-in-up delay-300">
              The Future of
              <span className="block text-gradient animate-pulse">Business SMS</span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed animate-fade-in-up delay-500">
              Send, receive, and manage SMS messages at scale with our enterprise-grade platform.
              <span className="block mt-2 font-semibold text-blue-600 dark:text-blue-400">
                Real-time delivery • Global reach • Enterprise security
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up delay-700">
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                onClick={() => setIsRegisterOpen(true)}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center mb-12 animate-fade-in-up delay-900">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Trusted by leading companies worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-slate-400">TechCorp</div>
                <div className="text-2xl font-bold text-slate-400">GrowthLabs</div>
                <div className="text-2xl font-bold text-slate-400">StartupXYZ</div>
                <div className="text-2xl font-bold text-slate-400">Enterprise+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {heroStats.map((stat, index) => (
              <div key={index} className={`text-center animate-fade-in-up`} style={{ animationDelay: `${index * 100 + 1100}ms` }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">{stat.number}</div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Powerful Features for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Modern Business
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to build, scale, and optimize your SMS communication strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group p-8 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100 + 1400}ms` }}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
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
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Developers & Businesses
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              See what our customers say about their experience with Connectify.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Featured Testimonial */}
            <Card className="p-12 mb-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl md:text-3xl font-medium text-slate-700 dark:text-slate-300 mb-8 italic leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={testimonials[activeTestimonial].avatar} alt={testimonials[activeTestimonial].name} />
                    <AvatarFallback>{testimonials[activeTestimonial].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Testimonial Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className={`p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ${
                    index === activeTestimonial ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Simple,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Choose the plan that fits your needs. No setup fees, no hidden charges.
            </p>
            <div className="inline-flex items-center gap-4 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
              <button className="px-6 py-2 bg-white dark:bg-slate-700 rounded-full text-slate-800 dark:text-slate-100 font-medium shadow-sm">
                Monthly
              </button>
              <button className="px-6 py-2 text-slate-600 dark:text-slate-400 rounded-full">
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    {plan.price}
                    <span className="text-lg text-slate-600 dark:text-slate-400 font-normal">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  }`}
                  onClick={() => setIsRegisterOpen(true)}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Frequently Asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Questions
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to know about Connectify. Can't find what you're looking for? 
              <a href="#" className="text-blue-600 hover:text-blue-700 ml-1">Contact our support team</a>.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {faq.question}
                  </h3>
                  <ArrowRight className={`w-5 h-5 text-slate-400 transition-transform ${
                    expandedFaq === index ? 'rotate-90' : ''
                  }`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                Join thousands of businesses already using Connectify to enhance their customer communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-slate-100 font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => setIsRegisterOpen(true)}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-10 py-4 rounded-2xl transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Connectify</h3>
                  <p className="text-xs text-slate-400">Enterprise SMS Platform</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Transform your business communication with enterprise-grade SMS messaging.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                © 2024 Connectify. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Advertisement */}
      <div className="fixed bottom-4 right-4 z-50 no-print">
        <Card className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <div className="text-center mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Advertisement</span>
          </div>
          <AdBanner width={300} height={100} />
        </Card>
      </div>
    </div>
  );
}
