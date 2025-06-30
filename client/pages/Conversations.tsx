import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SMSNavbar from "@/components/SMSNavbar";
import ContactList, { Contact } from "@/components/ContactList";
import ChatArea, { Message } from "@/components/ChatArea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ApiService from "@/services/api";

export default function Conversations() {
  const navigate = useNavigate();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [activePhoneNumber, setActivePhoneNumber] = useState<string | null>(
    null,
  );
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

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

      // Set first phone number as active if none is active
      const activeNumber = phoneNumbersData.find((p: any) => p.isActive);
      if (activeNumber) {
        setActivePhoneNumber(activeNumber.id);
      } else if (phoneNumbersData.length > 0) {
        setActivePhoneNumber(phoneNumbersData[0].id);
        await ApiService.setActiveNumber(phoneNumbersData[0].id);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  // Load messages when contact is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedContactId) {
        try {
          const messagesData = await ApiService.getMessages(selectedContactId);
          setMessages(messagesData);

          // Mark messages as read
          await ApiService.markAsRead(selectedContactId);

          // Update local contact state
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === selectedContactId
                ? { ...contact, unreadCount: 0 }
                : contact,
            ),
          );
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };

    loadMessages();
  }, [selectedContactId]);

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContactId || !activePhoneNumber || isLoading) return;

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
        selectedContactId,
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
    } catch (error: any) {
      console.error("Error sending message:", error);

      let errorMessage = "Failed to send message";
      if (error.message.includes("NO_PHONE_NUMBER")) {
        errorMessage = "Please buy a phone number first to send SMS messages";
      } else if (error.message.includes("NO_ASSIGNED_NUMBER")) {
        errorMessage =
          "No phone number assigned to your account. Contact your admin to assign a number.";
      } else if (error.message.includes("INVALID_NUMBER")) {
        errorMessage = "Invalid phone number selected";
      } else if (error.message.includes("INSUFFICIENT_BALANCE")) {
        errorMessage =
          "Insufficient wallet balance. Please add funds to continue.";
      } else {
        errorMessage = error.message || "Failed to send message";
      }

      // Show more detailed error in development
      const detailedError =
        process.env.NODE_ENV === "development"
          ? `\n\nDetails: ${error.message}\nStack: ${error.stack || "No stack trace"}`
          : "";

      alert(`${errorMessage}${detailedError}`);

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

  const handleAddContact = async (name: string, phoneNumber: string) => {
    try {
      const newContact = await ApiService.addContact(name, phoneNumber);
      setContacts((prev) => [newContact, ...prev]);
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const handleEditContact = (contactId: string) => {
    // TODO: Implement edit contact modal
    console.log("Edit contact:", contactId);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await ApiService.deleteContact(contactId);
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      if (selectedContactId === contactId) {
        setSelectedContactId(null);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleSelectPhoneNumber = async (numberId: string) => {
    try {
      await ApiService.setActiveNumber(numberId);
      setActivePhoneNumber(numberId);
      // Update active state for all phone numbers
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

  const handleBuyNewNumber = () => {
    navigate("/buy-numbers");
  };

  const handleUpdateProfile = async (newProfile: typeof profile) => {
    try {
      const updatedProfile = await ApiService.updateProfile(newProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    ApiService.logout();
    navigate("/");
  };

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;

  const totalUnreadCount = contacts.reduce(
    (total, contact) => total + contact.unreadCount,
    0,
  );

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
    </div>
  );
}
