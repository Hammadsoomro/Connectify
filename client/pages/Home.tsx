import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import SMSNavbar from "@/components/SMSNavbar";
import ChatArea, { Message } from "@/components/ChatArea";
import ApiService from "@/services/api";
import webSocketService, {
  NewMessagePayload,
  MessageStatusPayload,
  TypingPayload,
  ContactStatusPayload,
} from "@/services/websocket";

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  priceLocal: string;
  priceTollFree: string;
}

const countries: Country[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    priceLocal: "$1.00",
    priceTollFree: "$2.00",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    priceLocal: "$1.50",
    priceTollFree: "$3.00",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    priceLocal: "$2.00",
    priceTollFree: "$4.00",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    priceLocal: "$1.80",
    priceTollFree: "$3.50",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    priceLocal: "$1.60",
    priceTollFree: "$3.20",
  },
];

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [activePhoneNumber, setActivePhoneNumber] = useState<string | null>(
    null,
  );
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % messagingQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadInitialData();
    setupRealTimeMessaging();

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const setupRealTimeMessaging = () => {
    // Connect to WebSocket
    webSocketService.connect();

    // Handle new incoming messages
    const unsubscribeNewMessage = webSocketService.subscribe(
      "new_message",
      (payload: NewMessagePayload) => {
        const { contactId, message } = payload;

        // Add message to current conversation if it's selected
        if (selectedContact?.id === contactId) {
          setMessages((prev) => [...prev, message]);
        }

        // Update contact's last message and unread count
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === contactId
              ? {
                  ...contact,
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                  unreadCount:
                    selectedContact?.id === contactId
                      ? contact.unreadCount
                      : contact.unreadCount + 1,
                }
              : contact,
          ),
        );

        // Show notification if message is not from selected contact
        if (selectedContact?.id !== contactId) {
          const contact = contacts.find((c) => c.id === contactId);
          if (contact) {
            // You can implement browser notifications here
            if (Notification.permission === "granted") {
              new Notification(`New message from ${contact.name}`, {
                body: message.content,
                icon: "/placeholder.svg",
              });
            }
          }
        }
      },
    );

    // Handle message status updates
    const unsubscribeMessageStatus = webSocketService.subscribe(
      "message_status",
      (payload: MessageStatusPayload) => {
        const { messageId, status } = payload;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
        );
      },
    );

    // Handle contact online/offline status
    const unsubscribeContactOnline = webSocketService.subscribe(
      "contact_online",
      (payload: ContactStatusPayload) => {
        const { contactId, isOnline } = payload;
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === contactId ? { ...contact, isOnline } : contact,
          ),
        );
      },
    );

    const unsubscribeContactOffline = webSocketService.subscribe(
      "contact_offline",
      (payload: ContactStatusPayload) => {
        const { contactId, isOnline } = payload;
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === contactId ? { ...contact, isOnline } : contact,
          ),
        );
      },
    );

    // Handle typing indicators
    const unsubscribeTyping = webSocketService.subscribe(
      "typing",
      (payload: TypingPayload) => {
        const { contactId, isTyping } = payload;
        // You can implement typing indicators here
        console.log(
          `Contact ${contactId} is ${isTyping ? "typing" : "stopped typing"}`,
        );
      },
    );

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Return cleanup function
    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageStatus();
      unsubscribeContactOnline();
      unsubscribeContactOffline();
      unsubscribeTyping();
    };
  };

  const loadInitialData = async () => {
    try {
      const [userProfile, contactsData, phoneNumbersData] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getContacts(),
        ApiService.getPhoneNumbers(),
      ]);

      setProfile(userProfile);
      setContacts(contactsData);
      setPhoneNumbers(phoneNumbersData);

      const activeNumber = phoneNumbersData.find((p: any) => p.isActive);
      if (activeNumber) {
        setActivePhoneNumber(activeNumber.id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadMessages = async (contactId: string) => {
    try {
      const messagesData = await ApiService.getMessages(contactId);
      setMessages(messagesData);
      await ApiService.markAsRead(contactId);

      // Update contact unread count
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, unreadCount: 0 } : contact,
        ),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    loadMessages(contact.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContact || !activePhoneNumber) return;

    const activeNumber = phoneNumbers.find((p) => p.id === activePhoneNumber);
    if (!activeNumber) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      isOutgoing: true,
      status: "sending",
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const sentMessage = await ApiService.sendSMS(
        selectedContact.id,
        content,
        activeNumber.number,
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, id: sentMessage.id, status: "sent" as const }
            : msg,
        ),
      );

      // Update contact's last message
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                lastMessage: content,
                lastMessageTime: new Date().toISOString(),
              }
            : contact,
        ),
      );
    } catch (error: any) {
      console.error("Error sending message:", error);
      alert(error.message || "Failed to send message");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: "failed" as const }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhoneNumber = async (numberId: string) => {
    try {
      await ApiService.setActiveNumber(numberId);
      setActivePhoneNumber(numberId);
      setPhoneNumbers((prev) =>
        prev.map((phone) => ({
          ...phone,
          isActive: phone.id === numberId,
        })),
      );
    } catch (error) {
      console.error("Error setting active number:", error);
    }
  };

  const handleBuyNumber = async () => {
    try {
      // This would implement actual number purchasing
      const availableNumbers = await ApiService.getAvailableNumbers();
      // For now, just redirect to buy numbers page
      window.location.href = "/buy-numbers";
    } catch (error) {
      console.error("Error buying number:", error);
    }
  };

  const totalUnreadCount = contacts.reduce(
    (total, contact) => total + contact.unreadCount,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <SMSNavbar
        unreadCount={totalUnreadCount}
        phoneNumbers={phoneNumbers}
        activeNumber={activePhoneNumber}
        profile={profile}
        onSelectNumber={handleSelectPhoneNumber}
        onBuyNewNumber={handleBuyNumber}
        onUpdateProfile={() => {}}
        onLogout={() => {
          ApiService.logout();
          window.location.reload();
        }}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Real-time SMS Platform
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
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto border border-gray-200/50 dark:border-gray-700/50">
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-300">
              "{messagingQuotes[currentQuote].text}"
            </blockquote>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              — {messagingQuotes[currentQuote].author}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Conversations */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Conversations
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {totalUnreadCount} unread
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[520px]">
                <div className="flex h-full">
                  {/* Contact List */}
                  <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                    {contacts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
                        <Users className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-center">No conversations yet</p>
                        <p className="text-sm text-center mt-2">
                          Start messaging to see conversations here
                        </p>
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => handleSelectContact(contact)}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            selectedContact?.id === contact.id
                              ? "bg-primary/5 border-r-2 border-r-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {contact.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {contact.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {contact.name}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    contact.lastMessageTime,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {contact.lastMessage}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {contact.phoneNumber}
                              </p>
                            </div>
                            {contact.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="w-5 h-5 rounded-full p-0 text-xs flex items-center justify-center"
                              >
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1">
                    <ChatArea
                      selectedContact={selectedContact}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Buy New Number */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Buy New Number
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Country
                  </label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Local Number
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {
                            countries.find((c) => c.code === selectedCountry)
                              ?.priceLocal
                          }
                          /month
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Perfect for local businesses and regional communication
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Toll-Free Number
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {
                            countries.find((c) => c.code === selectedCountry)
                              ?.priceTollFree
                          }
                          /month
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Professional appearance for customer service and support
                      </p>
                    </div>
                  </div>
                )}

                <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Buy Phone Number
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Purchase Phone Number</DialogTitle>
                      <DialogDescription>
                        Get a new phone number for{" "}
                        {
                          countries.find((c) => c.code === selectedCountry)
                            ?.name
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-6">
                      <p className="mb-4">
                        This will redirect you to our number selection page.
                      </p>
                      <Button onClick={handleBuyNumber} size="lg">
                        Continue to Number Selection
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Platform Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Real-time messaging</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Global phone numbers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Enterprise security</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Scalable infrastructure</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">24/7 support</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Numbers
                  </span>
                  <span className="font-bold">{phoneNumbers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Contacts
                  </span>
                  <span className="font-bold">{contacts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Unread Messages
                  </span>
                  <span className="font-bold">{totalUnreadCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
