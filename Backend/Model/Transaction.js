const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  type: { type: String, enum: ['Buy', 'Sell'], required: true },
  quantity: { type: Number, required: true },
  transactionDate: { type: Date, required: true },
  transactionAmount: { type: Number, required: true },
  upstoxOrderId: { type: String } // Store Upstox order ID
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
