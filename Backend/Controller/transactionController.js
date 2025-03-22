const Transaction = require("../model/Transaction");
const User = require("../model/User");
const jwt = require("jsonwebtoken");

// Create a new transaction (Buy/Sell)
exports.createTransaction = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select("_id");

    if (!user) return res.status(401).json({ message: "No user found" });

    const { stock, type, quantity, transactionDate, transactionAmount } = req.body;

    const newTransaction = new Transaction({
      userId: user._id,
      stock,
      type,
      quantity,
      transactionDate,
      transactionAmount,
    });

    await newTransaction.save();
    res.status(201).json({ message: "Transaction recorded successfully", transaction: newTransaction });

  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error: error.message });
  }
};

// Get all transactions for logged-in user
exports.getUserTransactions = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select("_id");

    if (!user) return res.status(401).json({ message: "No user found" });

    const transactions = await Transaction.find({ userId: user._id });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select("_id");

    if (!user) return res.status(401).json({ message: "No user found" });

    const { transactionId } = req.params;
    const { stock, type, quantity, transactionDate, transactionAmount } = req.body;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId: user._id },
      { stock, type, quantity, transactionDate, transactionAmount },
      { new: true }
    );

    if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found" });

    res.status(200).json({ message: "Transaction updated successfully", transaction: updatedTransaction });
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select("_id");

    if (!user) return res.status(401).json({ message: "No user found" });

    const { transactionId } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId: user._id });

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error: error.message });
  }
};
