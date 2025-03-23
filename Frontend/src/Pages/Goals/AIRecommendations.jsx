import { useState, useEffect } from "react";
import { Zap, ArrowUpRight } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBO6FEgfYf1m0QFGkj3-fo4fi5g3HqmZbs"); // Your API key
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Changed to gemini-pro for broader compatibility
  systemInstruction:
    "You are an expert Indian financial advisor AI specializing in NSE/BSE markets. Provide 3 short, precise, actionable investment recommendations in ₹ tailored to Indian users based on their goals and an additional investment amount. Use the goal data (goalName, goalAmount, currentAmount, goalDate, description, monthlyInvestment) and investment amount to suggest specific Indian financial instruments (e.g., NSE stocks, mutual funds, gold, NPS). For each recommendation, include a confidence level (e.g., '95%') and expected annual return (e.g., '8%'). Allocate the investment amount if provided. Format each recommendation with a title and a concise two-line description.",
});

export default function AIRecommendations({ goals, investmentAmount }) {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!goals.length && investmentAmount === 0) {
        setRecommendations([]);
        setError(null);
        return;
      }

      const goalContext = goals.length
        ? goals
            .map(
              (g) =>
                `- ${g.goalName}: Goal Amount: ₹${g.goalAmount}, Current: ₹${g.currentAmount || 0}, Monthly: ₹${g.monthlyInvestment || 0}, Deadline: ${new Date(g.goalDate).toLocaleDateString("en-IN")}, Desc: ${g.description || "N/A"}`
            )
            .join("\n")
        : "No goals provided.";
      const prompt = `User's Financial Goals (in ₹):\n${goalContext}\n\nAdditional Investment: ₹${investmentAmount}\n\nProvide 3 short investment recommendations tailored to the Indian market (e.g., NSE stocks, mutual funds, gold, NPS). Include confidence level (e.g., '95%') and expected annual return (e.g., '8%') for each. Allocate the investment amount if provided. Format each recommendation as: [Title]\nLine 1 of description\nLine 2 of description`;

      try {
        const result = await model.generateContent(prompt);
        const geminiResponse = result.response.text();
        console.log("Gemini Response:", geminiResponse); // Debug log

        const parsedRecommendations = geminiResponse
          .split("\n\n")
          .filter((r) => r.trim())
          .map((rec) => {
            const lines = rec.split("\n");
            const title = lines[0].replace(/^\[|\]$/, ""); // Remove [brackets] from title
            const confidenceMatch = rec.match(/(\d+)% confidence/i);
            const returnMatch = rec.match(/(\d+(\.\d+)?)% return/i);
            return {
              title,
              description: lines.slice(1, 3).join("\n"), // Take exactly 2 lines for description
              confidence: confidenceMatch ? confidenceMatch[1] + "%" : "90%",
              expectedReturn: returnMatch ? returnMatch[1] + "%" : "8%",
            };
          });

        setRecommendations(parsedRecommendations.slice(0, 3)); // Limit to 3
        setError(null);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
        setError("Failed to fetch recommendations. Please try again later.");
      }
    };

    fetchRecommendations();
  }, [goals, investmentAmount]);

  return (
    <div className="relative bg-gradient-to-bl from-fuchsia-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-fuchsia-500/20 via-pink-500/10 to-purple-500/20"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            AI Investment Options
          </h3>
        </div>
        <div className="space-y-4">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className="relative bg-white/5 rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-all duration-200 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      {rec.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-line">{rec.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Return: {rec.expectedReturn}</p>
                  <button className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center">
                    Invest
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">Add goals or investment amount for recommendations.</p>
          )}
        </div>
      </div>
    </div>
  );
}