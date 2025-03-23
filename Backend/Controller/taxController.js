const Tax = require("../Model/Tax");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

const getTaxSlabs = (year) => {
  const taxSlabs = {
    2026: { slab1: 250000, slab2: 500000, slab3: 1000000 },
    2025: { slab1: 250000, slab2: 500000, slab3: 1000000 },
    2024: { slab1: 250000, slab2: 500000, slab3: 1000000 },
  };
  return taxSlabs[year] || taxSlabs[2024];
};

const calculateTax = (
  income,
  deductions,
  LTCG,
  STCG,
  dividendIncome,
  taxYear
) => {
  let taxableIncome = income - deductions;
  const { slab1, slab2, slab3 } = getTaxSlabs(taxYear);

  let LTCG_Tax = LTCG > 100000 ? (LTCG - 100000) * 0.1 : 0;
  let STCG_Tax = STCG * 0.15;
  let dividendTax = dividendIncome * 0.1;

  let totalTax = 0;

  if (taxableIncome <= slab1) totalTax = 0;
  else if (taxableIncome <= slab2) totalTax = (taxableIncome - slab1) * 0.05;
  else if (taxableIncome <= slab3)
    totalTax = 12500 + (taxableIncome - slab2) * 0.2;
  else totalTax = 112500 + (taxableIncome - slab3) * 0.3;

  return totalTax + LTCG_Tax + STCG_Tax + dividendTax;
};

const createOrUpdateTax = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const {
      taxYear,
      userIncome,
      userDeductions,
      longTermCapitalGains,
      shortTermCapitalGains,
      dividendIncome,
    } = req.body;

    const currentTax = calculateTax(
      userIncome,
      userDeductions,
      longTermCapitalGains,
      shortTermCapitalGains,
      dividendIncome,
      taxYear
    );

    let taxRecord = await Tax.findOne({ userId: user._id, taxYear });

    if (taxRecord) {
      taxRecord.userIncome = userIncome;
      taxRecord.userDeductions = userDeductions;
      taxRecord.longTermCapitalGains = longTermCapitalGains;
      taxRecord.shortTermCapitalGains = shortTermCapitalGains;
      taxRecord.dividendIncome = dividendIncome;
      taxRecord.currentTax = currentTax;
      taxRecord.lastUpdated = Date.now();
      await taxRecord.save();
      return res.status(200).json({ message: "Tax record updated", taxRecord });
    } else {
      const newTax = new Tax({
        userId: user._id,
        taxYear,
        userIncome,
        userDeductions,
        longTermCapitalGains,
        shortTermCapitalGains,
        dividendIncome,
        currentTax,
      });
      await newTax.save();
      return res
        .status(201)
        .json({ message: "Tax record created", tax: newTax });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserTaxRecords = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const taxRecords = await Tax.find({ userId: user._id });
    return res.status(200).json(taxRecords);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTaxByYear = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const { taxYear } = req.params;

    const taxRecord = await Tax.findOne({ userId: user._id, taxYear });

    if (!taxRecord)
      return res
        .status(404)
        .json({ error: "No tax record found for this year" });

    return res.status(200).json(taxRecord);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteTaxRecord = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const { taxYear } = req.params;

      const deletedTax = await Tax.findOneAndDelete({
      userId: user._id,
      taxYear,
    });

    if (!deletedTax)
      return res.status(404).json({ error: "No tax record found" });

    return res.status(200).json({ message: "Tax record deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrUpdateTax,
  getUserTaxRecords,
  getTaxByYear,
  deleteTaxRecord,
};