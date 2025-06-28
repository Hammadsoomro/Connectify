import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const availableNumbers = [
  {
    id: "tw_1",
    number: "+1 (212) 555-0147",
    location: "New York, NY",
    country: "United States",
    type: "Local",
    price: "$1.00/month",
    features: ["SMS", "MMS"],
    provider: "Twilio",
  },
  {
    id: "tw_2",
    number: "+1 (323) 555-0289",
    location: "Los Angeles, CA",
    country: "United States",
    type: "Local",
    price: "$1.00/month",
    features: ["SMS", "MMS"],
    provider: "Twilio",
  },
  {
    id: "tw_3",
    number: "+1 (312) 555-0356",
    location: "Chicago, IL",
    country: "United States",
    type: "Local",
    price: "$1.00/month",
    features: ["SMS", "MMS"],
    provider: "Twilio",
  },
  {
    id: "tw_4",
    number: "+1 (844) 555-0789",
    location: "United States",
    country: "United States",
    type: "Toll-Free",
    price: "$2.00/month",
    features: ["SMS", "MMS"],
    provider: "Twilio",
  },
  {
    id: "tw_5",
    number: "+1 (833) 555-0456",
    location: "United States",
    country: "United States",
    type: "Toll-Free",
    price: "$2.00/month",
    features: ["SMS", "MMS"],
    provider: "Twilio",
  },
  {
    id: "tw_6",
    number: "+1 (415) 555-0123",
    location: "San Francisco, CA",
    country: "United States",
    type: "Local",
    price: "$1.00/month",
    features: ["SMS", "MMS"],
    provider: "Twilio",
  },
];

export default function BuyNumbers() {
  const handlePurchaseNumber = (numberId: string) => {
    // TODO: Implement number purchase logic
    console.log("Purchase number:", numberId);
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
          <p className="text-muted-foreground">
            Choose from our available Twilio phone numbers to start sending and
            receiving SMS messages. All numbers are powered by Twilio's reliable
            infrastructure.
          </p>
        </div>

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
                    {number.features.map((feature) => (
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
                  onClick={() => handlePurchaseNumber(number.id)}
                  className="w-full"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Purchase Number
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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
                Use your new number immediately for SMS and calls
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
