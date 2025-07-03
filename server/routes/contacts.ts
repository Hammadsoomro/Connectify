import { Request, Response } from "express";
import Contact from "../models/Contact.js";
import Message from "../models/Message.js";

// Get all contacts for user
export const getContacts = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const contacts = await Contact.find({ userId }).sort({ updatedAt: -1 });

    // Get last message and unread count for each contact
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await Message.findOne({
          userId,
          contactId: contact._id,
        })
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await Message.countDocuments({
          userId,
          contactId: contact._id,
          isOutgoing: false,
          status: { $ne: "read" },
        });

        return {
          id: contact._id,
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          avatar: contact.avatar,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.createdAt?.toISOString(),
          unreadCount,
          isOnline: contact.isOnline,
        };
      }),
    );

    res.json(contactsWithDetails);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// Add new contact
export const addContact = async (req: any, res: Response) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.user._id;

    // Check if contact already exists
    const existingContact = await Contact.findOne({ userId, phoneNumber });
    if (existingContact) {
      return res.status(400).json({ message: "Contact already exists" });
    }

    // Create new contact
    const contact = new Contact({
      userId,
      name,
      phoneNumber,
      isOnline: false,
    });

    await contact.save();

    res.status(201).json({
      id: contact._id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      avatar: contact.avatar,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
      isOnline: false,
    });
  } catch (error) {
    console.error("Add contact error:", error);
    res.status(500).json({ message: "Failed to add contact" });
  }
};

// Update contact
export const updateContact = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const { name, avatar } = req.body;
    const userId = req.user._id;

    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.name = name || contact.name;
    contact.avatar = avatar !== undefined ? avatar : contact.avatar;

    await contact.save();

    res.json({
      id: contact._id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      avatar: contact.avatar,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// Delete contact
export const deleteContact = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await Contact.findOne({ _id: contactId, userId });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Delete contact and associated messages
    await Promise.all([
      Contact.deleteOne({ _id: contactId }),
      Message.deleteMany({ contactId }),
    ]);

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};

// Mark messages as read
export const markAsRead = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        userId,
        contactId,
        isOutgoing: false,
        status: { $ne: "read" },
      },
      { status: "read" },
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};
