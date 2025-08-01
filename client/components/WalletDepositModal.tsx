import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  DollarSign,
  Plus,
  Wallet,
  Zap,
  Shield,
  CheckCircle,
  Star,
  Gift,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ApiService from "@/services/api";

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const depositAmounts = [
  { amount: 10, bonus: 0, popular: false },
  { amount: 25, bonus: 2, popular: false },
  { amount: 50, bonus: 5, popular: true },
  { amount: 100, bonus: 15, popular: false },
  { amount: 250, bonus: 50, popular: false },
  { amount: 500, bonus: 125, popular: false },
];

export default function WalletDepositModal({
  isOpen,
  onClose,
  currentBalance,
  onBalanceUpdate,
}: WalletDepositModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleDeposit = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is $5.00",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for now - replace with real payment integration
      await ApiService.addFunds(amount);
      
      const newBalance = currentBalance + amount;
      onBalanceUpdate(newBalance);
      
      toast({
        title: "Deposit Successful!",
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTotal = () => {
    const amount = selectedAmount || parseFloat(customAmount) || 0;
    const bonus = selectedAmount 
      ? depositAmounts.find(d => d.amount === selectedAmount)?.bonus || 0
      : 0;
    return amount + bonus;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            Add Funds to Wallet
          </DialogTitle>
          <DialogDescription>
            Add funds to your wallet to start sending SMS messages. Your current balance is <strong>${currentBalance.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${currentBalance.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">SMS Cost</p>
                  <p className="text-lg font-semibold">$0.01 per message</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Amount Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Choose Amount</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {depositAmounts.map((option) => (
                <Card
                  key={option.amount}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedAmount === option.amount
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "hover:shadow-lg"
                  } ${option.popular ? "ring-2 ring-green-500" : ""}`}
                  onClick={() => {
                    setSelectedAmount(option.amount);
                    setCustomAmount("");
                  }}
                >
                  <CardContent className="p-4 text-center relative">
                    {option.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    <div className="text-2xl font-bold mb-1">${option.amount}</div>
                    {option.bonus > 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        <Gift className="w-3 h-3 inline mr-1" />
                        +${option.bonus} bonus
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      ≈ {Math.floor((option.amount + option.bonus) / 0.01)} SMS
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="custom-amount" className="text-base font-semibold">
              Or Enter Custom Amount
            </Label>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount (min $5)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="pl-10"
                min="5"
                step="0.01"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-base font-semibold mb-4 block">Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  paymentMethod === "card" ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Credit Card</div>
                  <div className="text-xs text-muted-foreground">Instant</div>
                </CardContent>
              </Card>
              
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  paymentMethod === "paypal" ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                }`}
                onClick={() => setPaymentMethod("paypal")}
              >
                <CardContent className="p-4 text-center">
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium">PayPal</div>
                  <div className="text-xs text-muted-foreground">Instant</div>
                </CardContent>
              </Card>
              
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  paymentMethod === "crypto" ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                }`}
                onClick={() => setPaymentMethod("crypto")}
              >
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="font-medium">Crypto</div>
                  <div className="text-xs text-muted-foreground">5-10 min</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Summary */}
          {(selectedAmount || customAmount) && (
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Transaction Summary</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">${(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}</span>
                  </div>
                  {selectedAmount && depositAmounts.find(d => d.amount === selectedAmount)?.bonus && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Bonus:</span>
                      <span className="font-medium">+${depositAmounts.find(d => d.amount === selectedAmount)?.bonus.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total Credit:</span>
                    <span className="text-green-600 dark:text-green-400">${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ {Math.floor(getTotal() / 0.01).toLocaleString()} SMS messages
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-blue-700 dark:text-blue-300">Secure Payment</div>
              <div className="text-blue-600 dark:text-blue-400">
                Your payment information is encrypted and secure. We never store your card details.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isLoading || (!selectedAmount && !customAmount)}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add ${getTotal().toFixed(2)}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
