// models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockName: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  sold: { type: Boolean, default: false },
  salePrice: { type: Number, default: 0 },
  saleDate: { type: Date },
  capitalGains: { type: Number, default: 0 },
  shortTermCapitalGains: { type: Number, default: 0 },
  longTermCapitalGains: { type: Number, default: 0 },
  priceHistory: [{
    date: { type: Date, required: true },
    price: { type: Number, required: true }
  }]
});

module.exports = mongoose.model('Stock', stockSchema);