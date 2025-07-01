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
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRealTimeUpdate, setIsRealTimeUpdate] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "admin",
  });

  useEffect(() => {
    loadInitialData();

    // Real-time polling every 2 seconds for smooth updates
    const messagePolling = setInterval(() => {
      if (activePhoneNumber && document.hasFocus()) {
        const activeNumber = phoneNumbers.find(
          (phone) => phone.id === activePhoneNumber,
        );
        const phoneNumber = activeNumber?.number;

        if (phoneNumber) {
          // Always update contacts for new messages
          setIsRealTimeUpdate(true);
          ApiService.getContacts(phoneNumber)
            .then((contactsData) => {
              if (contactsData && Array.isArray(contactsData)) {
                // Check for any changes in contacts or unread counts
                const contactsChanged =
                  contactsData.length !== contacts.length ||
                  contactsData.some((newContact, index) => {
                    const oldContact = contacts[index];
                    return (
                      !oldContact ||
                      oldContact.unreadCount !== newContact.unreadCount ||
                      oldContact.lastMessage !== newContact.lastMessage ||
                      oldContact.lastMessageTime !== newContact.lastMessageTime
                    );
                  });

                // Check for new unread messages for notification
                const hasNewUnreadMessages = contactsData.some((newContact) => {
                  const oldContact = contacts.find(
                    (c) => c.id === newContact.id,
                  );
                  return (
                    oldContact &&
                    newContact.unreadCount > oldContact.unreadCount
                  );
                });

                if (contactsChanged) {
                  setContacts(contactsData);

                  // Show subtle notification for new messages
                  if (hasNewUnreadMessages && document.hasFocus()) {
                    console.log("📱 New message received!");
                  }
                }
              }
            })
            .catch(() => {});

          // If a conversation is selected, update messages
          if (selectedContactId) {
            ApiService.getMessages(selectedContactId, phoneNumber)
              .then((messagesData) => {
                if (messagesData && Array.isArray(messagesData)) {
                  // Check for new messages or status changes
                  const messagesChanged =
                    messagesData.length !== messages.length ||
                    messagesData.some((newMsg, index) => {
                      const oldMsg = messages[index];
                      return (
                        !oldMsg ||
                        oldMsg.status !== newMsg.status ||
                        oldMsg.content !== newMsg.content
                      );
                    });

                  if (messagesChanged) {
                    setMessages(messagesData);
                  }
                }
              })
              .catch(() => {});
          }
        }
      }
    }, 2000); // Real-time 2-second polling for smoothness

    // Additional super-fast polling for new message notifications (every 1 second)
    const notificationPolling = setInterval(() => {
      if (activePhoneNumber && !selectedContactId) {
        const activeNumber = phoneNumbers.find(
          (phone) => phone.id === activePhoneNumber,
        );
        const phoneNumber = activeNumber?.number;

        if (phoneNumber) {
          // Quick contact check for new messages when no conversation is open
          ApiService.getContacts(phoneNumber)
            .then((contactsData) => {
              if (contactsData && Array.isArray(contactsData)) {
                const hasNewMessages = contactsData.some(
                  (contact) => contact.unreadCount > 0,
                );
                if (hasNewMessages || contactsData.length !== contacts.length) {
                  setContacts(contactsData);
                }
              }
            })
            .catch(() => {});
        }
      }
    }, 1000); // Super-fast 1-second polling for new message notifications

    return () => {
      clearInterval(messagePolling);
      clearInterval(notificationPolling);
    };
  }, [selectedContactId, messages.length, contacts.length]);

  const loadInitialData = async () => {
    try {
      setIsLoadingContacts(true);
      setIsInitialLoading(true);

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

            // Set first phone number as active if none is active
            const activeNumber = phoneNumbersData.find((p: any) => p.isActive);
            if (activeNumber) {
              setActivePhoneNumber(activeNumber.id);
            } else if (phoneNumbersData.length > 0) {
              setActivePhoneNumber(phoneNumbersData[0].id);

              // Try to set active number via API
              try {
                await ApiService.setActiveNumber(phoneNumbersData[0].id);
              } catch (setActiveError) {
                console.log("Could not set active number via API, continuing");
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
    } finally {
      setIsLoadingContacts(false);
      setIsInitialLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!activePhoneNumber || phoneNumbers.length === 0) {
      setContacts([]);
      return;
    }

    try {
      setIsLoadingContacts(true);

      // Get the active phone number
      const activeNumber = phoneNumbers.find(
        (phone) => phone.id === activePhoneNumber,
      );

      if (!activeNumber?.number) {
        console.log("Active phone number not found");
        setContacts([]);
        return;
      }

      const contactsData = await ApiService.getContacts(activeNumber.number);

      // Ensure we have valid data before setting
      if (Array.isArray(contactsData)) {
        setContacts(contactsData);
      } else {
        console.log("Invalid contacts data received");
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
      }

      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
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
    }
  }, [activePhoneNumber]);

  // Messages are now loaded immediately in handleSelectContact for instant opening

  const handleSelectContact = async (contactId: string) => {
    // Don't reload if same contact is selected
    if (selectedContactId === contactId) return;

    // Set the selected contact immediately
    setSelectedContactId(contactId);

    // Clear messages to prevent showing old messages from different contact
    setMessages([]);

    // Immediately load messages for instant conversation opening
    if (activePhoneNumber) {
      const activeNumber = phoneNumbers.find(
        (phone) => phone.id === activePhoneNumber,
      );

      if (activeNumber?.number) {
        try {
          const messagesData = await ApiService.getMessages(
            contactId,
            activeNumber.number,
          );
          if (messagesData && Array.isArray(messagesData)) {
            setMessages(messagesData);
          }

          // Mark as read immediately
          await ApiService.markAsRead(contactId);

          // Update contact list to reflect read status
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === contactId
                ? { ...contact, unreadCount: 0 }
                : contact,
            ),
          );
        } catch (error) {
          console.log("Error immediately loading messages:", error);
        }
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
      // Immediately clear everything to prevent old data showing
      setSelectedContactId(null);
      setMessages([]);
      setContacts([]);

      // Update the active number
      await ApiService.setActiveNumber(numberId);
      setActivePhoneNumber(numberId);

      // Update active state for all phone numbers
      setPhoneNumbers((prev) =>
        prev.map((phone) => ({
          ...phone,
          isActive: phone.id === numberId,
        })),
      );

      // Load contacts for the new number will happen in useEffect
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
    // Clear authentication immediately
    localStorage.removeItem("authToken");
    localStorage.clear();

    // Force navigate to home page
    window.location.href = "/";
  };

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;

  const totalUnreadCount = contacts.reduce(
    (total, contact) => total + contact.unreadCount,
    0,
  );

  // Update page title with unread count for real-time awareness
  useEffect(() => {
    if (totalUnreadCount > 0) {
      document.title = `(${totalUnreadCount}) Connectify - Messages`;
    } else {
      document.title = "Connectify - Messages";
    }

    // Cleanup on unmount
    return () => {
      document.title = "Connectify";
    };
  }, [totalUnreadCount]);

  // Only log if there are issues
  if (phoneNumbers.length === 0 && !isInitialLoading) {
    console.log("No phone numbers available");
  }

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
        {phoneNumbers.length === 0 && !isInitialLoading ? (
          /* No Phone Numbers Message */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">
                No Phone Numbers Available
              </h2>
              <p className="text-muted-foreground mb-4">
                {profile.role === "admin"
                  ? "You need to purchase phone numbers to start messaging."
                  : "No phone numbers have been assigned to your account. Contact your admin."}
              </p>
              {profile.role === "admin" && (
                <Button onClick={handleBuyNewNumber}>Buy Phone Number</Button>
              )}
            </div>
          </div>
        ) : isInitialLoading ? (
          /* Initial Loading State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold mb-2">Initializing...</h2>
              <p className="text-muted-foreground">
                Loading your account data...
              </p>
            </div>
          </div>
        ) : isLoadingContacts ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold mb-2">
                Loading Conversations
              </h2>
              <p className="text-muted-foreground">Connecting to server...</p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
