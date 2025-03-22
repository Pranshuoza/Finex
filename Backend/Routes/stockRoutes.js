const express = require('express');
const router = express.Router();
const stockController = require('../controller/stockController');

router.get('/', stockController.getStocks);
router.post('/', stockController.addStock);
router.post('/sell', stockController.sellStock);
router.get('/refresh', stockController.refreshPrices);
router.get('/search', stockController.searchStocks);
router.get('/portfolio/history', stockController.getPortfolioHistory);

module.exports = router;