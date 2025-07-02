import { useState, useEffect } from "react";
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
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { format } from "date-fns";
import ApiService from "@/services/api";
import socketService from "@/services/socketService";
import AdBanner from "@/components/AdBanner";

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
}

interface PhoneNumber {
  id: string;
  number: string;
  isActive: boolean;
  unreadCount: number;
}

export default function Conversations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State management
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [twilioBalance, setTwilioBalance] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Profile and modals
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // Initialize data
  useEffect(() => {
    loadInitialData();
    initializeSocketIO();

    // Set theme
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  // Handle phone number changes
  useEffect(() => {
    const phoneNumberFromUrl = searchParams.get("phoneNumber");
    if (phoneNumberFromUrl && phoneNumbers.length > 0) {
      const foundPhone = phoneNumbers.find(
        (p) => p.number === phoneNumberFromUrl,
      );
      if (foundPhone) {
        setActivePhoneNumber(foundPhone.number);
        loadContactsForPhoneNumber(foundPhone.number);
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

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [userProfile, phoneNumbersData, balance] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getPhoneNumbers(),
        ApiService.getTwilioBalance().catch(() => 0),
      ]);

      setProfile(userProfile);
      setPhoneNumbers(phoneNumbersData);
      setTwilioBalance(balance);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSocketIO = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      socketService.connect(token);

      socketService.on("newMessage", (data: any) => {
        console.log("📱 New message received:", data);

        // Reload contacts to update last message and unread counts
        if (activePhoneNumber) {
          loadContactsForPhoneNumber(activePhoneNumber);
        }

        // If message is for selected contact, reload messages
        if (selectedContactId === data.contactId) {
          loadMessages(selectedContactId);
        }

        // Show notification if enabled
        if (notifications && !data.isOutgoing) {
          showNotification("New Message", data.content);
        }
      });

      socketService.on("messageStatusUpdate", (data: any) => {
        if (selectedContactId) {
          loadMessages(selectedContactId);
        }
      });
    }
  };

  const loadContactsForPhoneNumber = async (phoneNumber: string) => {
    try {
      const contactsData = await ApiService.getContacts(phoneNumber);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const loadMessages = async (contactId: string) => {
    try {
      const messagesData = await ApiService.getMessages(contactId);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error loading messages:", error);
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
    )
      return;

    try {
      setIsSending(true);
      const selectedContact = contacts.find((c) => c.id === selectedContactId);

      await ApiService.sendSMS({
        to: selectedContact?.phoneNumber || "",
        message: newMessage,
        fromNumber: activePhoneNumber,
        contactId: selectedContactId,
      });

      setNewMessage("");
      // Reload messages to show the sent message
      loadMessages(selectedContactId);
      // Reload contacts to update last message
      loadContactsForPhoneNumber(activePhoneNumber);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const addContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim() || !activePhoneNumber)
      return;

    try {
      await ApiService.addContact({
        name: newContactName,
        phoneNumber: newContactPhone,
        activePhoneNumber,
      });

      setNewContactName("");
      setNewContactPhone("");
      setShowAddContact(false);
      loadContactsForPhoneNumber(activePhoneNumber);
    } catch (error) {
      console.error("Error adding contact:", error);
      alert("Failed to add contact. Please try again.");
    }
  };

  const editContact = async () => {
    if (!editingContact || !newContactName.trim()) return;

    try {
      await ApiService.updateContact(editingContact.id, {
        name: newContactName,
      });

      setNewContactName("");
      setShowEditContact(false);
      setEditingContact(null);
      loadContactsForPhoneNumber(activePhoneNumber!);
    } catch (error) {
      console.error("Error editing contact:", error);
      alert("Failed to edit contact. Please try again.");
    }
  };

  const deleteContact = async (contactId: string) => {
    if (
      !confirm("Are you sure you want to delete this contact and all messages?")
    )
      return;

    try {
      await ApiService.deleteContact(contactId);

      // Clear selection if deleted contact was selected
      if (selectedContactId === contactId) {
        setSelectedContactId(null);
        setMessages([]);
      }

      loadContactsForPhoneNumber(activePhoneNumber!);
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact. Please try again.");
    }
  };

  const switchPhoneNumber = async (phoneNumber: string) => {
    try {
      const phoneNumberObj = phoneNumbers.find((p) => p.number === phoneNumber);
      if (phoneNumberObj) {
        await ApiService.setActiveNumber(phoneNumberObj.id);
        setActivePhoneNumber(phoneNumber);
        setSelectedContactId(null);
        setMessages([]);

        // Leave old room and join new room
        if (activePhoneNumber) {
          socketService.leavePhoneNumber(activePhoneNumber);
        }
        socketService.joinPhoneNumber(phoneNumber);
      }
    } catch (error) {
      console.error("Error switching phone number:", error);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  const toggleNotifications = async () => {
    if (!notifications && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifications(true);
      }
    } else {
      setNotifications(!notifications);
    }
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? "dark" : ""}`}>
      {/* Left Sidebar - Contact List */}
      <div className="w-80 bg-background border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotifications}
                className="p-2"
              >
                {notifications ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
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
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <User className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/buy-numbers")}>
                    <Phone className="w-4 h-4 mr-2" />
                    Buy Numbers
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Balance: ${twilioBalance.toFixed(2)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Phone Number */}
          <div className="mb-3">
            <Label className="text-sm text-muted-foreground">
              Active Number:
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between mt-1"
                >
                  <span className="font-mono">{activePhoneNumber}</span>
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {phoneNumbers.map((phone) => (
                  <DropdownMenuItem
                    key={phone.id}
                    onClick={() => switchPhoneNumber(phone.number)}
                    className="font-mono"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{phone.number}</span>
                      {phone.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {phone.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
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
                  <Label htmlFor="contactName">Name</Label>
                  <Input
                    id="contactName"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Enter contact name"
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
                <Button onClick={addContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No contacts found</p>
                <p className="text-sm">Add a contact to start messaging</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className={`mb-2 cursor-pointer transition-colors ${
                    selectedContactId === contact.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>
                            {contact.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">
                              {contact.name}
                            </h4>
                            {contact.lastMessageTime && (
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(contact.lastMessageTime),
                                  "HH:mm",
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {contact.phoneNumber}
                          </p>
                          {contact.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {contact.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {contact.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteContact(contact.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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

        {/* Ad Banner */}
        <div className="p-3 border-t border-border">
          <div className="text-center mb-2">
            <span className="text-xs text-muted-foreground">Advertisement</span>
          </div>
          <AdBanner width={300} height={100} />
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback>
                      {selectedContact.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedContact.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedContact.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Via {activePhoneNumber}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet</p>
                    <p className="text-sm">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOutgoing
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {format(new Date(message.createdAt), "HH:mm")}
                          </span>
                          {message.isOutgoing && (
                            <span className="text-xs opacity-70">
                              {message.status === "read"
                                ? "✓✓"
                                : message.status === "delivered"
                                  ? "✓"
                                  : "⏳"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage()
                  }
                  disabled={isSending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-muted/10">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Welcome to Connectify</h2>
              <p className="text-muted-foreground max-w-md">
                Select a contact from the sidebar to start messaging, or add a
                new contact to begin.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Active Number:{" "}
                  <span className="font-mono">{activePhoneNumber}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Twilio Balance:{" "}
                  <span className="font-semibold">
                    ${twilioBalance.toFixed(2)}
                  </span>
                </p>
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
              <Label htmlFor="editContactName">Name</Label>
              <Input
                id="editContactName"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <Button onClick={editContact} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
