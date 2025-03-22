const Goal = require("../Model/Goal");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const { goalName, goalAmount, goalDate, description } = req.body;

    const newGoal = new Goal({
      userId: user._id,
      goalName,
      goalAmount,
      goalDate,
      description,
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
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const goals = await Goal.find({ userId: user._id });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a goal (only if it belongs to the user)
const updateGoal = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const { id } = req.params;
    const { currentAmount } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: user._id });
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    goal.currentAmount = currentAmount;
    goal.completed = goal.currentAmount >= goal.goalAmount;
    await goal.save();

    res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a goal (only if it belongs to the user)
const deleteGoal = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email }).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId: user._id });
    if (!goal) return res.status(404).json({ error: "Goal not found or not authorized" });

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGoal,
  getUserGoals,
  updateGoal,
  deleteGoal,
};