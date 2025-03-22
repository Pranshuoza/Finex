const Tax = require("../Model/Tax");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

const getTax = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const userId = await User.findOne({ email }).select("-password");

    if (!userId) return res.status(401).json({ message: "No user is present" });

    const tax = await Tax.findOne({ userId: userId._id });

    if (!tax) return res.status(401).json({ message: "No tax details found" });

    return res.status(200).json({ tax });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const addTax = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email }).select("-password");

        if (!user) return res.status(401).json({ message: "No user found" });

        const existingTax = await Tax.findOne({ userId: user._id });
        if (existingTax) return res.status(400).json({ message: "Tax details already exist" });

        const newTax = new Tax({ ...req.body, userId: user._id });
        await newTax.save();

        return res.status(201).json({ message: "Tax details added successfully", data: newTax });
    } catch (error) {
        console.error("Error adding tax details:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const deleteTax = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email }).select("-password");

        if (!user) return res.status(401).json({ message: "No user found" });

        const tax = await Tax.findOne({ userId: user._id });
        if (!tax) return res.status(400).json({ message: "No tax details found" });

        await Tax.findByIdAndDelete(tax._id);

        return res.status(200).json({ message: "Tax details deleted successfully" });
    } catch (error) {
        console.error("Error deleting tax details:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateTax = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email }).select("-password");

        if (!user) return res.status(401).json({ message: "No user found" });

        const tax = await Tax.findOne({ userId: user._id });
        if (!tax) return res.status(400).json({ message: "No tax details found" });

        await Tax.findByIdAndUpdate(tax._id, req.body);

        return res.status(200).json({ message: "Tax details updated successfully" });
    } catch (error) {
        console.error("Error updating tax details:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    getTax, addTax, deleteTax, updateTax
};
