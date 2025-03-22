"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, TrendingDown, Trash2, Plus, ArrowUp, ArrowDown, Edit } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have this utility for classnames
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../Components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../Components/ui/dialog";

const Transactions = ({ accountId, onTransactionChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    accountId: accountId || "",
    amount: "",
    type: "",
    categoryName: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    frequency: "once",
  });

  const incomeCategories = [
    "Salary", "Business Income", "Investment Income", "Freelance", "Gifts", "Rental Income", "Other Income",
  ];
  const expenseCategories = [
    "Groceries", "Healthcare", "Utilities", "Food", "Transportation", "Entertainment", "Rent", "Shopping", "Travel", "Miscellaneous",
  ];

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/transaction", {
        headers: { "x-access-token": token },
      });

      const filteredTransactions = Array.isArray(response.data.transactions)
        ? response.data.transactions.filter((t) => t.accountId === accountId)
        : [];
      setTransactions(filteredTransactions);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      await axios.post(
        "http://localhost:3000/transaction/add",
        {
          ...newTransaction,
          amount: parseFloat(newTransaction.amount) || 0,
          accountId: accountId,
        },
        { headers: { "x-access-token": localStorage.getItem("token") } }
      );
      fetchTransactions();
      onTransactionChange();
      setShowAddModal(false);
      resetNewTransaction();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding transaction");
    }
  };

  const handleEditTransaction = async () => {
    try {
      await axios.put(
        `http://localhost:3000/transaction/update/${selectedTransaction._id}`,
        {
          ...selectedTransaction,
          amount: parseFloat(selectedTransaction.amount) || 0,
        },
        { headers: { "x-access-token": localStorage.getItem("token") } }
      );
      fetchTransactions();
      onTransactionChange();
      setShowEditModal(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating transaction");
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/transaction/${selectedTransaction._id}`,
        { headers: { "x-access-token": localStorage.getItem("token") } }
      );
      fetchTransactions();
      onTransactionChange();
      setShowDeleteModal(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting transaction");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedTransactions = [...transactions].sort((a, b) => {
      if (key === "date") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (key === "amount") {
        return direction === "asc"
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      }
      return direction === "asc"
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    });
    setTransactions(sortedTransactions);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 inline ml-1 text-zinc-900 dark:text-zinc-100" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 inline ml-1 text-zinc-900 dark:text-zinc-100" />
    );
  };

  const resetNewTransaction = () => {
    setNewTransaction({
      accountId: accountId || "",
      amount: "",
      type: "",
      categoryName: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      frequency: "once",
    });
  };

  const getCategoryOptions = (type) =>
    type === "income" ? incomeCategories : type === "expense" ? expenseCategories : [];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0F0F12]">
        <div className="animate-pulse text-zinc-600 dark:text-zinc-400 text-lg font-semibold">
          Loading Transactions...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F12] p-6">
      {error && (
        <Alert
          className={cn(
            "bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 shadow-sm",
            "transition-all duration-300"
          )}
        >
          <AlertDescription className="text-red-600 dark:text-red-400 font-semibold">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "bg-white dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800",
          "rounded-xl shadow-sm backdrop-blur-xl overflow-hidden"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "p-6 border-b border-zinc-100 dark:border-zinc-800",
            "flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50"
          )}
        >
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Transactions
          </h2>
          <Button
            onClick={() => setShowAddModal(true)}
            className={cn(
              "flex items-center gap-2",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "rounded-lg py-2 px-4 text-xs font-medium",
              "shadow-sm hover:shadow transition-all duration-200"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </Button>
        </div>

        {/* Table Header */}
        <div
          className={cn(
            "p-4 border-b border-zinc-100 dark:border-zinc-800",
            "bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10"
          )}
        >
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
            <button
              onClick={() => handleSort("categoryName")}
              className="col-span-4 flex items-center justify-start hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Category {getSortIcon("categoryName")}
            </button>
            <button
              onClick={() => handleSort("amount")}
              className="col-span-2 flex items-center justify-end hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Amount {getSortIcon("amount")}
            </button>
            <button
              onClick={() => handleSort("type")}
              className="col-span-2 flex items-center justify-end hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Type {getSortIcon("type")}
            </button>
            <button
              onClick={() => handleSort("date")}
              className="col-span-2 flex items-center justify-end hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200 mr-4"
            >
              Date {getSortIcon("date")}
            </button>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-4">
              No transactions yet for this account.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className={cn(
                "flex items-center gap-2",
                "bg-zinc-900 dark:bg-zinc-50",
                "text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "shadow-sm hover:shadow transition-all duration-200"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className={cn(
                  "p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                  "transition-all duration-200"
                )}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        transaction.type === "income"
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      )}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {transaction.categoryName}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                        {transaction.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      ₹{parseFloat(transaction.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                      {transaction.type}
                    </p>
                  </div>
                  <div className="col-span-2 text-right mr-4">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowEditModal(true);
                      }}
                      className={cn(
                        "flex items-center gap-1",
                        "bg-zinc-100 dark:bg-zinc-800",
                        "text-zinc-900 dark:text-zinc-100",
                        "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                        "rounded-lg py-1 px-2 text-xs font-medium",
                        "transition-all duration-200"
                      )}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowDeleteModal(true);
                      }}
                      className={cn(
                        "flex items-center gap-1",
                        "bg-red-100 dark:bg-red-900/30",
                        "text-red-600 dark:text-red-400",
                        "hover:bg-red-200 dark:hover:bg-red-800/50",
                        "rounded-lg py-1 px-2 text-xs font-medium",
                        "transition-all duration-200"
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className={cn(
            "bg-white dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800",
            "rounded-xl shadow-lg p-6 max-w-lg",
            "transition-all duration-300"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Add New Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label
                htmlFor="amount"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
              >
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: e.target.value })
                }
                className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="type"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
              >
                Type
              </Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, type: value, categoryName: "" })
                }
              >
                <SelectTrigger
                  id="type"
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                >
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                  <SelectItem value="income" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">Income</SelectItem>
                  <SelectItem value="expense" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="categoryName"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
              >
                Category
              </Label>
              <Select
                value={newTransaction.categoryName}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, categoryName: value })
                }
                disabled={!newTransaction.type}
              >
                <SelectTrigger
                  id="categoryName"
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                >
                  <SelectValue placeholder={newTransaction.type ? "Select Category" : "Select Type First"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {getCategoryOptions(newTransaction.type).map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="description"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
              >
                Description
              </Label>
              <Input
                id="description"
                type="text"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
                className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="date"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
              >
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="frequency"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
              >
                Frequency
              </Label>
              <Select
                value={newTransaction.frequency}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, frequency: value })
                }
              >
                <SelectTrigger
                  id="frequency"
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                >
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                  {["once", "daily", "weekly", "monthly", "quarterly", "semiannually", "yearly"].map(
                    (freq) => (
                      <SelectItem
                        key={freq}
                        value={freq}
                        className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 capitalize"
                      >
                        {freq}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setShowAddModal(false)}
              className={cn(
                "bg-zinc-100 dark:bg-zinc-800",
                "text-zinc-900 dark:text-zinc-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "transition-all duration-200"
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              className={cn(
                "bg-zinc-900 dark:bg-zinc-50",
                "text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "shadow-sm hover:shadow transition-all duration-200",
                !newTransaction.type || !newTransaction.categoryName ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={!newTransaction.type || !newTransaction.categoryName}
            >
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent
          className={cn(
            "bg-white dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800",
            "rounded-xl shadow-lg p-6 max-w-lg",
            "transition-all duration-300"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Edit Transaction
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label
                  htmlFor="editAmount"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
                >
                  Amount (₹)
                </Label>
                <Input
                  id="editAmount"
                  type="number"
                  value={selectedTransaction.amount}
                  onChange={(e) =>
                    setSelectedTransaction({ ...selectedTransaction, amount: e.target.value })
                  }
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="editType"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
                >
                  Type
                </Label>
                <Select
                  value={selectedTransaction.type}
                  onValueChange={(value) =>
                    setSelectedTransaction({ ...selectedTransaction, type: value, categoryName: "" })
                  }
                >
                  <SelectTrigger
                    id="editType"
                    className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  >
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                    <SelectItem value="income" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">Income</SelectItem>
                    <SelectItem value="expense" className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="editCategoryName"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
                >
                  Category
                </Label>
                <Select
                  value={selectedTransaction.categoryName}
                  onValueChange={(value) =>
                    setSelectedTransaction({ ...selectedTransaction, categoryName: value })
                  }
                  disabled={!selectedTransaction.type}
                >
                  <SelectTrigger
                    id="editCategoryName"
                    className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  >
                    <SelectValue placeholder={selectedTransaction.type ? "Select Category" : "Select Type First"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {getCategoryOptions(selectedTransaction.type).map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="editDescription"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
                >
                  Description
                </Label>
                <Input
                  id="editDescription"
                  type="text"
                  value={selectedTransaction.description}
                  onChange={(e) =>
                    setSelectedTransaction({ ...selectedTransaction, description: e.target.value })
                  }
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="editDate"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
                >
                  Date
                </Label>
                <Input
                  id="editDate"
                  type="date"
                  value={selectedTransaction.date}
                  onChange={(e) =>
                    setSelectedTransaction({ ...selectedTransaction, date: e.target.value })
                  }
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="editFrequency"
                  className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase"
                >
                  Frequency
                </Label>
                <Select
                  value={selectedTransaction.frequency}
                  onValueChange={(value) =>
                    setSelectedTransaction({ ...selectedTransaction, frequency: value })
                  }
                >
                  <SelectTrigger
                    id="editFrequency"
                    className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  >
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                    {["once", "daily", "weekly", "monthly", "quarterly", "semiannually", "yearly"].map(
                      (freq) => (
                        <SelectItem
                          key={freq}
                          value={freq}
                          className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 capitalize"
                        >
                          {freq}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setShowEditModal(false)}
              className={cn(
                "bg-zinc-100 dark:bg-zinc-800",
                "text-zinc-900 dark:text-zinc-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "transition-all duration-200"
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTransaction}
              className={cn(
                "bg-zinc-900 dark:bg-zinc-50",
                "text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "shadow-sm hover:shadow transition-all duration-200",
                !selectedTransaction?.type || !selectedTransaction?.categoryName ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={!selectedTransaction?.type || !selectedTransaction?.categoryName}
            >
              Update Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent
          className={cn(
            "bg-white dark:bg-zinc-900/70 border border-zinc-100 dark:border-zinc-800",
            "rounded-xl shadow-lg p-6 max-w-md",
            "transition-all duration-300"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            {selectedTransaction && (
              <div
                className={cn(
                  "p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg",
                  "border border-zinc-100 dark:border-zinc-700"
                )}
              >
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Category:</span>{" "}
                  {selectedTransaction.categoryName}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Amount:</span>{" "}
                  ₹{parseFloat(selectedTransaction.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Date:</span>{" "}
                  {new Date(selectedTransaction.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              className={cn(
                "bg-zinc-100 dark:bg-zinc-800",
                "text-zinc-900 dark:text-zinc-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "transition-all duration-200"
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTransaction}
              className={cn(
                "bg-red-600 dark:bg-red-500",
                "text-white",
                "hover:bg-red-700 dark:hover:bg-red-600",
                "rounded-lg py-2 px-4 text-xs font-medium",
                "shadow-sm hover:shadow transition-all duration-200"
              )}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;