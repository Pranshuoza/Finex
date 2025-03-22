const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5 },
  mobileNumber: {
    type: String,
    trim: true,
    maxlength: 10,
    minlength: 10,
    unique: true,
    match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
  },
  password: { type: String, required: true, minlength: 6 },
  risk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  investmentGoal: {
    type: String,
    enum: ["Retirement", "Education", "Marriage", "Travel", "Others"],
    default: "Retirement",
  },
  monthlyIncome: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  upstoxAccessToken: { type: String, default: "" },
  upstoxUserId: { type: String },
  tokenExpiresAt: { type: Date },
  tokenIssuedAt: { type: Date },
  chatHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  recentToken: { type: String }, // Used to store the current session token
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);