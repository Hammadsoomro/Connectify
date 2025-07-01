import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, MoreVertical, Phone, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddContactDialog from "./AddContactDialog";

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onAddContact: (name: string, phoneNumber: string) => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
}

export default function ContactList({
  contacts,
  selectedContactId,
  onSelectContact,
  onAddContact,
  onEditContact,
  onDeleteContact,
}: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery),
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Contact List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredContacts
            .sort((a, b) => {
              // Sort by unread count first (unread contacts at top)
              if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
              if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

              // Then keep original order
              return 0;
            })
            .map((contact) => (
              <div
                key={contact.id}
                className={`relative p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedContactId === contact.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-accent hover:text-accent-foreground"
                } ${
                  contact.unreadCount > 0
                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    `Contact clicked: ${contact.id} - ${contact.name}`,
                  );
                  onSelectContact(contact.id);
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`truncate ${
                          contact.unreadCount > 0
                            ? "font-bold text-blue-900"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {contact.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {contact.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(contact.lastMessageTime)}
                          </span>
                        )}
                        {contact.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-5 w-5 rounded-full p-0 text-xs font-bold animate-pulse"
                          >
                            {contact.unreadCount > 99
                              ? "99+"
                              : contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span
                        className={`text-xs font-mono ${
                          contact.unreadCount > 0
                            ? "text-blue-700 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {contact.phoneNumber}
                      </span>
                    </div>

                    {contact.lastMessage && (
                      <p
                        className={`text-sm truncate mt-1 ${
                          contact.unreadCount > 0
                            ? "text-blue-700 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {contact.lastMessage}
                      </p>
                    )}
                  </div>

                  {/* Unread badge and menu */}
                  <div className="flex flex-col items-end gap-2">
                    {contact.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-5 text-xs"
                      >
                        {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEditContact(contact.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteContact(contact.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? "No contacts found" : "No contacts yet"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AddContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddContact={onAddContact}
      />
    </div>
  );
}
