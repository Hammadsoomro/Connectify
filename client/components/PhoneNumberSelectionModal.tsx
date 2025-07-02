import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, MessageSquare } from "lucide-react";

interface PhoneNumber {
  id: string;
  number: string;
  friendlyName?: string;
  status: string;
}

interface PhoneNumberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumbers: PhoneNumber[];
  phoneNumberUnreadCounts: { [phoneNumber: string]: number };
  onSelectPhoneNumber: (phoneNumber: PhoneNumber) => void;
}

export default function PhoneNumberSelectionModal({
  isOpen,
  onClose,
  phoneNumbers,
  phoneNumberUnreadCounts = {},
  onSelectPhoneNumber,
}: PhoneNumberSelectionModalProps) {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(
    null,
  );

  const handleSelectAndProceed = () => {
    if (selectedNumber) {
      onSelectPhoneNumber(selectedNumber);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Select Phone Number
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose which phone number's inbox you want to access:
          </p>

          <ScrollArea className="max-h-80">
            <div className="space-y-2">
              {phoneNumbers.map((phoneNumber) => {
                const unreadCount =
                  phoneNumberUnreadCounts[phoneNumber.number] || 0;
                const isSelected = selectedNumber?.id === phoneNumber.id;

                return (
                  <div
                    key={phoneNumber.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedNumber(phoneNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            isSelected ? "bg-primary/20" : "bg-accent"
                          }`}
                        >
                          <Phone
                            className={`w-4 h-4 ${
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            {phoneNumber.friendlyName || phoneNumber.number}
                          </div>
                          {phoneNumber.friendlyName && (
                            <div className="text-sm text-muted-foreground">
                              {phoneNumber.number}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground capitalize">
                            Status: {phoneNumber.status}
                          </div>
                        </div>
                      </div>

                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {phoneNumbers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No phone numbers available</p>
              <p className="text-sm">
                Purchase a phone number to start messaging
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSelectAndProceed}
              disabled={!selectedNumber}
              className="flex-1"
            >
              Open Inbox
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
