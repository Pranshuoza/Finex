const mongoose = require('mongoose');
const Stock = require('../Model/Stock');
const Transaction = require('../Model/Transaction');
const User = require('../Model/User');
const yahooFinance = require('yahoo-finance2').default;
const jwt = require('jsonwebtoken');

// Helper function to verify JWT token
const verifyToken = async (token) => {
  if (!token) throw new Error('No token provided');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email }).select('_id');
  if (!user) throw new Error('Invalid or expired token');
  return user._id;
};

// Helper function to fetch real-time stock price
const fetchRealTimePrice = async (symbol) => {
  try {
    const formattedSymbol = `${symbol}.NS`;
    const quote = await yahooFinance.quote(formattedSymbol);
    return quote?.regularMarketPrice || null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    return null;
  }
};

// Update price history (called on key actions)
const updatePriceHistory = async (stock) => {
  const latestPrice = await fetchRealTimePrice(stock.symbol);
  if (latestPrice && latestPrice !== stock.currentPrice) {
    stock.currentPrice = latestPrice;
    stock.priceHistory.push({
      date: new Date(),
      price: latestPrice
    });
    // Limit history to last 100 entries (adjust as needed for hackathon)
    if (stock.priceHistory.length > 100) stock.priceHistory.shift();
    await stock.save();
  }
};

// Get all stocks with real-time prices (called on login/dashboard load)
exports.getStocks = async (req, res) => {
  try {
    const userId = await verifyToken(req.headers['x-access-token']);
    const stocks = await Stock.find({ userId });
    
    for (let stock of stocks) {
      if (!stock.sold) {
        await updatePriceHistory(stock);
      }
    }
    
    res.json(stocks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add new stock with transaction
exports.addStock = async (req, res) => {
  try {
    const userId = await verifyToken(req.headers['x-access-token']);
    const { stockName, symbol, quantity, purchasePrice, purchaseDate } = req.body;

    if (!stockName || !symbol || !quantity || !purchasePrice || !purchaseDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const currentPrice = await fetchRealTimePrice(symbol);
    if (!currentPrice) throw new Error('Unable to fetch current stock price');

    const stock = new Stock({
      userId,
      stockName,
      symbol,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      priceHistory: [{ date: new Date(), price: currentPrice }]
    });

    const transaction = new Transaction({
      userId,
      stock: stock._id,
      type: 'Buy',
      quantity,
      transactionDate: purchaseDate,
      transactionAmount: purchasePrice * quantity
    });

    await Promise.all([stock.save(), transaction.save()]);
    res.status(201).json({ stock, transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sell stock with transaction
exports.sellStock = async (req, res) => {
  try {
    const userId = await verifyToken(req.headers['x-access-token']);
    const { stockId, quantity, salePrice, saleDate } = req.body;

    const stock = await Stock.findOne({ _id: stockId, userId, sold: false });
    if (!stock) return res.status(404).json({ message: 'Stock not found or already sold' });

    if (quantity > stock.quantity) {
      return res.status(400).json({ message: 'Insufficient quantity to sell' });
    }

    await updatePriceHistory(stock); // Update price before selling
    const transactionAmount = salePrice * quantity;
    const capitalGains = (salePrice - stock.purchasePrice) * quantity;
    const daysHeld = (new Date(saleDate) - new Date(stock.purchaseDate)) / (1000 * 3600 * 24);

    if (quantity === stock.quantity) {
      stock.sold = true;
      stock.salePrice = salePrice;
      stock.saleDate = saleDate;
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
        saleDate,
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
      transactionDate: saleDate,
      transactionAmount
    });

    await Promise.all([stock.save(), transaction.save()]);
    res.status(200).json({ stock, transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Refresh all stock prices
exports.refreshPrices = async (req, res) => {
  try {
    const userId = await verifyToken(req.headers['x-access-token']);
    const stocks = await Stock.find({ userId, sold: false });

    const updates = stocks.map(async (stock) => {
      await updatePriceHistory(stock);
      return stock;
    });

    const updatedStocks = await Promise.all(updates);
    res.json({ message: 'Stock prices refreshed', stocks: updatedStocks });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Search stocks dynamically
exports.searchStocks = async (req, res) => {
  try {
    await verifyToken(req.headers['x-access-token']);
    const query = req.query.q ? req.query.q.toLowerCase() : '';

    if (!query) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    const searchResults = await yahooFinance.search(query, { quotesCount: 10 });
    const results = searchResults.quotes.map(stock => ({
      symbol: stock.symbol.replace('.NS', ''),
      stockName: stock.shortname || stock.longname || stock.symbol,
      exchange: stock.exchange,
      type: stock.quoteType
    }));

    results.sort((a, b) => {
      const aSymbolMatch = a.symbol.toLowerCase().startsWith(query);
      const bSymbolMatch = b.symbol.toLowerCase().startsWith(query);
      if (aSymbolMatch !== bSymbolMatch) return bSymbolMatch - aSymbolMatch;
      return a.stockName.localeCompare(b.stockName);
    });

    res.json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get portfolio performance history
exports.getPortfolioHistory = async (req, res) => {
  try {
    const userId = await verifyToken(req.headers['x-access-token']);
    const stocks = await Stock.find({ userId });

    // Aggregate history across all stocks
    const historyMap = new Map();
    stocks.forEach(stock => {
      stock.priceHistory.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0]; // Group by day
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