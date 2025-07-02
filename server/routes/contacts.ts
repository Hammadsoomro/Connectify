import { Request, Response } from "express";
import Contact from "../models/Contact.js";
import Message from "../models/Message.js";

// Get all contacts for user, optionally filtered by phone number
export const getContacts = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { phoneNumber } = req.query;

    // Each user (admin and sub-account) uses their own userId for data isolation
    const lookupUserId = user._id;

    let contactIds = [];

    console.log(
      `Loading contacts for userId: ${lookupUserId}, userRole: ${user.role}, phoneNumber: ${phoneNumber || "all"}`,
    );

    let contacts;

    if (phoneNumber) {
      // For phone number isolation: only show contacts that have messages with this phone number
      const messagesWithContacts = await Message.find({
        userId: lookupUserId,
        $or: [{ fromNumber: phoneNumber }, { toNumber: phoneNumber }],
      }).distinct("contactId");

      console.log(
        `Found ${messagesWithContacts.length} contacts with messages for phone ${phoneNumber}`,
      );

      // Get contacts that have messages with this phone number
      contacts = await Contact.find({
        userId: lookupUserId,
        _id: { $in: messagesWithContacts },
      }).sort({ createdAt: -1 });
    } else {
      // No phone number filter - show all contacts
      contacts = await Contact.find({ userId: lookupUserId }).sort({
        createdAt: -1,
      });
    }

    // Get last message and unread count for each contact
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        // Filter messages by phone number if provided
        const messageQuery: any = {
          userId: lookupUserId,
          contactId: contact._id,
        };

        if (phoneNumber) {
          messageQuery.$or = [
            { fromNumber: phoneNumber },
            { toNumber: phoneNumber },
          ];
        }

        const lastMessage = await Message.findOne(messageQuery)
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await Message.countDocuments({
          ...messageQuery,
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
    const { name, phoneNumber, activePhoneNumber } = req.body;
    const user = req.user;

    // Each user (admin and sub-account) uses their own userId for data isolation
    const lookupUserId = user._id;

    console.log(
      `Adding contact for user: ${user.email} (${user.role}), using userId: ${lookupUserId}, activePhone: ${activePhoneNumber}`,
    );

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      userId: lookupUserId,
      phoneNumber,
    });
    if (existingContact) {
      console.log(
        `Contact already exists: ${phoneNumber} for userId ${lookupUserId}, returning existing contact`,
      );

      // Get additional details for the existing contact
      const lastMessage = await Message.findOne({
        userId: lookupUserId,
        contactId: existingContact._id,
      })
        .sort({ createdAt: -1 })
        .limit(1);

      const unreadCount = await Message.countDocuments({
        userId: lookupUserId,
        contactId: existingContact._id,
        isOutgoing: false,
        status: { $ne: "read" },
      });

      return res.status(200).json({
        id: existingContact._id,
        name: existingContact.name,
        phoneNumber: existingContact.phoneNumber,
        avatar: existingContact.avatar,
        lastMessage: lastMessage?.content,
        lastMessageTime: lastMessage?.createdAt?.toISOString(),
        unreadCount,
        isOnline: existingContact.isOnline,
      });
    }

    // Create new contact with phone number association
    const associatedPhoneNumbers = activePhoneNumber ? [activePhoneNumber] : [];

    const contact = new Contact({
      userId: lookupUserId,
      name,
      phoneNumber,
      associatedPhoneNumbers,
    });

    await contact.save();

    console.log(
      `Contact created successfully: ${name} (${phoneNumber}) for userId ${lookupUserId}`,
    );

    res.status(201).json({
      id: contact._id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      avatar: contact.avatar,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
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
    const user = req.user;

    // Each user (admin and sub-account) uses their own userId for data isolation
    const lookupUserId = user._id;

    const contact = await Contact.findOne({
      _id: contactId,
      userId: lookupUserId,
    });
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
    const user = req.user;

    // Each user (admin and sub-account) uses their own userId for data isolation
    const lookupUserId = user._id;

    console.log(
      `Deleting contact ${contactId} for user ${user.email} (role: ${user.role}), using userId: ${lookupUserId}`,
    );

    const contact = await Contact.findOne({
      _id: contactId,
      userId: lookupUserId,
    });
    if (!contact) {
      console.log(`Contact ${contactId} not found for userId ${lookupUserId}`);
      return res.status(404).json({ message: "Contact not found" });
    }

    // Delete contact and associated messages (use admin's userId for messages)
    await Promise.all([
      Contact.deleteOne({ _id: contactId }),
      Message.deleteMany({ contactId, userId: lookupUserId }),
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
    const user = req.user;

    // Each user (admin and sub-account) uses their own userId for data isolation
    const lookupUserId = user._id;

    await Message.updateMany(
      {
        userId: lookupUserId,
        contactId,
        isOutgoing: false,
        status: { $ne: "read" },
      },
      { status: "read" },
    );

    // Reset unread count for the contact
    await Contact.findByIdAndUpdate(
      contactId,
      { unreadCount: 0 },
      { new: true },
    );

    console.log(
      `Messages marked as read and unread count reset for contact: ${contactId}`,
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};
