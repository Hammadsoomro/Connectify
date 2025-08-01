import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Send,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  DollarSign,
  Sun,
  Moon,
  Settings,
  User,
  Search,
  Bell,
  BellOff,
  MessageSquare,
  Users,
  RefreshCw,
  CheckCircle2,
  Check,
  Loader2,
  Home,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import ApiService from "@/services/api";
import socketService from "@/services/socketService";
import AdBanner from "@/components/AdBanner";
import AnimatedBackground from "@/components/AnimatedBackground";

// Types
interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  isOutgoing: boolean;
  createdAt: string;
  status: "sent" | "delivered" | "read";
  contactId: string;
}

interface PhoneNumber {
  id: string;
  number: string;
  isActive: boolean;
  unreadCount?: number;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function Conversations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Core State
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [activePhoneNumber, setActivePhoneNumber] = useState<string | null>(
    null,
  );
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // UI State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    return (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  const [notifications, setNotifications] = useState(() => {
    return Notification.permission === "granted";
  });

  // Profile and Modals
  const [profile, setProfile] = useState<Profile>({
    id: "",
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showDeleteContact, setShowDeleteContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // Initialize everything
  useEffect(() => {
    loadInitialData();
    initializeSocketIO();
    requestNotificationPermission();

    // Set theme
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    return () => {
      try {
        if (activePhoneNumber) {
          socketService.leavePhoneNumber(activePhoneNumber);
        }
        socketService.disconnect();
      } catch (error) {
        console.error("Error during Conversations cleanup:", error);
      }
    };
  }, []);

  // Handle phone number URL parameter
  useEffect(() => {
    const phoneNumberFromUrl = searchParams.get("phoneNumber");
    if (phoneNumberFromUrl && phoneNumbers.length > 0) {
      const foundPhone = phoneNumbers.find(
        (p) => p.number === phoneNumberFromUrl,
      );
      if (foundPhone && foundPhone.number !== activePhoneNumber) {
        switchPhoneNumber(foundPhone.number);
      }
    } else if (phoneNumbers.length > 0 && !activePhoneNumber) {
      const activePhone =
        phoneNumbers.find((p) => p.isActive) || phoneNumbers[0];
      setActivePhoneNumber(activePhone.number);
      loadContactsForPhoneNumber(activePhone.number);
    }
  }, [phoneNumbers, searchParams]);

  // Load contacts when active phone number changes
  useEffect(() => {
    if (activePhoneNumber) {
      loadContactsForPhoneNumber(activePhoneNumber);
      socketService.joinPhoneNumber(activePhoneNumber);
    }
  }, [activePhoneNumber]);

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContactId) {
      loadMessages(selectedContactId);
      markMessagesAsRead(selectedContactId);
    }
  }, [selectedContactId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [userProfile, phoneNumbersData] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getPhoneNumbers(),
      ]);

      setProfile(userProfile);
      setPhoneNumbers(
        phoneNumbersData.map((phone: any) => ({
          ...phone,
          unreadCount: 0,
        })),
      );

      // Load wallet balance
      try {
        const walletData = await ApiService.getWallet();
        setWalletBalance(walletData.balance || 0);
      } catch (error) {
        console.error("Error loading wallet balance:", error);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load initial data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSocketIO = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found for Socket.IO connection");
      return;
    }

    try {
      setIsConnecting(true);
      socketService.connect(token);

      // Set up Socket.IO event listeners
      socketService.on("newMessage", (data: any) => {
        console.log("📱 New message received:", data);

        // Update contacts list
        if (activePhoneNumber) {
          loadContactsForPhoneNumber(activePhoneNumber);
        }

        // If message is for currently selected contact, reload messages
        if (selectedContactId === data.contactId) {
          loadMessages(selectedContactId);
        }

        // Show notification for incoming messages
        if (notifications && !data.isOutgoing) {
          showNotification(
            "New Message",
            `${data.senderName}: ${data.content}`,
          );
        }

        // Update page title with unread count
        updatePageTitle();
      });

      socketService.on("messageStatusUpdate", (data: any) => {
        console.log("✓ Message status updated:", data);
        if (selectedContactId) {
          loadMessages(selectedContactId);
        }
      });

      socketService.on("contactsUpdated", (data: any) => {
        console.log("👥 Contacts updated:", data);
        if (activePhoneNumber) {
          loadContactsForPhoneNumber(activePhoneNumber);
        }
      });

      socketService.on("unreadUpdated", (data: any) => {
        console.log("�� Unread counts updated:", data);
        updatePageTitle();
      });

      // Connection status handlers
      const handleConnect = () => {
        console.log("✅ Socket.IO connected");
        setIsConnecting(false);
        toast({
          title: "Connected",
          description: "Real-time messaging is now active",
        });
      };

      const handleDisconnect = () => {
        console.log("❌ Socket.IO disconnected");
        setIsConnecting(false);
        toast({
          title: "Disconnected",
          description: "Real-time messaging is offline",
          variant: "destructive",
        });
      };

      const handleError = (error: any) => {
        console.error("Socket.IO connection error:", error);
        setIsConnecting(false);
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive",
        });
      };

      socketService.on("connect", handleConnect);
      socketService.on("disconnect", handleDisconnect);
      socketService.on("connect_error", handleError);
    } catch (error) {
      console.error("Error initializing Socket.IO:", error);
      setIsConnecting(false);
    }
  };

  const loadContactsForPhoneNumber = async (phoneNumber: string) => {
    try {
      const contactsData = await ApiService.getContacts(phoneNumber);
      setContacts(contactsData || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async (contactId: string) => {
    try {
      setIsLoadingMessages(true);
      const messagesData = await ApiService.getMessages(
        contactId,
        activePhoneNumber || undefined,
      );
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async (contactId: string) => {
    try {
      await ApiService.markAsRead(contactId);

      // Update contact unread count in UI
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, unreadCount: 0 } : contact,
        ),
      );

      updatePageTitle();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (
      !newMessage.trim() ||
      !selectedContactId ||
      !activePhoneNumber ||
      isSending
    ) {
      return;
    }

    try {
      setIsSending(true);
      const selectedContact = contacts.find((c) => c.id === selectedContactId);

      if (!selectedContact) {
        throw new Error("Selected contact not found");
      }

      await ApiService.sendSMS(
        selectedContactId,
        newMessage.trim(),
        activePhoneNumber,
      );

      setNewMessage("");

      // Reload messages and contacts to show the sent message
      await Promise.all([
        loadMessages(selectedContactId),
        loadContactsForPhoneNumber(activePhoneNumber),
      ]);

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to Send",
        description:
          error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const addContact = async () => {
    if (
      !newContactPhone.trim() ||
      !activePhoneNumber
    ) {
      return;
    }

    try {
      const finalName = newContactName.trim() || newContactPhone.trim();
      await ApiService.addContact(
        finalName,
        newContactPhone.trim(),
        activePhoneNumber,
      );

      setNewContactName("");
      setNewContactPhone("");
      setShowAddContact(false);

      await loadContactsForPhoneNumber(activePhoneNumber);

      toast({
        title: "Contact Added",
        description: `${newContactName} has been added to your contacts`,
      });
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        title: "Failed to Add Contact",
        description:
          error.message || "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editContact = async () => {
    if (!editingContact || !newContactName.trim()) return;

    try {
      await ApiService.updateContact(editingContact.id, {
        name: newContactName.trim(),
      });

      setNewContactName("");
      setShowEditContact(false);
      setEditingContact(null);

      await loadContactsForPhoneNumber(activePhoneNumber!);

      toast({
        title: "Contact Updated",
        description: "Contact has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error editing contact:", error);
      toast({
        title: "Failed to Update",
        description:
          error.message || "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteContact = async () => {
    if (!deletingContact) return;

    try {
      await ApiService.deleteContact(deletingContact.id);

      // Clear selection if deleted contact was selected
      if (selectedContactId === deletingContact.id) {
        setSelectedContactId(null);
        setMessages([]);
      }

      setShowDeleteContact(false);
      setDeletingContact(null);

      await loadContactsForPhoneNumber(activePhoneNumber!);

      toast({
        title: "Contact Deleted",
        description: "Contact and all messages have been deleted",
      });
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Failed to Delete",
        description:
          error.message || "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const switchPhoneNumber = async (phoneNumber: string) => {
    try {
      const phoneNumberObj = phoneNumbers.find((p) => p.number === phoneNumber);
      if (phoneNumberObj) {
        await ApiService.setActiveNumber(phoneNumberObj.id);

        // Leave old room and join new room
        if (activePhoneNumber) {
          socketService.leavePhoneNumber(activePhoneNumber);
        }

        setActivePhoneNumber(phoneNumber);
        setSelectedContactId(null);
        setMessages([]);

        socketService.joinPhoneNumber(phoneNumber);

        toast({
          title: "Number Switched",
          description: `Now using ${phoneNumber}`,
        });
      }
    } catch (error: any) {
      console.error("Error switching phone number:", error);
      toast({
        title: "Failed to Switch",
        description: error.message || "Failed to switch phone number",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotifications(permission === "granted");
    }
  };

  const showNotification = (title: string, body: string) => {
    if (notifications && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "sms-notification",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  const updatePageTitle = () => {
    const totalUnread = contacts.reduce(
      (sum, contact) => sum + contact.unreadCount,
      0,
    );
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Connectlify - Messages`;
    } else {
      document.title = "Connectlify - Messages";
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const toggleNotifications = async () => {
    if (!notifications && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      setNotifications(permission === "granted");
    } else {
      setNotifications(!notifications);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "dd/MM/yyyy");
    }
  };

  const formatMessageTimeFull = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm");
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phoneNumber.includes(searchTerm),
  );

  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const totalUnreadCount = contacts.reduce(
    (sum, contact) => sum + contact.unreadCount,
    0,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Loading Connectlify</h3>
            <p className="text-sm text-muted-foreground">
              Setting up your conversations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex relative overflow-hidden ${isDarkMode ? "dark" : ""}`}
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 flex w-full">
        {/* Left Sidebar - Contact List & Controls */}
        <div className="w-80 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col">
        {/* Header Section */}
        <div className="p-4 border-b border-border bg-muted/20">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4" />
              <Home className="w-4 h-4" />
              Home
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotifications}
                className="p-2"
                title={
                  notifications
                    ? "Disable notifications"
                    : "Enable notifications"
                }
              >
                {notifications ? (
                  <Bell className="w-4 h-4 text-green-600" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <User className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/buy-numbers")}>
                    <Phone className="w-4 h-4 mr-2" />
                    Buy Phone Numbers
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Balance: ${walletBalance.toFixed(2)}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>



          {/* Search Contacts */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Add Contact Button */}
        <div className="p-3 border-b border-border">
          <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
            <DialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contactName">Contact Name (Optional)</Label>
                  <Input
                    id="contactName"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Enter contact name (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddContact(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addContact}
                  disabled={!newContactPhone.trim()}
                >
                  Add Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No contacts found</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Try a different search term"
                    : "Add a contact to start messaging"}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    selectedContactId === contact.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {contact.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate text-sm">
                              {contact.name}
                            </h4>
                            {contact.lastMessageTime && (
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatMessageTime(contact.lastMessageTime)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {contact.phoneNumber}
                          </p>

                          {contact.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {contact.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {contact.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-xs h-5 min-w-[20px]"
                          >
                            {contact.unreadCount > 99
                              ? "99+"
                              : contact.unreadCount}
                          </Badge>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto opacity-60 hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingContact(contact);
                                setNewContactName(contact.name);
                                setShowEditContact(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingContact(contact);
                                setShowDeleteContact(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Ad Banner at Bottom */}
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="text-center mb-2">
            <span className="text-xs text-muted-foreground">Advertisement</span>
          </div>
          <AdBanner width={300} height={80} />
        </div>
      </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-background/80 backdrop-blur-xl">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedContact.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedContact.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedContact.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Via {activePhoneNumber}
                  </Badge>
                  {isConnecting && (
                    <Badge variant="secondary" className="text-xs">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Connecting...
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Loading messages...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const showDateSeparator =
                        index === 0 ||
                        (!isToday(new Date(message.createdAt)) &&
                          !isToday(new Date(messages[index - 1]?.createdAt)));

                      return (
                        <div key={message.id}>
                          {showDateSeparator && (
                            <div className="flex items-center my-4">
                              <Separator className="flex-1" />
                              <span className="px-3 text-xs text-muted-foreground bg-background">
                                {formatMessageTimeFull(message.createdAt)}
                              </span>
                              <Separator className="flex-1" />
                            </div>
                          )}

                          <div
                            className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                                message.isOutgoing
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <div className="flex items-center justify-between mt-2 gap-2">
                                <span className="text-xs opacity-70">
                                  {format(new Date(message.createdAt), "HH:mm")}
                                </span>
                                {message.isOutgoing && (
                                  <span className="text-xs opacity-70 flex items-center">
                                    {message.status === "read" ? (
                                      <span className="text-blue-400">✓✓</span>
                                    ) : message.status === "delivered" ? (
                                      <span>✓✓</span>
                                    ) : message.status === "sent" ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Phone Number Selection - Above Message Input */}
            <div className="p-3 border-t border-border bg-muted/20">
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                Send from:
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-2"
                    size="sm"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span className="font-mono text-xs">
                        {activePhoneNumber || "Select number"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {totalUnreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs h-4 min-w-[16px]">
                          {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </Badge>
                      )}
                      {isConnecting && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[300px]">
                  {phoneNumbers.map((phone) => (
                    <DropdownMenuItem
                      key={phone.id}
                      onClick={() => switchPhoneNumber(phone.number)}
                      className="font-mono"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{phone.number}</span>
                          {phone.isActive && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        {phone.unreadCount && phone.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {phone.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                  className="px-4"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Balance: ${walletBalance.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-muted/5">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-12 h-12 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to Connectlify
                </h2>
                <p className="text-muted-foreground">
                  Select a contact from the sidebar to start messaging, or add a
                  new contact to begin your conversation.
                </p>
              </div>

              <div className="bg-card rounded-lg p-4 space-y-2 border">
                <h3 className="font-semibold text-sm">Current Status</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Active Number:</span>
                    <span className="font-mono text-primary">
                      {activePhoneNumber || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contacts:</span>
                    <span>{contacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unread Messages:</span>
                    <span
                      className={
                        totalUnreadCount > 0
                          ? "text-destructive font-semibold"
                          : ""
                      }
                    >
                      {totalUnreadCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet Balance:</span>
                    <span className="font-semibold text-green-600">
                      ${walletBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Large Ad Banner */}
              <div className="mt-8">
                <div className="text-center mb-4">
                  <span className="text-xs text-muted-foreground">
                    Advertisement
                  </span>
                </div>
                <AdBanner width={728} height={90} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditContact} onOpenChange={setShowEditContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editContactName">Contact Name</Label>
              <Input
                id="editContactName"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={editingContact?.phoneNumber || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phone number cannot be changed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditContact(false)}>
              Cancel
            </Button>
            <Button onClick={editContact} disabled={!newContactName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <Dialog open={showDeleteContact} onOpenChange={setShowDeleteContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>{deletingContact?.name}</strong>? This will permanently
              delete the contact and all message history.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteContact(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteContact}>
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
