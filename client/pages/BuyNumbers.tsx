import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, MapPin, Globe, Search } from "lucide-react";
import { Link } from "react-router-dom";
import ApiService from "@/services/api";

export default function BuyNumbers() {
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areaCode, setAreaCode] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [purchasingNumber, setPurchasingNumber] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableNumbers();
  }, []);

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
    if (!areaCode.trim()) {
      loadAvailableNumbers();
      return;
    }

    try {
      setSearchLoading(true);
      const numbers = await ApiService.getAvailableNumbers(areaCode);
      setAvailableNumbers(numbers);
    } catch (error) {
      console.error("Error searching numbers:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePurchaseNumber = async (phoneNumber: string) => {
    try {
      setPurchasingNumber(phoneNumber);
      await ApiService.purchaseNumber(phoneNumber);

      // Remove purchased number from available list
      setAvailableNumbers((prev) =>
        prev.filter((num) => num.number !== phoneNumber),
      );

      // Show success message or redirect
      alert("Number purchased successfully! You can now use it to send messages.");
    } catch (error: any) {
      console.error("Error purchasing number:", error);
      alert(error.message || "Failed to purchase number. Please try again.");
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
            receiving SMS messages. All numbers are powered by Twilio's reliable infrastructure.
          </p>

          {/* Search by Area Code */}
          <div className="flex gap-4 max-w-md">
            <div className="flex-1">
              <Label htmlFor="areaCode">Search by Area Code (Optional)</Label>
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
            {availableNumbers.map((number) => (
              <Card key={number.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          number.type === "Toll-Free" ? "default" : "secondary"
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
            ))}

            {availableNumbers.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  {areaCode ? "No numbers found for this area code" : "No numbers available"}
                </p>
              </div>
            )}
          </div>
        )}
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
                Use your new number immediately for SMS and calls
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}