const mongoose = require("mongoose");
const Stock = require("../Model/Stock");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

// Helper: Verify JWT token and return user
const verifyToken = async (token) => {
  if (!token) throw new Error("No token provided");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email }).select("_id upstoxAccessToken");
  if (!user) throw new Error("Invalid or expired token");
  return user;
};

// Get all stocks with real-time prices and auto-sync if empty
exports.getStocks = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const userId = user._id;

    if (!Stock || typeof Stock.find !== "function") {
      throw new Error("Stock model is not properly initialized");
    }

    let stocks = await Stock.find({ userId });

    // Auto-sync if no stocks found
    if (stocks.length === 0 && user.upstoxAccessToken) {
      const holdingsConfig = {
        method: "get",
        url: "https://api.upstox.com/v2/portfolio/long-term-holdings",
        headers: { Authorization: `Bearer ${user.upstoxAccessToken}`, Accept: "application/json" },
      };
      const holdingsResponse = await axios(holdingsConfig);
      const holdingsData = holdingsResponse.data.data;

      if (!holdingsData || holdingsData.length === 0) {
        await Stock.deleteMany({ userId });
        return res.json([]);
      }

      await Stock.deleteMany({ userId });

      const newStocks = holdingsData.map((holding) => ({
        userId,
        stockName: holding.company_name,
        symbol: holding.instrument_token,
        tradingSymbol: holding.trading_symbol,
        quantity: holding.quantity,
        purchasePrice: holding.average_price,
        currentPrice: holding.last_price,
        purchaseDate: new Date(),
        priceHistory: [{ date: new Date(), price: holding.last_price }],
      }));

      stocks = await Stock.insertMany(newStocks);
    }

    if (user.upstoxAccessToken && stocks.length > 0) {
      const instrumentKeys = stocks.map((s) => s.symbol).join(",");
      const config = {
        method: "get",
        url: `https://api.upstox.com/v2/market-quote/ohlc?instrument_key=${instrumentKeys}&interval=1day`,
        headers: { Authorization: `Bearer ${user.upstoxAccessToken}`, Accept: "application/json" },
      };
      const response = await axios(config);
      const quoteData = response.data.data;

      for (let stock of stocks) {
        if (quoteData[stock.symbol]?.last_price) {
          stock.currentPrice = quoteData[stock.symbol].last_price;
          stock.priceHistory.push({ date: new Date(), price: stock.currentPrice });
          if (stock.priceHistory.length > 100) stock.priceHistory.shift();
          await stock.save();
        }
      }
    }
    res.json(stocks);
  } catch (error) {
    console.error("Error in getStocks:", error.message, error.stack);
    res.status(400).json({ message: error.message });
  }
};

// Sync portfolio with Upstox holdings (delete existing, insert new)
exports.syncPortfolio = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const userId = user._id;

    if (!user.upstoxAccessToken) throw new Error("Please re-authenticate with Upstox");

    const holdingsConfig = {
      method: "get",
      url: "https://api.upstox.com/v2/portfolio/long-term-holdings",
      headers: { Authorization: `Bearer ${user.upstoxAccessToken}`, Accept: "application/json" },
    };
    const holdingsResponse = await axios(holdingsConfig);
    const holdingsData = holdingsResponse.data.data;

    if (!holdingsData || holdingsData.length === 0) {
      await Stock.deleteMany({ userId });
      return res.json({ message: "No holdings found in Upstox account", stocks: [] });
    }

    await Stock.deleteMany({ userId });

    const newStocks = holdingsData.map((holding) => ({
      userId,
      stockName: holding.company_name,
      symbol: holding.instrument_token,
      tradingSymbol: holding.trading_symbol,
      quantity: holding.quantity,
      purchasePrice: holding.average_price,
      currentPrice: holding.last_price,
      purchaseDate: new Date(),
      priceHistory: [{ date: new Date(), price: holding.last_price }],
    }));

    const insertedStocks = await Stock.insertMany(newStocks);
    res.json({ message: "Portfolio synced successfully", stocks: insertedStocks });
  } catch (error) {
    console.error("Error in syncPortfolio:", error.message, error.stack);
    res.status(400).json({ message: error.message });
  }
};

// Get portfolio history (15 days daily and 12 months monthly)
exports.getPortfolioHistory = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const userId = user._id;
    const stocks = await Stock.find({ userId });

    if (!user.upstoxAccessToken || stocks.length === 0) {
      return res.json({ daily: [], monthly: [] });
    }

    const today = new Date();
    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 15);
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    const formatDate = (date) => date.toISOString().split("T")[0];

    // Fetch 15-day daily history
    const dailyHistoryMap = new Map();
    for (const stock of stocks) {
      const config = {
        method: "get",
        url: `https://api.upstox.com/v2/historical-candle/${stock.symbol}/day/${formatDate(today)}/${formatDate(fifteenDaysAgo)}`,
        headers: { Authorization: `Bearer ${user.upstoxAccessToken}`, Accept: "application/json" },
      };
      const response = await axios(config);
      const candles = response.data.data.candles || [];

      candles.forEach(([timestamp, open, high, low, close, volume]) => {
        const dateKey = new Date(timestamp).toISOString().split("T")[0];
        const existing = dailyHistoryMap.get(dateKey) || { date: dateKey, totalValue: 0 };
        existing.totalValue += close * stock.quantity;
        dailyHistoryMap.set(dateKey, existing);
      });
    }

    const dailyHistory = Array.from(dailyHistoryMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => ({ date: entry.date, value: entry.totalValue }));

    // Fetch 12-month monthly history
    const monthlyHistoryMap = new Map();
    for (const stock of stocks) {
      const config = {
        method: "get",
        url: `https://api.upstox.com/v2/historical-candle/${stock.symbol}/month/${formatDate(today)}/${formatDate(twelveMonthsAgo)}`,
        headers: { Authorization: `Bearer ${user.upstoxAccessToken}`, Accept: "application/json" },
      };
      const response = await axios(config);
      const candles = response.data.data.candles || [];

      candles.forEach(([timestamp, open, high, low, close, volume]) => {
        const date = new Date(timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthlyHistoryMap.get(monthKey) || { date: monthKey, totalValue: 0 };
        existing.totalValue += close * stock.quantity;
        monthlyHistoryMap.set(monthKey, existing);
      });
    }

    const monthlyHistory = Array.from(monthlyHistoryMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({ date: entry.date, value: entry.totalValue }));

    res.json({ daily: dailyHistory, monthly: monthlyHistory });
  } catch (error) {
    console.error("Error in getPortfolioHistory:", error.message, error.stack);
    res.status(400).json({ message: error.message });
  }
};

// Get all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const userId = user._id;
    const stocks = await Stock.find({ userId });
    res.json(stocks);
  } catch (error) {
    console.error("Error in getAllStocks:", error.message, error.stack);
    res.status(400).json({ message: error.message });
  }
};

module.exports = exports;