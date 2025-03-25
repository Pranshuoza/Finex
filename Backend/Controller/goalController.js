const Goal = require("../Model/Goal");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

// Verify token helper
const verifyToken = async (token) => {
  if (!token) throw new Error("No token provided");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email }).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const { goalName, goalAmount, goalDate, description, monthlyInvestment } = req.body;

    if (!goalName || !goalAmount || !goalDate) {
      return res.status(400).json({ error: "goalName, goalAmount, and goalDate are required" });
    }

    const newGoal = new Goal({
      userId: user._id,
      goalName,
      goalAmount,
      goalDate,
      currentAmount: 0,
      completed: false,
      description,
      monthlyInvestment: monthlyInvestment || 0,
    });

    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all goals of the authenticated user
const getUserGoals = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const goals = await Goal.find({ userId: user._id });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const { id } = req.params;
    const { currentAmount, monthlyInvestment } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: user._id });
    if (!goal) return res.status(404).json({ error: "Goal not found or not authorized" });

    if (currentAmount !== undefined) {
      goal.currentAmount = currentAmount;
      goal.completed = goal.currentAmount >= goal.goalAmount;
    }
    if (monthlyInvestment !== undefined) {
      goal.monthlyInvestment = monthlyInvestment;
    }

    await goal.save();
    res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId: user._id });
    if (!goal) return res.status(404).json({ error: "Goal not found or not authorized" });

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user financials (only total monthly investment)
const getUserFinancials = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const user = await verifyToken(token);
    const goals = await Goal.find({ userId: user._id });

    // Calculate total monthly investment from all goals
    const totalMonthlyInvestment = goals.reduce((sum, goal) => sum + (goal.monthlyInvestment || 0), 0);
    const initialInvestment = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);

    res.status(200).json({ totalMonthlyInvestment, initialInvestment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGoal,
  getUserGoals,
  updateGoal,
  deleteGoal,
  getUserProfile,
  getUserFinancials,
};