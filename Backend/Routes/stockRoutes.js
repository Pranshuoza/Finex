const express = require('express');
const router = express.Router();
const stockController = require('../controller/stockController');

// Upstox authentication routes
router.get('/upstox-login', stockController.upstoxLogin);
router.get('/upstox-callback', stockController.upstoxCallback);
router.get('/', stockController.getStocks);
router.post('/', stockController.addStock);
router.post('/sell', stockController.sellStock);
router.get('/search', stockController.searchStocks);
router.get('/portfolio/history', stockController.getPortfolioHistory);
router.get('/portfolio/sync', stockController.syncPortfolio);
router.get('/orders/current', stockController.getCurrentOrders); // New route

module.exports = router;