import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Phone,
  UserPlus,
  Settings,
  PhoneCall,
  Trash2,
  Eye,
  EyeOff,
  Wallet,
} from "lucide-react";
import ApiService from "@/services/api";
import WalletComponent from "./WalletComponent";

interface AdminDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SubAccount {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  assignedNumbers: string[];
}

interface DashboardStats {
  subAccounts: {
    total: number;
    active: number;
    limit: number;
    remaining: number;
  };
  phoneNumbers: number;
}

export default function AdminDashboard({
  open,
  onOpenChange,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create sub-account form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubAccount, setNewSubAccount] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Number assignment
  const [selectedSubAccount, setSelectedSubAccount] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");

  useEffect(() => {
    if (open) {
      loadDashboardData();
    }
  }, [open]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [subAccountsData, phoneNumbersData, statsData] = await Promise.all([
        ApiService.getSubAccounts(),
        ApiService.getPhoneNumbers(),
        ApiService.getDashboardStats(),
      ]);

      setSubAccounts(subAccountsData);
      setPhoneNumbers(phoneNumbersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubAccount = async () => {
    try {
      setCreateLoading(true);
      const newAccount = await ApiService.createSubAccount(
        newSubAccount.name,
        newSubAccount.email,
        newSubAccount.password,
      );

      setSubAccounts((prev) => [newAccount, ...prev]);
      setNewSubAccount({ name: "", email: "", password: "" });
      setShowCreateForm(false);
      await loadDashboardData(); // Refresh stats
    } catch (error: any) {
      alert(error.message || "Failed to create sub-account");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignNumber = async () => {
    if (!selectedSubAccount || !selectedNumber) return;

    try {
      await ApiService.assignNumberToSubAccount(
        selectedSubAccount,
        selectedNumber,
      );
      await loadDashboardData(); // Refresh data
      setSelectedSubAccount("");
      setSelectedNumber("");
    } catch (error: any) {
      alert(error.message || "Failed to assign number");
    }
  };

  const handleRemoveAssignment = async (
    subAccountId: string,
    phoneNumber: string,
  ) => {
    try {
      await ApiService.removeNumberAssignment(subAccountId, phoneNumber);
      await loadDashboardData(); // Refresh data
    } catch (error: any) {
      alert(error.message || "Failed to remove assignment");
    }
  };

  const handleDeactivateSubAccount = async (subAccountId: string) => {
    if (!confirm("Are you sure you want to deactivate this sub-account?"))
      return;

    try {
      await ApiService.deactivateSubAccount(subAccountId);
      await loadDashboardData(); // Refresh data
    } catch (error: any) {
      alert(error.message || "Failed to deactivate sub-account");
    }
  };

  const getAvailableNumbers = () => {
    return phoneNumbers.filter((num) => {
      // Check if number is already assigned to any sub-account
      return !subAccounts.some((sub) =>
        sub.assignedNumbers?.includes(num.number),
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Dashboard
          </DialogTitle>
          <DialogDescription>
            Manage your sub-accounts and phone number assignments
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === "overview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "wallet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("wallet")}
          >
            <Wallet className="w-4 h-4 mr-1" />
            Wallet
          </Button>
          <Button
            variant={activeTab === "subaccounts" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("subaccounts")}
          >
            Sub-Accounts
          </Button>
          <Button
            variant={activeTab === "numbers" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("numbers")}
          >
            Phone Numbers
          </Button>
        </div>

        <div className="py-4">
          {activeTab === "overview" && stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Sub-Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.subAccounts.active}/{stats.subAccounts.limit}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.subAccounts.remaining} remaining
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Numbers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.phoneNumbers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Purchased numbers
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-4">
              <WalletComponent />
            </div>
          )}

          {activeTab === "subaccounts" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sub-Accounts</h3>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  size="sm"
                  disabled={stats?.subAccounts.remaining === 0}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Sub-Account
                </Button>
              </div>

              {showCreateForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Create New Sub-Account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subName">Full Name</Label>
                        <Input
                          id="subName"
                          value={newSubAccount.name}
                          onChange={(e) =>
                            setNewSubAccount((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subEmail">Email</Label>
                        <Input
                          id="subEmail"
                          type="email"
                          value={newSubAccount.email}
                          onChange={(e) =>
                            setNewSubAccount((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Enter email"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="subPassword">Password</Label>
                      <Input
                        id="subPassword"
                        type={showPassword ? "text" : "password"}
                        value={newSubAccount.password}
                        onChange={(e) =>
                          setNewSubAccount((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Enter password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-6 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateSubAccount}
                        disabled={
                          !newSubAccount.name ||
                          !newSubAccount.email ||
                          !newSubAccount.password ||
                          createLoading
                        }
                      >
                        {createLoading ? "Creating..." : "Create"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {subAccounts.map((account) => (
                  <Card key={account._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{account.name}</h4>
                            <Badge
                              variant={
                                account.isActive ? "default" : "secondary"
                              }
                            >
                              {account.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {account.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {account.assignedNumbers?.length || 0} numbers
                            assigned
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {account.assignedNumbers?.map((number) => (
                            <Button
                              key={number}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveAssignment(account._id, number)
                              }
                              className="text-xs"
                            >
                              {number}
                              <Trash2 className="w-3 h-3 ml-1" />
                            </Button>
                          ))}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeactivateSubAccount(account._id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "numbers" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Phone Number Management</h3>

              {/* Assign Number */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assign Number</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Select Sub-Account</Label>
                      <Select
                        value={selectedSubAccount}
                        onValueChange={setSelectedSubAccount}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose sub-account" />
                        </SelectTrigger>
                        <SelectContent>
                          {subAccounts
                            .filter((acc) => acc.isActive)
                            .map((account) => (
                              <SelectItem key={account._id} value={account._id}>
                                {account.name} ({account.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Select Phone Number</Label>
                      <Select
                        value={selectedNumber}
                        onValueChange={setSelectedNumber}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose number" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableNumbers().map((number) => (
                            <SelectItem key={number.id} value={number.id}>
                              {number.number} ({number.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAssignNumber}
                    disabled={!selectedSubAccount || !selectedNumber}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Assign Number
                  </Button>
                </CardContent>
              </Card>

              {/* Phone Numbers List */}
              <div className="space-y-2">
                {phoneNumbers.map((number) => {
                  const assignedTo = subAccounts.find((sub) =>
                    sub.assignedNumbers?.includes(number.number),
                  );

                  return (
                    <Card key={number.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium font-mono">
                              {number.number}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {number.location} • {number.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignedTo ? (
                              <Badge variant="default">
                                Assigned to {assignedTo.name}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Available</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
