import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Plus, Bell, Settings, MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface PhoneNumber {
  id: string;
  number: string;
  isActive: boolean;
}

interface SMSNavbarProps {
  unreadCount: number;
  phoneNumbers: PhoneNumber[];
  activeNumber: string | null;
  onSelectNumber: (numberId: string) => void;
  onBuyNewNumber: () => void;
}

export default function SMSNavbar({
  unreadCount,
  phoneNumbers,
  activeNumber,
  onSelectNumber,
  onBuyNewNumber,
}: SMSNavbarProps) {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">SMS Hub</h1>
        </div>

        {/* Phone Numbers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Active Number:
            </span>
          </div>

          <Select value={activeNumber || ""} onValueChange={onSelectNumber}>
            <SelectTrigger className="w-48 h-9 font-mono text-sm">
              <SelectValue placeholder="Select a number..." />
            </SelectTrigger>
            <SelectContent>
              {phoneNumbers.map((phone) => (
                <SelectItem
                  key={phone.id}
                  value={phone.id}
                  className="font-mono"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{phone.number}</span>
                    {phone.isActive && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={onBuyNewNumber}
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary/80"
          >
            <Plus className="w-4 h-4 mr-1" />
            Buy New
          </Button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
