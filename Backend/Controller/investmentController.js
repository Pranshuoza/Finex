/*const Investment = require("../Model/Investment");
const Transaction = require("../Model/Transaction");
const Account = require("../Model/Account");
const yahooFinance = require("yahoo-finance2").default;
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const fs = require("fs");
const User = require("../Model/User");

// Fetch all user investments
exports.getInvestments = async (req, res) => {
    try {
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const userId = await User.findOne({ email: email }).select('-password')
        let investment = await Investment.findOne({ userId });

        if (!investment) {
            investment = new Investment({ userId, stocks: [] });
            await investment.save();
        }
        
        res.json(investment);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// Search stocks from CSV
exports.searchStocks = (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";
    if (!query) return res.status(400).json({ message: "Query parameter is required" });

    const results = [];

    fs.createReadStream("./utils/stock_list.csv")
        .pipe(csv())
        .on("data", (row) => {
            const companyName = row["Company Name"].toLowerCase();
            const symbol = row["Symbol"].toLowerCase();

            if (companyName.includes(query) || symbol.includes(query)) {
                results.push(row);
            }
        })
        .on("end", () => {
            results.sort((a, b) => {
                const aNameMatch = a["Company Name"].toLowerCase().startsWith(query);
                const bNameMatch = b["Company Name"].toLowerCase().startsWith(query);
                return bNameMatch - aNameMatch; 
            });

            res.json(results);
        })
        .on("error", (err) => {
            console.error("Error reading CSV file:", err);
            res.status(500).json({ message: "Error processing stock data" });
        });
};

// Add stock investment
exports.addStock = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];  
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email }).select('_id');

        if (!user) return res.status(401).json({ message: "Invalid or expired token" });

        const { symbol, quantity, purchasePrice, purchaseDate } = req.body;
        if (!symbol || !quantity || !purchasePrice || !purchaseDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        let investment = await Investment.findOne({ userId: user._id });
        if (!investment) {
            investment = new Investment({ userId: user._id, stocks: [] });
        }

        const formattedSymbol = `${symbol}.NS`;
        const stockDetails = await yahooFinance.quote(formattedSymbol);
        if (!stockDetails) throw new Error("Invalid stock symbol or stock not found");

        const stockName = stockDetails.shortName || stockDetails.longName;
        const latestPrice = stockDetails.regularMarketPrice;

        const existingStock = investment.stocks.find(stock => 
            stock.symbol === symbol && !stock.sold
        );

        if (existingStock) {
            const newQuantity = parseInt(existingStock.quantity, 10) + parseInt(quantity, 10);
            const newPurchasePrice =
            ((parseInt(existingStock.quantity, 10) * parseFloat(existingStock.purchasePrice)) +
            (parseInt(quantity, 10) * parseFloat(purchasePrice))) / newQuantity;

            existingStock.quantity = newQuantity;
            existingStock.purchasePrice = newPurchasePrice;
            existingStock.currentPrice = latestPrice;
            if (new Date(purchaseDate) > new Date(existingStock.purchaseDate)) {
                existingStock.purchaseDate = purchaseDate;
            }
        } else {
            investment.stocks.push({
                stockName,
                symbol,
                quantity,
                purchasePrice,
                currentPrice: latestPrice,
                purchaseDate
            });
        }

        await investment.save();
        res.status(200).json(investment);
    } catch (error) {
        console.error("Error in addStock:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// Sell stock and calculate gains
exports.sellStock = async (req, res) => {
    try {
        const token = req.headers['x-access-token']; 
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const userId = await User.findOne({ email: email }).select('-password')
        const investment = await Investment.findOne({ userId });
        if (!userId) return res.status(401).json({ message: "Invalid or expired token" });
        const { symbol, salePrice, saleDate } = req.body;

        if (!investment) return res.status(404).json({ message: "No investments found" });
        const stock = investment.stocks.find((stock) => stock.symbol === symbol && !stock.sold);
        if (!stock) return res.status(400).json({ message: "Stock not found or already sold" });

        stock.sold = true;
        stock.salePrice = salePrice;
        stock.saleDate = saleDate;
        stock.capitalGains = (salePrice - stock.purchasePrice) * stock.quantity;

        const purchaseDate = new Date(stock.purchaseDate);
        const saleDateObj = new Date(saleDate);
        const diffDays = (saleDateObj - purchaseDate) / (1000 * 3600 * 24);

        if (diffDays <= 365) {
            stock.shortTermCapitalGains = stock.capitalGains;
            investment.totalShortTermCapitalGains += stock.capitalGains;
        } else {
            stock.longTermCapitalGains = stock.capitalGains;
            investment.totalLongTermCapitalGains += stock.capitalGains;
        }

        await investment.save();

        const account = await Account.findOne({ userId, isDefault: true });

        const transaction = new Transaction({
            userId,
            accountId: account._id,
            amount: salePrice,
            type: "income",
            categoryName: "Investment Income",
            description: `Sold ${stock.quantity} shares of ${stock.stockName} on ${saleDate}`,
            date: saleDate,
            frequency: "once"
        });
        await transaction.save();

        account.balance += salePrice;
        await account.save();

        res.status(200).json({ message: "Stock sold", investment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Refresh stock prices
exports.refreshStockPrices = async (req, res) => {
    try {
        const token = req.headers['x-access-token']; 
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const userId = await User.findOne({ email: email }).select('-password')
        const investment = await Investment.findOne({ userId });
        if (!userId) return res.status(401).json({ message: "Invalid or expired token" });

        if (!investment) return res.status(404).json({ message: "No investments found" });

        for (let stock of investment.stocks) {
            const formattedSymbol = `${stock.symbol}.NS`;
            const latestPrice = await fetchStockPrice(formattedSymbol);
            if (latestPrice) stock.currentPrice = latestPrice;
        }

        await investment.save();
        res.json({ message: "Stock prices updated successfully", stocks: investment.stocks });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Fetch stock price from Yahoo Finance
const fetchStockPrice = async (symbol) => {
    try {
        const result = await yahooFinance.quote(symbol);
        return result?.regularMarketPrice || null;
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error.message);
        return null;
    }
};

// Add fixed deposit investment
exports.addFD = async (req, res) => {
    try{
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const userId = await User.findOne({ email: email }).select('-password');
        if (!userId) return res.status(401).json({ message: "Invalid or expired token" });
        const { bankName, depositAmount, interestRate, startDate, maturityDate } = req.body;
        if (!bankName || !depositAmount || !interestRate || !startDate || !maturityDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const investment = await Investment.findOne({ userId });

        if (!investment) return res.status(404).json({ message: "No investments found" });
        
        const timePeriod = (new Date(maturityDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365);

        const maturityAmount = depositAmount * Math.pow((1 + (interestRate / 400)), 4 * timePeriod);

        const interestEarned = maturityAmount - depositAmount;

        investment.fixedDeposits.push({
            bankName,
            depositAmount,
            interestRate,
            startDate,
            maturityDate,
            interestEarned,
            maturityAmount
        });

        await investment.save();
        res.json({ message: "Fixed deposit added successfully", investment });
    }catch(error){
        res.status(400).json({ message: error.message });
        return null;
    }
}

// Update fixed deposit investment
exports.updateFD = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const userId = await User.findOne({ email: email }).select('-password');
        if (!userId) return res.status(401).json({ message: "Invalid or expired token" });
        const { bankName, depositAmount, interestRate, startDate, maturityDate } = req.body;
        if (!bankName || !depositAmount || !interestRate || !startDate || !maturityDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const investment = await Investment.findOne({ userId });

        if (!investment) return res.status(404).json({ message: "No investments found" });

        const timePeriod = (new Date(maturityDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365);

        const maturityAmount = depositAmount * Math.pow((1 + (interestRate / 400)), 4 * timePeriod);

        const interestEarned = maturityAmount - depositAmount;

        const fdIndex = investment.fixedDeposits.findIndex(fd => fd.bankName === bankName);
        if (fdIndex === -1) return res.status(404).json({ message: "Fixed deposit not found" });

        investment.fixedDeposits[fdIndex] = {
            bankName,
            depositAmount,
            interestRate,
            startDate,
            maturityDate,
            interestEarned,
            maturityAmount
        };

        await investment.save();
        res.json({ message: "Fixed deposit updated successfully", investment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Remove fixed deposit investment
exports.removeFD = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const userId = await User.findOne({ email: email }).select('-password');
        if (!userId) return res.status(401).json({ message: "Invalid or expired token" });
        const { bankName } = req.body;
        if (!bankName) return res.status(400).json({ message: "Bank name is required" });

        const investment = await Investment.findOne({ userId });

        if (!investment) return res.status(404).json({ message: "No investments found" });

        const fdIndex = investment.fixedDeposits.findIndex(fd => fd.bankName === bankName);
        if (fdIndex === -1) return res.status(404).json({ message: "Fixed deposit not found" });

        investment.fixedDeposits.splice(fdIndex, 1);
        await investment.save();
        res.json({ message: "Fixed deposit removed successfully", investment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}*/
