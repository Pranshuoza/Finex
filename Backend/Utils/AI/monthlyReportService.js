require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../../Model/User");
const Transaction = require("../../Model/Transaction");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// AI Insight Generator
async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

// Fetch user's financial stats
async function getMonthlyStats(userId, month) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let byCategory = {};

  transactions.forEach((tx) => {
    if (tx.type === "income") totalIncome += tx.amount;
    else totalExpenses += tx.amount;

    if (!byCategory[tx.categoryName]) byCategory[tx.categoryName] = 0;
    byCategory[tx.categoryName] += tx.amount;
  });

  return { totalIncome, totalExpenses, byCategory };
}

module.exports = { generateFinancialInsights, getMonthlyStats};
