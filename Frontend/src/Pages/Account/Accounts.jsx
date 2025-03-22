import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../Components/ui/select";
import { Checkbox } from "../../Components/ui/checkbox";
import { ChevronRight, Plus, Trash, Star } from "lucide-react";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("savings");
  const [accountIsDefault, setAccountIsDefault] = useState(false);
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/account/get", {
        headers: { "x-access-token": token },
      });
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/account/delete/${accountToDelete}`, {
        headers: { "x-access-token": token },
      });
      fetchAccounts();
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  const handleDeleteClick = (accountId) => {
    setAccountToDelete(accountId);
    setDeleteDialogOpen(true);
  };

  const handleSetDefault = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/account/set-default/${accountId}`, {}, {
        headers: { "x-access-token": token },
      });
      fetchAccounts();
    } catch (error) {
      console.error("Error setting default account:", error);
    }
  };

  const handleAddAccount = async () => {
    setError("");
    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }
    if (!balance || isNaN(balance) || Number(balance) < 0) {
      setError("Balance must be a valid non-negative number.");
      return;
    }
    if (!["savings", "current"].includes(accountType)) {
      setError("Invalid account type selected.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/account/add",
        { 
          accountName, 
          accountType, 
          isDefault: accountIsDefault, 
          balance: Number(balance) 
        },
        { headers: { "x-access-token": token } }
      );
      fetchAccounts();
      setOpen(false);
      setAccountName("");
      setBalance("");
      setAccountType("savings");
      setAccountIsDefault(false);
    } catch (error) {
      console.error("Error adding account:", error);
      setError("Failed to add account. Please try again.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-light tracking-tight text-black">My Accounts</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-white rounded-lg py-2 px-4 transition-all shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light text-black">Add New Account</DialogTitle>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-sm font-medium text-gray-700">
                  Account Name
                </Label>
                <Input
                  id="accountName"
                  placeholder="e.g. Personal Savings"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-sm font-medium text-gray-700">
                  Account Type
                </Label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger id="accountType" className="border border-gray-300 bg-white focus:ring-2 focus:ring-black rounded-lg">
                    <SelectValue placeholder="Select Account Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-lg">
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-sm font-medium text-gray-700">
                  Initial Balance
                </Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isDefault" 
                  checked={accountIsDefault} 
                  onCheckedChange={setAccountIsDefault}
                  className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
                />
                <Label 
                  htmlFor="isDefault" 
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Set as default account
                </Label>
              </div>

              <Button 
                onClick={handleAddAccount}
                className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-2 transition-all shadow-md"
              >
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <div className="mt-8 text-center p-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-500">No accounts found</p>
          <Button 
            onClick={() => setOpen(true)}
            className="mt-4 bg-black hover:bg-gray-800 text-white rounded-lg py-2 px-4 transition-all shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Your First Account
          </Button>
        </div>
      ) : (
        <div className="mt-8">
          <ul className="space-y-4">
            {accounts.map((account) => (
              <li 
                key={account._id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all group shadow-sm"
              >
                <div className="mb-3 sm:mb-0 flex items-start">
                  <div 
                    className={`w-2 h-12 mr-4 rounded-full ${
                      account.accountType === "savings" 
                        ? "bg-blue-500" 
                        : "bg-purple-500"
                    }`}
                  />
                  <div>
                    <div className="flex items-center">
                      <span
                        onClick={() => navigate(`/accounts/${account._id}`)}
                        className="text-black text-lg font-medium cursor-pointer hover:underline mr-2"
                      >
                        {account.accountName}
                      </span>
                      {account.isDefault && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                      <span className="capitalize">{account.accountType}</span>
                      <span className="h-1 w-1 bg-gray-300 rounded-full" />
                      <span className="font-medium">₹{account.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => navigate(`/accounts/${account._id}`)}
                    className="bg-white hover:bg-gray-100 text-black border border-gray-300 rounded-lg text-sm px-3 py-1 h-9 shadow-sm"
                  >
                    Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  {!account.isDefault && (
                    <Button 
                      onClick={() => handleSetDefault(account._id)}
                      className="bg-white hover:bg-gray-100 text-black border border-gray-300 rounded-lg text-sm px-3 py-1 h-9 shadow-sm"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleDeleteClick(account._id)}
                    className="bg-white hover:bg-red-50 text-red-600 border border-gray-300 rounded-lg text-sm px-3 py-1 h-9 shadow-sm"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-black">Confirm Delete</DialogTitle>
            <DialogDescription className="mt-2 text-gray-600">
              Are you sure you want to delete this account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button
              onClick={handleDeleteCancel}
              className="bg-gray-100 hover:bg-gray-200 text-black rounded-lg py-2 px-4 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 transition-all"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;