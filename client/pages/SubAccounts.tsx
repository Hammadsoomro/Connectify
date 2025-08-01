import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Phone,
  DollarSign,
  Home,
  Loader2,
  Users,
  Wallet,
  Settings,
  Check,
  X,
  UserPlus,
  UserMinus,
  PhoneCall,
  Send,
} from "lucide-react";
import ApiService from "@/services/api";
import AnimatedBackground from "@/components/AnimatedBackground";

// Types
interface SubAccount {
  _id: string;
  name: string;
  email: string;
  role: string;
  adminId: string;
  assignedNumbers: string[];
  isActive: boolean;
  walletBalance: number;
  createdAt: string;
  lastLogin?: string;
}

interface PhoneNumber {
  id: string;
  number: string;
  isActive: boolean;
  location: string;
  type: string;
  status: string;
  isAssigned?: boolean;
}

export default function SubAccounts() {
  const navigate = useNavigate();

  // Core State
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form States
  const [newAccountData, setNewAccountData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editingAccount, setEditingAccount] = useState<SubAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SubAccount | null>(null);
  const [transferData, setTransferData] = useState({
    accountId: "",
    amount: "",
  });

  // Phone Assignment State
  const [assignedNumbers, setAssignedNumbers] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [subAccountsData, phoneNumbersData, walletData] = await Promise.all([
        ApiService.getSubAccounts(),
        ApiService.getPhoneNumbers(),
        ApiService.getWallet(),
      ]);

      setSubAccounts(subAccountsData || []);
      setPhoneNumbers(phoneNumbersData || []);
      setWalletBalance(walletData.balance || 0);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load sub-accounts data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSubAccount = async () => {
    if (!newAccountData.name.trim() || !newAccountData.email.trim() || !newAccountData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await ApiService.createSubAccount(
        newAccountData.name.trim(),
        newAccountData.email.trim(),
        newAccountData.password.trim()
      );

      setNewAccountData({ name: "", email: "", password: "" });
      setShowCreateModal(false);
      await loadInitialData();

      toast({
        title: "Sub-Account Created",
        description: `${newAccountData.name} has been created successfully`,
      });
    } catch (error: any) {
      console.error("Error creating sub-account:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create sub-account",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteSubAccount = async () => {
    if (!deletingAccount) return;

    try {
      setIsDeleting(true);
      await ApiService.deactivateSubAccount(deletingAccount._id);

      setShowDeleteDialog(false);
      setDeletingAccount(null);
      await loadInitialData();

      toast({
        title: "Sub-Account Deleted",
        description: `${deletingAccount.name} has been deleted successfully`,
      });
    } catch (error: any) {
      console.error("Error deleting sub-account:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete sub-account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const transferFunds = async () => {
    if (!transferData.accountId || !transferData.amount) {
      toast({
        title: "Validation Error",
        description: "Please select account and enter amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > walletBalance) {
      toast({
        title: "Insufficient Funds",
        description: "Transfer amount exceeds your wallet balance",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTransferring(true);
      
      // API call to transfer funds to sub-account
      const response = await fetch('/api/wallet/transfer-to-subaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          subAccountId: transferData.accountId,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Transfer failed');
      }

      setTransferData({ accountId: "", amount: "" });
      setShowTransferModal(false);
      await loadInitialData();

      const targetAccount = subAccounts.find(acc => acc._id === transferData.accountId);
      toast({
        title: "Transfer Successful",
        description: `$${amount.toFixed(2)} transferred to ${targetAccount?.name}`,
      });
    } catch (error: any) {
      console.error("Error transferring funds:", error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer funds",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const updatePhoneAssignments = async () => {
    if (!editingAccount) return;

    try {
      setIsUpdating(true);

      // Get currently assigned numbers for this account
      const currentlyAssigned = editingAccount.assignedNumbers || [];
      
      // Find numbers to assign and unassign
      const toAssign = assignedNumbers.filter(num => !currentlyAssigned.includes(num));
      const toUnassign = currentlyAssigned.filter(num => !assignedNumbers.includes(num));

      // Assign new numbers
      for (const number of toAssign) {
        await ApiService.assignNumberToSubAccount(editingAccount._id, number);
      }

      // Unassign removed numbers
      for (const number of toUnassign) {
        await ApiService.removeNumberAssignment(editingAccount._id, number);
      }

      setShowEditModal(false);
      setEditingAccount(null);
      setAssignedNumbers([]);
      await loadInitialData();

      toast({
        title: "Assignments Updated",
        description: "Phone number assignments have been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating assignments:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update phone assignments",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (account: SubAccount) => {
    setEditingAccount(account);
    setAssignedNumbers(account.assignedNumbers || []);
    setShowEditModal(true);
  };

  const toggleNumberAssignment = (number: string) => {
    setAssignedNumbers(prev => 
      prev.includes(number) 
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Loading Sub-Accounts</h3>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 flex-1 bg-background/80 backdrop-blur-xl">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Sub-Account Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage sub-accounts, assign phone numbers, and transfer funds
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Balance:</span>
                  <span className="font-bold text-green-600">
                    ${walletBalance.toFixed(2)}
                  </span>
                </div>
              </Card>

              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Sub-Account
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Sub-Accounts Grid */}
        <div className="p-6">
          {subAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Sub-Accounts</h3>
              <p className="text-muted-foreground mb-6">
                Create your first sub-account to get started
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create Sub-Account
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subAccounts.map((account) => (
                <Card key={account._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {account.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {account.email}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(account)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Assignments
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setTransferData({ ...transferData, accountId: account._id });
                              setShowTransferModal(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Transfer Funds
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setDeletingAccount(account);
                              setShowDeleteDialog(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={account.isActive ? "default" : "destructive"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Wallet Balance */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Wallet:</span>
                      <span className="font-semibold text-green-600">
                        ${account.walletBalance?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    {/* Assigned Numbers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Phone Numbers:</span>
                        <Badge variant="outline" className="text-xs">
                          {account.assignedNumbers?.length || 0}
                        </Badge>
                      </div>
                      
                      {account.assignedNumbers && account.assignedNumbers.length > 0 ? (
                        <div className="space-y-1">
                          {account.assignedNumbers.slice(0, 2).map((number) => (
                            <div
                              key={number}
                              className="flex items-center gap-2 text-xs p-2 bg-muted rounded"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span className="font-mono">{number}</span>
                            </div>
                          ))}
                          {account.assignedNumbers.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{account.assignedNumbers.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          No numbers assigned
                        </div>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created:</span>
                      <span>{formatDate(account.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Sub-Account Modal */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sub-Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newAccountData.name}
                onChange={(e) =>
                  setNewAccountData({ ...newAccountData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newAccountData.email}
                onChange={(e) =>
                  setNewAccountData({ ...newAccountData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newAccountData.password}
                onChange={(e) =>
                  setNewAccountData({ ...newAccountData, password: e.target.value })
                }
                placeholder="Enter password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createSubAccount} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>

        {/* Edit Assignments Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Phone Number Assignments</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {editingAccount?.name} - {editingAccount?.email}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Assign Phone Numbers:</Label>
              <ScrollArea className="h-64 border rounded-md">
                <div className="p-4 space-y-2">
                  {phoneNumbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{phone.number}</span>
                        <Badge variant="outline" className="text-xs">
                          {phone.location}
                        </Badge>
                      </div>
                      <Switch
                        checked={assignedNumbers.includes(phone.number)}
                        onCheckedChange={() => toggleNumberAssignment(phone.number)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground">
                Selected: {assignedNumbers.length} numbers
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={updatePhoneAssignments} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Update Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Funds Modal */}
        <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds to Sub-Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Sub-Account:</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={transferData.accountId}
                  onChange={(e) =>
                    setTransferData({ ...transferData, accountId: e.target.value })
                  }
                >
                  <option value="">Select an account...</option>
                  {subAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Transfer Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={walletBalance}
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({ ...transferData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available balance: ${walletBalance.toFixed(2)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
              <Button onClick={transferFunds} disabled={isTransferring}>
                {isTransferring ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Transfer Funds
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sub-Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deletingAccount?.name}</strong>? This action cannot be
                undone. All assigned phone numbers will be unassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteSubAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
