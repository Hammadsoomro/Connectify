import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Phone, MapPin, Globe, Search } from "lucide-react";
import { Link } from "react-router-dom";
import AdBanner from "@/components/AdBanner";
import ApiService from "@/services/api";

const countries = [
  { code: "ALL", name: "All Countries", flag: "🌍" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "����🇷" },
];

export default function BuyNumbers() {
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [filteredNumbers, setFilteredNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areaCode, setAreaCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [searchLoading, setSearchLoading] = useState(false);
  const [purchasingNumber, setPurchasingNumber] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableNumbers();
  }, []);

  // Filter numbers by selected country
  useEffect(() => {
    if (selectedCountry === "ALL") {
      setFilteredNumbers(availableNumbers);
    } else {
      const selectedCountryName = countries.find(
        (c) => c.code === selectedCountry,
      )?.name;
      const filtered = availableNumbers.filter((number) => {
        return number.country === selectedCountryName;
      });
      setFilteredNumbers(filtered);
    }
  }, [availableNumbers, selectedCountry]);

  const loadAvailableNumbers = async () => {
    try {
      setIsLoading(true);
      const numbers = await ApiService.getAvailableNumbers();
      setAvailableNumbers(numbers);
    } catch (error) {
      console.error("Error loading available numbers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    // Prevent double search
    if (searchLoading) return;

    if (!areaCode.trim()) {
      loadAvailableNumbers();
      return;
    }

    try {
      setSearchLoading(true);
      const numbers = await ApiService.getAvailableNumbers(areaCode);
      setAvailableNumbers(numbers);
    } catch (error: any) {
      console.error("Error searching numbers:", error);
      if (error.message.includes("timeout")) {
        alert("Search timed out. Please try again.");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePurchaseNumber = async (phoneNumber: string) => {
    // Prevent double-clicking
    if (purchasingNumber === phoneNumber) return;

    try {
      setPurchasingNumber(phoneNumber);
      await ApiService.purchaseNumber(phoneNumber);

      // Remove purchased number from available list
      setAvailableNumbers((prev) =>
        prev.filter((num) => num.number !== phoneNumber),
      );

      // Show success message or redirect
      alert(
        "Number purchased successfully! You can now use it to send messages.",
      );
    } catch (error: any) {
      console.error("Error purchasing number:", error);

      let errorMessage = "Failed to purchase number. Please try again.";
      if (error.message.includes("ADMIN_ONLY")) {
        errorMessage =
          "Only admin accounts can purchase phone numbers. Contact your admin.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else {
        errorMessage =
          error.message || "Failed to purchase number. Please try again.";
      }

      alert(errorMessage);
    } finally {
      setPurchasingNumber(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Connectify
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Buy Phone Numbers</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Available Twilio Phone Numbers
          </h2>
          <p className="text-muted-foreground mb-6">
            Choose from our available Twilio phone numbers to start sending and
            receiving SMS messages. All numbers are powered by Twilio's reliable
            infrastructure.
          </p>

          {/* Country and Area Code Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            <div>
              <Label htmlFor="country">Select Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="areaCode">Area Code (Optional)</Label>
              <Input
                id="areaCode"
                placeholder="e.g., 212, 415, 310"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                maxLength={3}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              className="mt-6"
            >
              <Search className="w-4 h-4 mr-2" />
              {searchLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-6 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded mt-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNumbers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Numbers Available
                </h3>
                <p className="text-muted-foreground">
                  No phone numbers available for{" "}
                  {countries.find((c) => c.code === selectedCountry)?.name}. Try
                  selecting a different country.
                </p>
              </div>
            ) : (
              filteredNumbers.map((number) => (
                <Card key={number.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            number.type === "Toll-Free"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {number.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Twilio
                        </Badge>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {number.price}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-mono">
                      {number.number}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{number.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>{number.country}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {number.features.map((feature: string) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchaseNumber(number.number)}
                      className="w-full"
                      disabled={purchasingNumber === number.number}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {purchasingNumber === number.number
                        ? "Purchasing..."
                        : "Purchase Number"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How it works</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Choose a Number</h4>
              <p className="text-sm text-muted-foreground">
                Select from available local or toll-free numbers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Complete Purchase</h4>
              <p className="text-sm text-muted-foreground">
                Secure payment processing through our platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Start Messaging</h4>
              <p className="text-sm text-muted-foreground">
                Use your new number immediately for SMS messages
              </p>
            </div>
          </div>
        </div>

        {/* Advertisement Section */}
        <div className="text-center py-8 bg-muted/20">
          <div className="text-center mb-4">
            <span className="text-xs text-muted-foreground">Advertisement</span>
          </div>
          <div className="flex justify-center">
            <AdBanner width={728} height={90} />
          </div>
        </div>
      </div>
    </div>
  );
}
