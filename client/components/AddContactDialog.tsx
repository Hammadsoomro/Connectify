import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: (name: string, phoneNumber: string) => void;
}

export default function AddContactDialog({
  open,
  onOpenChange,
  onAddContact,
}: AddContactDialogProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!phoneNumber.trim()) return;

    setIsLoading(true);

    // Use phone number as name if no name provided
    const contactName = name.trim() || phoneNumber.trim();

    try {
      await onAddContact(contactName, phoneNumber.trim());

      // Reset form
      setName("");
      setPhoneNumber("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && phoneNumber.trim()) {
      handleSave();
    }
  };

  const isValidPhoneNumber = (phone: string) => {
    // Simple validation for phone numbers
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10;
  };

  const canSave = phoneNumber.trim() && isValidPhoneNumber(phoneNumber);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Contact
          </DialogTitle>
          <DialogDescription>
            Enter a phone number to add a new contact. Name is optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              type="tel"
              className="font-mono"
              autoFocus
            />
            {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
              <p className="text-sm text-destructive">
                Please enter a valid phone number
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Contact Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Enter contact name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-xs text-muted-foreground">
              If no name is provided, the phone number will be used as the name
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="min-w-20"
          >
            {isLoading ? "Saving..." : "Save Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
