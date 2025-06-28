import { useState, useEffect } from "react";
import SMSNavbar from "@/components/SMSNavbar";
import ContactList, { Contact } from "@/components/ContactList";
import ChatArea, { Message } from "@/components/ChatArea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Phone, Settings } from "lucide-react";

// Mock data - in a real app, this would come from your backend/Twilio
const initialPhoneNumbers = [
  { id: "1", number: "+1 (555) 123-4567", isActive: false },
  { id: "2", number: "+1 (555) 987-6543", isActive: false },
  { id: "3", number: "+1 (555) 456-7890", isActive: false },
];

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Smith",
    phoneNumber: "+1 (555) 111-2222",
    lastMessage: "Hey, how are you doing?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    phoneNumber: "+1 (555) 333-4444",
    lastMessage: "Thanks for the update!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "3",
    name: "Mike Wilson",
    phoneNumber: "+1 (555) 555-6666",
    lastMessage: "Let's schedule a meeting",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "4",
    name: "Emily Davis",
    phoneNumber: "+1 (555) 777-8888",
    lastMessage: "Perfect! See you then.",
    lastMessageTime: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 2,
    ).toISOString(), // 2 days ago
    unreadCount: 0,
    isOnline: false,
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hi there! How's your day going?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isOutgoing: false,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      content: "Pretty good, thanks for asking! Working on some new features.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isOutgoing: true,
      status: "read",
      type: "text",
    },
    {
      id: "3",
      content: "That sounds exciting! What kind of features?",
      timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      isOutgoing: false,
      status: "read",
      type: "text",
    },
    {
      id: "4",
      content:
        "Building an SMS management system with Twilio integration. It's pretty cool!",
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      isOutgoing: true,
      status: "delivered",
      type: "text",
    },
    {
      id: "5",
      content: "Hey, how are you doing?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isOutgoing: false,
      status: "read",
      type: "text",
    },
  ],
  "2": [
    {
      id: "1",
      content: "Hi Sarah! Just wanted to update you on the project status.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isOutgoing: true,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      content: "Thanks for the update!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isOutgoing: false,
      status: "read",
      type: "text",
    },
  ],
  "3": [
    {
      id: "1",
      content: "Hey Mike, do you have time for a quick meeting this week?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      isOutgoing: true,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      content: "Let's schedule a meeting",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isOutgoing: false,
      status: "read",
      type: "text",
    },
  ],
  "4": [
    {
      id: "1",
      content: "Emily, are we still on for coffee tomorrow?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isOutgoing: true,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      content: "Perfect! See you then.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isOutgoing: false,
      status: "read",
      type: "text",
    },
  ],
};

export default function Index() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [activePhoneNumber, setActivePhoneNumber] = useState<string | null>(
    initialPhoneNumbers[0].id,
  );
  const [phoneNumbers, setPhoneNumbers] = useState(
    initialPhoneNumbers.map((phone, index) => ({
      ...phone,
      isActive: index === 0,
    })),
  );
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "",
  });

  // Calculate total unread count
  const totalUnreadCount = contacts.reduce(
    (total, contact) => total + contact.unreadCount,
    0,
  );

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContactId) {
      setMessages(mockMessages[selectedContactId] || []);

      // Mark messages as read
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContactId
            ? { ...contact, unreadCount: 0 }
            : contact,
        ),
      );
    }
  }, [selectedContactId]);

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContactId) return;

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

    // Simulate sending message
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg,
        ),
      );
      setIsLoading(false);

      // Update last message in contact list
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContactId
            ? {
                ...contact,
                lastMessage: content,
                lastMessageTime: new Date().toISOString(),
              }
            : contact,
        ),
      );
    }, 1000);
  };

  const handleAddContact = (name: string, phoneNumber: string) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phoneNumber,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
      isOnline: false,
    };

    setContacts((prev) => [newContact, ...prev]);
  };

  const handleEditContact = (contactId: string) => {
    // TODO: Implement edit contact modal
    console.log("Edit contact:", contactId);
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    if (selectedContactId === contactId) {
      setSelectedContactId(null);
    }
  };

  const handleSelectPhoneNumber = (numberId: string) => {
    setActivePhoneNumber(numberId);
    // Update active state for all phone numbers
    setPhoneNumbers((prev) =>
      prev.map((phone) => ({
        ...phone,
        isActive: phone.id === numberId,
      })),
    );
  };

  const handleBuyNewNumber = () => {
    window.location.href = "/buy-numbers";
  };

  const handleUpdateProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logging out...");
  };

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navigation Bar */}
      <SMSNavbar
        unreadCount={totalUnreadCount}
        phoneNumbers={phoneNumbers}
        activeNumber={activePhoneNumber}
        profile={profile}
        onSelectNumber={handleSelectPhoneNumber}
        onBuyNewNumber={handleBuyNewNumber}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Contact List Sidebar */}
        <ContactList
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
          onAddContact={handleAddContact}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
        />

        {/* Chat Area */}
        <ChatArea
          selectedContact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Stats Bar (Optional) */}
      <div className="hidden sm:flex items-center justify-between px-6 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{contacts.length} contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{totalUnreadCount} unread</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{phoneNumbers.length} numbers</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Connected to Twilio
          </Badge>
        </div>
      </div>
    </div>
  );
}
