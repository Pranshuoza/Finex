import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBO6FEgfYf1m0QFGkj3-fo4fi5g3HqmZbs"); // Use .env for security

export class ChatbotAPI {
  constructor(token) {
    this.token = token; // Store token passed from frontend
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are a top-tier Indian financial expert AI, specializing in the Indian stock market (NSE/BSE). Deliver precise, actionable, and confident financial insights tailored to the Indian context. Use the provided stock data (in ₹) as your primary source to answer queries with accuracy and authority. Focus on Indian stocks, market trends, and investment strategies. Avoid disclaimers, suggestions to consult a financial advisor, or vague responses. For each answer, include a confidence level (as a percentage, e.g., 'Confidence: 95%') based on the reliability of your analysis and the data provided. If stock data is missing, make reasonable assumptions based on current Indian market conditions (e.g., Nifty 50, Sensex trends) and note them clearly in your response.",
    });
  }

  // Fetch stock data from backend with token
  async fetchStockData() {
    try {
      const response = await fetch("http://localhost:3000/stocks/allstocks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": this.token || "", // Use token if provided, empty string otherwise
        },
      });

      // Log response for debugging (moved outside fetch options)
      console.log("Fetching stock data...", response);

      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return []; // Return empty array as fallback
    }
  }

  // Generate response using standard API with stock data context
  async generateResponse(message) {
    try {
      // Fetch user's stock data
      const stockData = await this.fetchStockData();

      // Format stock data as a structured string for clarity, using ₹
      const stockContext = stockData.length
        ? "User's Stock Portfolio (use this data for analysis, prices in ₹):\n" +
          stockData
            .map(
              (stock) =>
                `- ${stock.stockName} (${stock.symbol}): ${stock.quantity} shares, Current Price: ₹${stock.currentPrice}`
            )
            .join("\n") +
          "\n\nBased on this data, provide a concise, actionable answer to the query below, tailored to the Indian financial market, including a confidence level (e.g., 'Confidence: 95%')."
        : "No stock data available for the user. Make reasonable assumptions based on current Indian market conditions (e.g., Nifty 50, Sensex trends) and note them in your response, including a confidence level.";

      // Combine stock context with user message
      const fullPrompt = `${stockContext}\n\nUser Query: ${message}`;

      const result = await this.model.generateContent(fullPrompt);
      let response = result.response.text();

      // Post-process to remove unwanted phrases and ensure confidence level
      response = response
        .replace(/I am not a financial advisor/gi, "")
        .replace(/consult a financial advisor/gi, "")
        .replace(/this is not financial advice/gi, "")
        .trim();

      // If confidence level is missing, append a default one based on data availability
      if (!response.includes("Confidence:")) {
        const confidence = stockData.length ? "Confidence: 90%" : "Confidence: 70%"; // Higher confidence with data
        response += `\n${confidence}`;
      }

      return response;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  // No session cleanup needed for non-streaming API
  closeSession() {
    // No-op since there's no live session
  }
}