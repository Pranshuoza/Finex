const Tax = require("../Model/Tax");
const User = require("../Model/User");

// Fixed deductions for each year (Assumption based on Indian tax rules)
const standardDeductions = {
  2024: 50000,  // ₹50,000 standard deduction
  2025: 60000,  // ₹60,000 standard deduction
};

// Function to calculate tax
const calculateTax = (income, capitalGainsLT, capitalGainsST, dividendIncome, year) => {
  const taxSlabs = {
    2024: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
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

  if (!taxSlabs[year]) throw new Error("Invalid tax year provided");

  // Apply standard deduction
  let taxableIncome = income - (standardDeductions[year] || 0);
  taxableIncome = Math.max(0, taxableIncome); // Ensure it's not negative

  let tax = 0;
  for (const slab of taxSlabs[year]) {
    if (taxableIncome > slab.min) {
      const taxableAmount = Math.min(taxableIncome, slab.max) - slab.min;
      tax += (taxableAmount * slab.rate) / 100;
    }
  }

  // Capital Gains Tax
  let ltTax = (capitalGainsLT * 10) / 100;
  let stTax = (capitalGainsST * 15) / 100;

  // Dividend Tax (only if income exceeds ₹10,00,000)
  let dividendTax = dividendIncome > 1000000 ? (dividendIncome * 10) / 100 : 0;

  // Total Tax Calculation
  let totalTax = tax + ltTax + stTax + dividendTax;
  let cess = totalTax * 0.04; // 4% cess

  return { totalTax, cess, currentTax: totalTax + cess };
};

// Create Tax Record
const createTaxRecord = async (req, res) => {
  try {
    const { userId, taxYear, userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Calculate tax
    const taxDetails = calculateTax(userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear);

    // Save tax record
    const newTax = new Tax({
      userId,
      taxYear,
      userIncome,
      userDeductions: standardDeductions[taxYear] || 0, // Use fixed deduction
      longTermCapitalGains,
      shortTermCapitalGains,
      dividendIncome,
      currentTax: taxDetails.currentTax,
    });

    await newTax.save();
    res.status(201).json({ message: "Tax record created successfully", data: newTax });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Tax Records
const getAllTaxRecords = async (req, res) => {
  try {
    const taxRecords = await Tax.find().populate("userId", "name email");
    res.status(200).json({ message: "All tax records", data: taxRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Tax Record
const updateTaxRecord = async (req, res) => {
  try {
    const { userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear } = req.body;

    // Recalculate tax
    const taxDetails = calculateTax(userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear);

    const updatedRecord = await Tax.findByIdAndUpdate(
      req.params.id,
      {
        userIncome,
        userDeductions: standardDeductions[taxYear] || 0, // Use fixed deduction
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

// Delete Tax Record
const deleteTaxRecord = async (req, res) => {
  try {
    const deletedRecord = await Tax.findByIdAndDelete(req.params.id);
    if (!deletedRecord) return res.status(404).json({ error: "Tax record not found" });

    res.status(200).json({ message: "Tax record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Total Tax Summary for User
const getTotalTax = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all tax records for the user
    const taxRecords = await Tax.find({ userId });

    if (!taxRecords.length) {
      return res.status(404).json({ message: "No tax records found for this user" });
    }

    // Calculate total values
    let totalIncome = 0;
    let totalTaxPaid = 0;
    let totalCessPaid = 0;

    taxRecords.forEach((record) => {
      totalIncome += record.userIncome;
      totalTaxPaid += record.currentTax;
      totalCessPaid += record.currentTax * 0.04; // 4% cess
    });

    const totalSummary = {
      userId,
      totalIncome,
      totalTaxPaid,
      totalCessPaid,
      totalAmountPaid: totalTaxPaid + totalCessPaid,
    };

    res.status(200).json({ message: "Total Tax Summary", data: totalSummary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export Controller
module.exports = { createTaxRecord, getAllTaxRecords, updateTaxRecord, deleteTaxRecord, getTotalTax };
