const express = require("express");
const {
  createTaxRecord,
  getAllTaxRecords,
  updateTaxRecord,
  deleteTaxRecord,
  getTotalTax
} = require("../Controller/taxController");

const router = express.Router();

router.post("/create", createTaxRecord
);

router.get("/", getAllTaxRecords);

router.put("/:id", updateTaxRecord);

router.delete("/:id", deleteTaxRecord);

router.get("/total/:userId", getTotalTax);

module.exports = router;
