const mongoose = require('mongoose');
const Stock = require('../Model/Stock');
const Transaction = require('../Model/Transaction');
const User = require('../Model/User');
const UpstoxClient = require('upstox-js-sdk');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
require('dotenv').config();

// Helper: Verify JWT token and return user
const verifyToken = async (token) => {
  if (!token) throw new Error('No token provided');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email }).select('_id upstoxAccessToken');
  if (!user) throw new Error('Invalid or expired token');
  return user;
};

// Helper: Initialize Upstox client in sandbox mode
const initializeUpstoxClient = (accessToken) => {
  const client = new UpstoxClient.ApiClient(true); // Enable sandbox mode
  client.authentications['OAUTH2'].accessToken = accessToken; // Set access token
  return client;
};

// Authentication: Redirect to Upstox login
exports.upstoxLogin = (req, res) => {
  const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?client_id=${process.env.UPSTOX_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;
  res.redirect(authUrl);
};

// Callback: Handle Upstox OAuth response
exports.upstoxCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;

    const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.UPSTOX_API_KEY}:${process.env_UPSTOX_API_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI
      })
    });
    const { access_token } = await response.json();

    const updatedUser = await User.findByIdAndUpdate(userId, { upstoxAccessToken: access_token }, { new: true });
    if (!updatedUser) throw new Error('User not found');

    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all stocks with real-time prices
exports.getStocks = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);

    const stocks = await Stock.find({ userId });
    const marketApi = new UpstoxClient.MarketQuoteApi(upstoxClient);
    for (let stock of stocks) {
      if (!stock.sold) {
        const quote = await marketApi.getMarketQuoteOHLC({ instrument_key: stock.symbol });
        const latestPrice = quote.data[stock.symbol]?.last_price;
        if (latestPrice && latestPrice !== stock.currentPrice) {
          stock.currentPrice = latestPrice;
          stock.priceHistory.push({ date: new Date(), price: latestPrice });
          if (stock.priceHistory.length > 100) stock.priceHistory.shift();
          await stock.save();
        }
      }
    }
    res.json(stocks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add new stock with transaction (using V3 Order API)
exports.addStock = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);

    const { stockName, symbol, quantity, purchasePrice } = req.body;
    if (!stockName || !symbol || !quantity || !purchasePrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const orderApi = new UpstoxClient.OrderControllerV3Api(upstoxClient);
    const orderBody = new UpstoxClient.PlaceOrderV3Request(
      quantity,
      UpstoxClient.PlaceOrderV3Request.ProductEnum.D, // Delivery
      UpstoxClient.PlaceOrderV3Request.ValidityEnum.DAY,
      purchasePrice,
      symbol,
      UpstoxClient.PlaceOrderV3Request.OrderTypeEnum.LIMIT,
      UpstoxClient.PlaceOrderV3Request.TransactionTypeEnum.BUY,
      0, // disclosed_quantity
      0, // trigger_price
      true // is_amo (after market order)
    );

    const orderResponse = await orderApi.placeOrder(orderBody, { slice: true });

    const marketApi = new UpstoxClient.MarketQuoteApi(upstoxClient);
    const quote = await marketApi.getMarketQuoteOHLC({ instrument_key: symbol });
    const currentPrice = quote.data[symbol]?.last_price;

    const stock = new Stock({
      userId,
      stockName,
      symbol,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate: new Date(),
      priceHistory: [{ date: new Date(), price: currentPrice }]
    });

    const transaction = new Transaction({
      userId,
      stock: stock._id,
      type: 'Buy',
      quantity,
      transactionDate: new Date(),
      transactionAmount: purchasePrice * quantity,
      upstoxOrderId: orderResponse.data.order_id
    });

    await Promise.all([stock.save(), transaction.save()]);
    res.status(201).json({ stock, transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sell stock with transaction (using V3 Order API)
exports.sellStock = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);

    const { stockId, quantity, salePrice } = req.body;
    const stock = await Stock.findOne({ _id: stockId, userId, sold: false });
    if (!stock) return res.status(404).json({ message: 'Stock not found or already sold' });

    if (quantity > stock.quantity) {
      return res.status(400).json({ message: 'Insufficient quantity to sell' });
    }

    const orderApi = new UpstoxClient.OrderControllerV3Api(upstoxClient);
    const orderBody = new UpstoxClient.PlaceOrderV3Request(
      quantity,
      UpstoxClient.PlaceOrderV3Request.ProductEnum.D,
      UpstoxClient.PlaceOrderV3Request.ValidityEnum.DAY,
      salePrice,
      stock.symbol,
      UpstoxClient.PlaceOrderV3Request.OrderTypeEnum.LIMIT,
      UpstoxClient.PlaceOrderV3Request.TransactionTypeEnum.SELL,
      0,
      0,
      true
    );

    const orderResponse = await orderApi.placeOrder(orderBody, { slice: true });

    const transactionAmount = salePrice * quantity;
    const capitalGains = (salePrice - stock.purchasePrice) * quantity;
    const daysHeld = (new Date() - new Date(stock.purchaseDate)) / (1000 * 3600 * 24);

    if (quantity === stock.quantity) {
      stock.sold = true;
      stock.salePrice = salePrice;
      stock.saleDate = new Date();
      stock.capitalGains = capitalGains;
      stock.shortTermCapitalGains = daysHeld <= 365 ? capitalGains : 0;
      stock.longTermCapitalGains = daysHeld > 365 ? capitalGains : 0;
    } else {
      stock.quantity -= quantity;
      const soldStock = new Stock({
        ...stock.toObject(),
        quantity,
        sold: true,
        salePrice,
        saleDate: new Date(),
        capitalGains,
        shortTermCapitalGains: daysHeld <= 365 ? capitalGains : 0,
        longTermCapitalGains: daysHeld > 365 ? capitalGains : 0
      });
      await soldStock.save();
    }

    const transaction = new Transaction({
      userId,
      stock: stock._id,
      type: 'Sell',
      quantity,
      transactionDate: new Date(),
      transactionAmount,
      upstoxOrderId: orderResponse.data.order_id
    });

    await Promise.all([stock.save(), transaction.save()]);
    res.status(200).json({ stock, transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sync portfolio with Upstox holdings
exports.syncPortfolio = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);

    const portfolioApi = new UpstoxClient.PortfolioApi(upstoxClient);
    const holdings = await portfolioApi.getHoldings();
    const marketApi = new UpstoxClient.MarketQuoteApi(upstoxClient);

    for (const holding of holdings.data) {
      const quote = await marketApi.getMarketQuoteOHLC({ instrument_key: holding.instrument_key });
      const currentPrice = quote.data[holding.instrument_key]?.last_price;

      const existingStock = await Stock.findOne({ userId, symbol: holding.instrument_key, sold: false });
      if (existingStock) {
        existingStock.quantity = holding.quantity;
        existingStock.currentPrice = currentPrice;
        existingStock.priceHistory.push({ date: new Date(), price: currentPrice });
        if (existingStock.priceHistory.length > 100) existingStock.priceHistory.shift();
        await existingStock.save();
      } else {
        const stock = new Stock({
          userId,
          stockName: holding.tradingsymbol,
          symbol: holding.instrument_key,
          quantity: holding.quantity,
          purchasePrice: holding.average_price || currentPrice,
          currentPrice,
          purchaseDate: new Date(),
          priceHistory: [{ date: new Date(), price: currentPrice }]
        });
        await stock.save();
      }
    }
    res.json({ message: 'Portfolio synced successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get portfolio history
exports.getPortfolioHistory = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;

    const stocks = await Stock.find({ userId });
    const historyMap = new Map();
    stocks.forEach(stock => {
      stock.priceHistory.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0];
        const existing = historyMap.get(dateKey) || { date: entry.date, totalValue: 0 };
        existing.totalValue += entry.price * stock.quantity;
        historyMap.set(dateKey, existing);
      });
    });

    const history = Array.from(historyMap.values()).sort((a, b) => a.date - b.date);
    res.json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Search stocks dynamically
exports.searchStocks = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);

    const query = req.query.q ? req.query.q.toLowerCase() : '';
    if (!query) return res.status(400).json({ message: 'Query parameter "q" is required' });

    const marketApi = new UpstoxClient.MarketQuoteApi(upstoxClient);
    const instruments = await marketApi.getMarketInstruments({ search: query });
    const results = instruments.data.slice(0, 10).map(stock => ({
      symbol: stock.instrument_key,
      stockName: stock.name || stock.tradingsymbol,
      exchange: stock.exchange
    }));

    res.json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all current orders from Upstox
// Get all current orders from Upstox
exports.getCurrentOrders = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const user = await verifyToken(token);
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);

    const orderApi = new UpstoxClient.OrderApi(upstoxClient);
    // Pass apiVersion "2" explicitly
    const orderBook = await orderApi.getOrderBook("2");

    // Filter for active orders (e.g., status like 'open', 'triggered', etc.)
    const currentOrders = orderBook.data.filter(order => 
      ['open', 'triggered', 'pending'].includes(order.status.toLowerCase())
    );

    res.json(currentOrders);
  } catch (error) {
    console.error("Error in getCurrentOrders:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Background job to sync all users' portfolios daily
cron.schedule('0 0 * * *', async () => {
  const users = await User.find({ upstoxAccessToken: { $exists: true } });
  for (const user of users) {
    const userId = user._id;
    const upstoxClient = initializeUpstoxClient(user.upstoxAccessToken);
    const portfolioApi = new UpstoxClient.PortfolioApi(upstoxClient);
    const marketApi = new UpstoxClient.MarketQuoteApi(upstoxClient);

    const holdings = await portfolioApi.getHoldings();
    for (const holding of holdings.data) {
      const quote = await marketApi.getMarketQuoteOHLC({ instrument_key: holding.instrument_key });
      const currentPrice = quote.data[holding.instrument_key]?.last_price;

      const existingStock = await Stock.findOne({ userId, symbol: holding.instrument_key, sold: false });
      if (existingStock) {
        existingStock.quantity = holding.quantity;
        existingStock.currentPrice = currentPrice;
        existingStock.priceHistory.push({ date: new Date(), price: currentPrice });
        if (existingStock.priceHistory.length > 100) existingStock.priceHistory.shift();
        await existingStock.save();
      } else {
        const stock = new Stock({
          userId,
          stockName: holding.tradingsymbol,
          symbol: holding.instrument_key,
          quantity: holding.quantity,
          purchasePrice: holding.average_price || currentPrice,
          currentPrice,
          purchaseDate: new Date(),
          priceHistory: [{ date: new Date(), price: currentPrice }]
        });
        await stock.save();
      }
    }
    console.log(`Portfolio synced for user ${userId}`);
  }
});

module.exports = exports;