const Tax = require("../Model/Tax");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    req.userId = decoded.id; // Assuming the token contains the user ID
    next();
  });
};

// Tax calculation logic
const calculateTax = (income, capitalGainsLT, capitalGainsST, dividendIncome, year) => {
  const taxSlabs = {
    2024: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 600000, rate: 5 },
      { min: 600000, max: 900000, rate: 10 },
      { min: 900000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 },
    ],
    2025: [
      { min: 0, max: 400000, rate: 0 },
      { min: 400000, max: 800000, rate: 5 },
      { min: 800000, max: 1200000, rate: 10 },
      { min: 1200000, max: 1600000, rate: 15 },
      { min: 1600000, max: 2000000, rate: 20 },
      { min: 2000000, max: 2400000, rate: 25 },
      { min: 2400000, max: Infinity, rate: 30 },
    ],
  };

  const standardDeductions = { 2024: 75000, 2025: 75000 };
  const rebates = {
    2024: { maxIncome: 700000, maxRebate: 25000 },
    2025: { maxIncome: 1200000, maxRebate: 60000 },
  };

  if (!taxSlabs[year]) throw new Error("Invalid tax year");

  let taxableIncome = Math.max(0, income - (standardDeductions[year] || 0));
  let incomeTax = 0;
  for (const slab of taxSlabs[year]) {
    if (taxableIncome > slab.min) {
      const taxableAmount = Math.min(taxableIncome, slab.max) - slab.min;
      incomeTax += (taxableAmount * slab.rate) / 100;
    }
  }

  let rebate = taxableIncome <= rebates[year].maxIncome ? Math.min(incomeTax, rebates[year].maxRebate) : 0;
  incomeTax = Math.max(0, incomeTax - rebate);

  let ltcgTax = (capitalGainsLT * 10) / 100; // 10% LTCG tax
  let stcgTax = (capitalGainsST * 15) / 100; // 15% STCG tax
  let dividendTax = 0; // Dividend income is tax-free

  let totalTax = incomeTax + ltcgTax + stcgTax + dividendTax;
  let cess = totalTax * 0.04;

  return {
    incomeTax,
    ltcgTax,
    stcgTax,
    dividendTax,
    totalTax,
    cess,
    currentTax: totalTax + cess,
  };
};

// Calculate tax route
const calculateTaxRoute = async (req, res) => {
  try {
    const { userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear } = req.body;
    const taxDetails = calculateTax(
      userIncome,
      longTermCapitalGains,
      shortTermCapitalGains,
      dividendIncome,
      taxYear
    );
    res.status(200).json({ message: "Tax calculated", data: taxDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create tax record
const createTaxRecord = async (req, res) => {
  try {
    const { taxYear, userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome } = req.body;
    const userId = req.userId; // Extracted from token
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const taxDetails = calculateTax(userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear);
    const newTax = new Tax({
      userId,
      taxYear,
      userIncome,
      userDeductions: 75000, // Standard deduction
      longTermCapitalGains,
      shortTermCapitalGains,
      dividendIncome,
      currentTax: taxDetails.currentTax,
    });

    await newTax.save();
    res.status(201).json({ message: "Tax record created", data: newTax });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tax records for a user
const getAllTaxRecords = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from token
    const taxRecords = await Tax.find({ userId }).populate("userId", "name email");
    if (!taxRecords.length) return res.status(404).json({ message: "No tax records found" });

    let totalIncome = 0, totalTaxPaid = 0, totalCessPaid = 0;
    taxRecords.forEach((record) => {
      totalIncome += record.userIncome;
      totalTaxPaid += record.currentTax;
      totalCessPaid += record.currentTax * 0.04;
    });

    const summary = {
      totalIncome,
      totalTaxPaid,
      totalCessPaid,
      totalAmountPaid: totalTaxPaid + totalCessPaid,
      taxHistory: taxRecords,
    };

    res.status(200).json({ message: "Tax records retrieved", data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update tax record
const updateTaxRecord = async (req, res) => {
  try {
    const { userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear } = req.body;
    const taxDetails = calculateTax(userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear);

    const updatedRecord = await Tax.findByIdAndUpdate(
      req.params.id,
      {
        userIncome,
        userDeductions: 75000,
        longTermCapitalGains,
        shortTermCapitalGains,
        dividendIncome,
        taxYear,
        currentTax: taxDetails.currentTax,
        lastUpdated: Date.now(),
      },
      { new: true }
    );

    if (!updatedRecord) return res.status(404).json({ error: "Tax record not found" });
    res.status(200).json({ message: "Tax record updated", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete tax record
const deleteTaxRecord = async (req, res) => {
  try {
    const deletedRecord = await Tax.findByIdAndDelete(req.params.id);
    if (!deletedRecord) return res.status(404).json({ error: "Tax record not found" });
    res.status(200).json({ message: "Tax record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total tax summary
const getTotalTax = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from token
    const taxRecords = await Tax.find({ userId });
    if (!taxRecords.length) return res.status(404).json({ message: "No tax records found" });

    let totalIncome = 0, totalTaxPaid = 0, totalCessPaid = 0;
    taxRecords.forEach((record) => {
      totalIncome += record.userIncome;
      totalTaxPaid += record.currentTax;
      totalCessPaid += record.currentTax * 0.04;
    });

    const totalSummary = {
      userId,
      totalIncome,
      totalTaxPaid,
      totalCessPaid,
      totalAmountPaid: totalTaxPaid + totalCessPaid,
    };

    res.status(200).json({ message: "Complete tax summary", data: totalSummary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  calculateTaxRoute: [verifyToken, calculateTaxRoute],
  createTaxRecord: [verifyToken, createTaxRecord],
  getAllTaxRecords: [verifyToken, getAllTaxRecords],
  updateTaxRecord: [verifyToken, updateTaxRecord],
  deleteTaxRecord: [verifyToken, deleteTaxRecord],
  getTotalTax: [verifyToken, getTotalTax],
};