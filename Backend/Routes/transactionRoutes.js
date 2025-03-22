const express = require("express");
const router = express.Router();
const transactionController = require("../controller/transactionController");

router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getUserTransactions);
router.put("/:transactionId", transactionController.updateTransaction);
router.delete("/:transactionId", transactionController.deleteTransaction);

module.exports = router;
