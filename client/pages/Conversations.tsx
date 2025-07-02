import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SMSNavbar from "@/components/SMSNavbar";
import ContactList, { Contact } from "@/components/ContactList";
import ChatArea, { Message } from "@/components/ChatArea";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ApiService from "@/services/api";
import socketService from "@/services/socketService";

export default function Conversations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [allPhoneNumberContacts, setAllPhoneNumberContacts] = useState<{
    [phoneNumber: string]: Contact[];
  }>({});
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });

  // Initialize data loading
  useEffect(() => {
    const phoneNumberFromUrl = searchParams.get("phoneNumber");
    loadInitialData(phoneNumberFromUrl);
  }, []);

  // Initialize Socket.IO separately (don't block loading)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      socketService.connect(token);

      // Set up Socket.IO event listeners
      const handleNewMessage = (data: any) => {
        console.log("📱 New message received via Socket.IO:", data);

        // Reload contacts to update last message and unread counts
        if (activePhoneNumber) {
          loadContacts();
        }

        // If the message is for the currently selected contact, reload messages
        if (selectedContactId === data.contactId) {
          loadMessages();
        }

        // Update page title with unread count
        const totalUnread = contacts.reduce(
          (sum, contact) => sum + (contact.unreadCount || 0),
          0,
        );
        if (totalUnread > 0) {
          document.title = `(${totalUnread + 1}) Connectify - Messages`;
        } else {
          document.title = "Connectify - Messages";
        }
      };

      const handleContactsUpdated = (data: any) => {
        console.log("👥 Contacts updated via Socket.IO:", data);
        if (activePhoneNumber === data.phoneNumberId) {
          setContacts(data.contacts);
        }
      };

      const handleUnreadUpdated = (data: any) => {
        console.log("🔔 Unread counts updated via Socket.IO:", data);
        loadAllPhoneNumberContacts();
      };

      const handleMessageStatusUpdate = (data: any) => {
        console.log("✓ Message status updated via Socket.IO:", data);
        if (selectedContactId) {
          loadMessages();
        }
      };

      // Register event listeners
      socketService.on("newMessage", handleNewMessage);
      socketService.on("contactsUpdated", handleContactsUpdated);
      socketService.on("unreadUpdated", handleUnreadUpdated);
      socketService.on("messageStatusUpdate", handleMessageStatusUpdate);

      // Cleanup function
      return () => {
        socketService.off("newMessage", handleNewMessage);
        socketService.off("contactsUpdated", handleContactsUpdated);
        socketService.off("unreadUpdated", handleUnreadUpdated);
        socketService.off("messageStatusUpdate", handleMessageStatusUpdate);
      };
    }
  }, [activePhoneNumber, selectedContactId]);

  // Join/leave phone number rooms when active number changes
  useEffect(() => {
    if (activePhoneNumber) {
      socketService.joinPhoneNumber(activePhoneNumber);
      loadContacts();

      return () => {
        socketService.leavePhoneNumber(activePhoneNumber);
      };
    }
  }, [activePhoneNumber]);

  const loadInitialData = async (selectedPhoneNumberId?: string | null) => {
    try {
      const userProfile = await ApiService.getProfile();
      setProfile(userProfile);

      // Try to load phone numbers with retry logic
      let phoneNumbersData = [];
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && phoneNumbersData.length === 0) {
        try {
          attempts++;
          phoneNumbersData = await ApiService.getPhoneNumbers();

          if (phoneNumbersData.length > 0) {
            setPhoneNumbers(phoneNumbersData);

            // Set active phone number based on URL parameter or default logic
            let targetPhoneNumberId = selectedPhoneNumberId;

            if (selectedPhoneNumberId) {
              // Use phone number from URL
              const phoneFromUrl = phoneNumbersData.find(
                (p: any) => p.id === selectedPhoneNumberId,
              );
              if (phoneFromUrl) {
                targetPhoneNumberId = phoneFromUrl.id;
              }
            }

            if (!targetPhoneNumberId) {
              // Fall back to active number or first number
              const activeNumber = phoneNumbersData.find(
                (p: any) => p.isActive,
              );
              if (activeNumber) {
                targetPhoneNumberId = activeNumber.id;
              } else if (phoneNumbersData.length > 0) {
                targetPhoneNumberId = phoneNumbersData[0].id;
              }
            }

            if (targetPhoneNumberId) {
              setActivePhoneNumber(targetPhoneNumberId);

              // Try to set active number via API
              try {
                await ApiService.setActiveNumber(targetPhoneNumberId);
              } catch (setActiveError) {
                console.log("Could not set active number, continuing anyway");
              }
            }
            break; // Success, exit retry loop
          }
        } catch (phoneError: any) {
          console.error(
            `Phone number loading attempt ${attempts} failed:`,
            phoneError.message,
          );

          // Handle network errors gracefully
          if (
            phoneError.message?.includes("Unable to connect") ||
            phoneError.message?.includes("Failed to fetch")
          ) {
            console.log(
              "Network error loading phone numbers, will continue with empty state",
            );
            if (attempts === maxAttempts) {
              setPhoneNumbers([]);
              setActivePhoneNumber(null);
              break;
            }
          } else if (attempts === maxAttempts) {
            console.log("All phone number loading attempts failed");
            setPhoneNumbers([]);
            setActivePhoneNumber(null);
          }

          if (attempts < maxAttempts) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      // Set default state even on error
      setPhoneNumbers([]);
      setActivePhoneNumber(null);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!activePhoneNumber) {
      console.log("No active phone number for contact loading");
      return;
    }

    try {
      setIsLoadingContacts(true);
      const activeNumber = phoneNumbers.find((p) => p.id === activePhoneNumber);
      const phoneNumber = activeNumber?.number;

      if (!phoneNumber) {
        console.log("No phone number found for contact loading");
        setContacts([]);
        return;
      }

      console.log(`Loading contacts for phone number: ${phoneNumber}`);
      const contactsData = await ApiService.getContacts(phoneNumber);

      // Ensure we have valid data before setting
      if (Array.isArray(contactsData)) {
        console.log(`✅ Loaded ${contactsData.length} contacts`);
        setContacts(contactsData);
      } else {
        console.log("Invalid contacts data received:", contactsData);
        setContacts([]);
      }
    } catch (error: any) {
      console.error("Failed to load contacts:", error.message);

      // Handle different error types gracefully
      if (error.message?.includes("Failed to fetch")) {
        console.log("Network error - server may be temporarily unavailable");
      } else if (
        error.message?.includes("403") ||
        error.message?.includes("401")
      ) {
        console.log("Authentication error - please login again");
        // Clear auth and redirect to login
        localStorage.removeItem("authToken");
        window.location.href = "/";
      }

      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadAllPhoneNumberContacts = async () => {
    if (phoneNumbers.length === 0) return;

    try {
      const allContacts: { [phoneNumber: string]: Contact[] } = {};

      for (const phone of phoneNumbers) {
        try {
          const contactsData = await ApiService.getContacts(phone.number);
          if (Array.isArray(contactsData)) {
            allContacts[phone.number] = contactsData;
          }
        } catch (error) {
          console.log(`Failed to load contacts for ${phone.number}`);
          allContacts[phone.number] = [];
        }
      }

      setAllPhoneNumberContacts(allContacts);
    } catch (error) {
      console.error("Failed to load all phone number contacts:", error);
    }
  };

  const loadMessages = async () => {
    if (!selectedContactId || !activePhoneNumber) return;

    try {
      setIsLoading(true);
      const activeNumber = phoneNumbers.find((p) => p.id === activePhoneNumber);
      const phoneNumber = activeNumber?.number;

      if (!phoneNumber) {
        setMessages([]);
        return;
      }

      const messagesData = await ApiService.getMessages(
        selectedContactId,
        phoneNumber,
      );

      if (Array.isArray(messagesData)) {
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts when active phone number changes
  useEffect(() => {
    if (activePhoneNumber && phoneNumbers.length > 0) {
      // Clear selected contact and messages when changing numbers
      setSelectedContactId(null);
      setMessages([]);

      // Load contacts for the new number
      loadContacts();
    } else if (phoneNumbers.length === 0) {
      // No phone numbers available - clear everything
      setSelectedContactId(null);
      setMessages([]);
      setContacts([]);
      setAllPhoneNumberContacts({});
    }
  }, [activePhoneNumber]);

  // Load all phone number contacts when phone numbers change
  useEffect(() => {
    if (phoneNumbers.length > 0) {
      loadAllPhoneNumberContacts();
    }
  }, [phoneNumbers]);

  const handleSelectContact = async (contactId: string) => {
    // Don't reload if same contact is selected
    if (selectedContactId === contactId) return;

    setSelectedContactId(contactId);

    // Immediately load messages for instant UI feedback
    const activeNumber = phoneNumbers.find((p) => p.id === activePhoneNumber);
    if (activeNumber?.number) {
      try {
        setIsLoading(true);
        const messagesData = await ApiService.getMessages(
          contactId,
          activeNumber.number,
        );
        if (Array.isArray(messagesData)) {
          setMessages(messagesData);
        }

        // Mark messages as read
        await ApiService.markAsRead(contactId);

        // Reload contacts to update unread count
        setTimeout(loadContacts, 500);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContactId || !activePhoneNumber || isLoading) return;

    const activeNumber = phoneNumbers.find((p) => p.id === activePhoneNumber);
    if (!activeNumber) return;

    // Find the selected contact
    const selectedContact = contacts.find((c) => c.id === selectedContactId);
    if (!selectedContact) return;

    // Prevent sending to the same number (self-messaging)
    if (selectedContact.phoneNumber === activeNumber.number) {
      alert(
        "You cannot send messages to the same phone number you're sending from. Please select a different contact or phone number.",
      );
      return;
    }

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

      alert(errorMessage);

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

      // Add contact to current list
      setContacts((prev) => [newContact, ...prev]);

      // Also refresh contacts from server to ensure persistence
      setTimeout(() => {
        if (activePhoneNumber) {
          const activeNumber = phoneNumbers.find(
            (p) => p.id === activePhoneNumber,
          );
          if (activeNumber?.number) {
            loadContacts();
          }
        }
      }, 500);
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
      const phoneNumber = phoneNumbers.find((p) => p.id === numberId)?.number;
      console.log(`🔄 Switching to phone number: ${phoneNumber} (${numberId})`);

      // Immediately clear everything to ensure complete isolation
      setSelectedContactId(null);
      setMessages([]);
      setContacts([]); // Clear contacts immediately

      // Leave current phone number room
      if (activePhoneNumber) {
        socketService.leavePhoneNumber(activePhoneNumber);
      }

      // Set new active phone number
      setActivePhoneNumber(numberId);

      // Join new phone number room
      socketService.joinPhoneNumber(numberId);

      // Update active number on server
      try {
        await ApiService.setActiveNumber(numberId);
      } catch (setActiveError) {
        console.log("Could not set active number on server:", setActiveError);
      }

      console.log(`✅ Successfully switched to phone number: ${phoneNumber}`);
    } catch (error) {
      console.error("Error switching phone number:", error);
    }
  };

  // Calculate phone number unread counts
  const phoneNumberUnreadCounts = Object.entries(allPhoneNumberContacts).reduce(
    (acc, [phoneNumber, contacts]) => {
      acc[phoneNumber] = contacts.reduce(
        (sum, contact) => sum + (contact.unreadCount || 0),
        0,
      );
      return acc;
    },
    {} as { [phoneNumber: string]: number },
  );

  const totalUnreadCount = Object.values(phoneNumberUnreadCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Show message if no phone numbers available
  if (!isInitialLoading && phoneNumbers.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SMSNavbar
          unreadCount={0}
          phoneNumbers={[]}
          activeNumber={null}
          profile={profile}
          phoneNumberUnreadCounts={{}}
          onSelectNumber={() => {}}
          onBuyNewNumber={() => navigate("/buy-numbers")}
          onUpdateProfile={() => {}}
          onLogout={() => {
            localStorage.removeItem("authToken");
            socketService.disconnect();
            window.location.href = "/";
          }}
        />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Phone Numbers</h2>
            <p className="text-muted-foreground mb-6">
              You need to purchase a phone number to start messaging.
            </p>
            <Button onClick={() => navigate("/buy-numbers")}>
              Buy Phone Number
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  return (
    <div className="min-h-screen bg-background">
      <SMSNavbar
        unreadCount={totalUnreadCount}
        phoneNumbers={phoneNumbers}
        activeNumber={activePhoneNumber}
        profile={profile}
        phoneNumberUnreadCounts={phoneNumberUnreadCounts}
        onSelectNumber={handleSelectPhoneNumber}
        onBuyNewNumber={() => navigate("/buy-numbers")}
        onUpdateProfile={() => {}}
        onLogout={() => {
          localStorage.removeItem("authToken");
          socketService.disconnect();
          window.location.href = "/";
        }}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Back Button - Mobile Only */}
        <div className="md:hidden p-4 border-b">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Sidebar with Contact List and Ad */}
        <div className="w-96 border-r bg-card flex flex-col">
          {/* Contact List */}
          <div className="flex-1">
            <ContactList
              contacts={contacts}
              selectedContactId={selectedContactId}
              onSelectContact={handleSelectContact}
              onAddContact={handleAddContact}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
              isLoading={isLoadingContacts}
            />
          </div>

          {/* Ad Banner */}
          <div className="p-4 border-t bg-muted/30">
            <div className="text-center mb-2">
              <span className="text-xs text-muted-foreground">
                Advertisement
              </span>
            </div>
            <div className="flex justify-center">
              <AdBanner width={300} height={250} />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <ChatArea
              contact={selectedContact}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-lg mb-2">Select a conversation</div>
                <div className="text-sm">
                  Choose a contact from the list to start messaging
                </div>
                {contacts.length === 0 && (
                  <div className="mt-4 text-xs">
                    No contacts found. Add a contact to get started.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
