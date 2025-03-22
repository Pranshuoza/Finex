const express = require("express");
const router = express.Router();
const stockController = require("../controller/stockController");

// Stock and Portfolio Routes
router.get("/", stockController.getStocks);                    // Get all stocks with real-time prices
router.get("/portfolio/history", stockController.getPortfolioHistory); // Get portfolio history
router.get("/portfolio/sync", stockController.syncPortfolio);   // Sync portfolio with Upstox

module.exports = router;