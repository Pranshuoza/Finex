const express = require("express");
const router = express.Router();
const investmentController = require("../Controller/investmentController");

router.get("/", investmentController.getInvestments);
router.get("/search", investmentController.searchStocks);
router.post("/addStock", investmentController.addStock);
router.post("/sellStock", investmentController.sellStock);
router.put("/refresh", investmentController.refreshStockPrices);
router.post("/addFD", investmentController.addFD);
router.put("/updateFD", investmentController.updateFD);
router.delete("/removeFD", investmentController.removeFD);

module.exports = router;
