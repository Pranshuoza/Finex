const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockName: String,
  symbol: String, // instrument_token
  tradingSymbol: String, // e.g., YESBANK
  quantity: Number,
  purchasePrice: Number,
  currentPrice: Number,
  purchaseDate: Date,
  priceHistory: [{ date: Date, price: Number }],
  sold: { type: Boolean, default: false },
  salePrice: Number,
  saleDate: Date,
  capitalGains: Number,
  shortTermCapitalGains: Number,
  longTermCapitalGains: Number,
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;