import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { WalletInfo, WalletStats, WalletTransaction } from "@shared/api";
import ApiService from "@/services/api";

interface BillingSummary {
  phoneNumbers: Array<{
    number: string;
    type: string;
    status: string;
    monthlyRate: number;
  }>;
  totalMonthlyCharges: number;
  currentBalance: number;
  canCoverNextMonth: boolean;
  daysUntilNextBilling: number;
}

interface WalletComponentProps {
  trigger?: React.ReactNode;
}

export default function WalletComponent({ trigger }: WalletComponentProps) {
  const [open, setOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Add funds dialog
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [addingFunds, setAddingFunds] = useState(false);

  useEffect(() => {
    if (open) {
      loadWalletData();
    }
  }, [open]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [wallet, stats, billing] = await Promise.all([
        ApiService.getWallet(),
        ApiService.getWalletStats(),
        ApiService.getBillingSummary(),
      ]);
      setWalletInfo(wallet);
      setWalletStats(stats);
      setBillingSummary(billing);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async () => {
    try {
      setAddingFunds(true);
      const amount = parseFloat(addAmount);

      if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      if (amount > 10000) {
        alert("Maximum amount per transaction is $10,000");
        return;
      }

      await ApiService.addFunds(amount, paymentMethod);
      setAddAmount("");
      setShowAddFunds(false);
      await loadWalletData();
    } catch (error: any) {
      alert(error.message || "Failed to add funds");
    } finally {
      setAddingFunds(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTransactionType = (type: string) => {
    return type === "credit" ? "Added" : "Spent";
  };

  const getTransactionIcon = (type: string) => {
    return type === "credit" ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Management
          </DialogTitle>
          <DialogDescription>
            Manage your wallet balance and view transaction history
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading wallet...</div>
          </div>
        )}

        {walletInfo && walletStats && (
          <div className="space-y-6">
            {/* Balance and Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(walletInfo.balance)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={walletInfo.isActive ? "default" : "secondary"}
                    >
                      {walletInfo.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => setShowAddFunds(true)}
                      className="ml-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Funds
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(walletStats.totalSpent)}
                  </div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(walletStats.monthlySpending)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {walletInfo.monthlyLimit
                      ? `Limit: ${formatCurrency(walletInfo.monthlyLimit)}`
                      : "No limit set"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {walletInfo.transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {walletInfo.transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <div className="font-medium">
                                {transaction.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(
                                  transaction.createdAt,
                                ).toLocaleString()}
                              </div>
                              {transaction.reference && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {transaction.reference}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-medium ${
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTransactionType(transaction.type)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>

        {/* Add Funds Dialog */}
        <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Add Funds to Wallet
              </DialogTitle>
              <DialogDescription>
                Add money to your wallet to purchase phone numbers and send SMS
                messages
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="0.01"
                  max="10000"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: $0.01, Maximum: $10,000 per transaction
                </p>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="card">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: This is a demo. In production, integrate with a real
                  payment processor.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddFunds(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddFunds}
                disabled={addingFunds || !addAmount}
              >
                {addingFunds ? "Adding..." : "Add Funds"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
