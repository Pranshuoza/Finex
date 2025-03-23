const express = require("express");
const {
  createTaxRecord,
  getAllTaxRecords,
  updateTaxRecord,
  deleteTaxRecord,
  getTotalTax,
  calculateTaxRoute,
} = require("../Controller/taxController");

const router = express.Router();

// Base URL: /api/tax

// Calculate tax and return result
router.post("/calculate", calculateTaxRoute);

// Create a tax record
router.post("/", createTaxRecord);

// Get all tax records for a user
router.get("/:userId", getAllTaxRecords);

// Update a specific tax record by ID
router.put("/:id", updateTaxRecord);

// Delete a tax record by ID
router.delete("/:id", deleteTaxRecord);

// Get total tax summary for a specific user
router.get("/total/:userId", getTotalTax);

module.exports = router;