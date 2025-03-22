const express = require("express");
const { createOrUpdateTax, getUserTaxRecords, getTaxByYear, deleteTaxRecord } = require("../Controller/taxController");

const router = express.Router();

router.post("/", createOrUpdateTax);
router.get("/", getUserTaxRecords);
router.get("/:taxYear", getTaxByYear);
router.delete("/:taxYear", deleteTaxRecord);

module.exports = router;