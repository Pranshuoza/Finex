const express = require("express");
const {
  createTaxRecord,
  getAllTaxRecords,
  updateTaxRecord,
  deleteTaxRecord,
  getTotalTax,
} = require("../Controller/taxController");

const router = express.Router();

// Create a tax record
router.post("/", createTaxRecord);

// Get all tax records
router.get("/", getAllTaxRecords);

// Update a specific tax record by ID
router.put("/:id", updateTaxRecord);

// Delete a tax record by ID
router.delete("/:id", deleteTaxRecord);

// Get total tax summary for a specific user
router.get("/total/:userId", getTotalTax);

module.exports = router;
