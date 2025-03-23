import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Zap, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

const BASE_API_URL = "http://localhost:3000/stocks";
const GEMINI_API_KEY = "AIzaSyBO6FEgfYf1m0QFGkj3-fo4fi5g3HqmZbs";
const HF_API_KEY = "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";
const TIMEOUT_MS = 20000;

export default function Dashboard() {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [aiRecommendations] = useState([
    {
      title: "Diversification Strategy",
      description: "Optimize your portfolio allocation",
      action: "View Details",
    },
    {
      title: "Portfolio Prediction",
      description: "See future performance trends",
      action: "View Forecast",
    },
    {
      title: "Risk Analysis",
      description: "Assess sector risks",
      action: "View Risks",
    },
  ]);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [overallPL, setOverallPL] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasUpstoxToken, setHasUpstoxToken] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [diversificationData, setDiversificationData] = useState({
    suggestion: "",
    detailedSuggestion: "",
    chartData: [],
  });
  const [predictionData, setPredictionData] = useState({
    suggestion: "",
    detailedSuggestion: "",
    chartData: [],
  });
  const [riskData, setRiskData] = useState({
    suggestion: "",
    detailedSuggestion: "",
    chartData: [],
    lowRiskStocks: [],
  });
  const [divLoading, setDivLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);

  const navigate = useNavigate();
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fetchStockData = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${BASE_API_URL}/allstocks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      });
      if (!response.ok)
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      const data = await response.json();
      console.log("AI Stock Data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching stock data for AI:", error);
      return [];
    }
  };

  const fetchData = async (endpoint, token) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      headers: { "x-access-token": token },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const fetchGeminiSuggestion = async (prompt) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const result = await model.generateContent(prompt, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = result.response.text().trim();
      return text.split("\n").slice(0, 2).join("\n");
    } catch (error) {
      console.error("Gemini SDK error:", error.message);
      return "API error occurred.\nPlease try again.";
    }
  };

  const fetchHFSuggestion = async (prompt) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_length: 100 },
          }),
        }
      );
      if (!response.ok) throw new Error("Hugging Face API error");
      const data = await response.json();
      const text = data.generated_text || "Prediction unavailable.";
      return text.split("\n").slice(0, 2).join("\n");
    } catch (error) {
      console.error("Error fetching Hugging Face suggestion:", error);
      return "Unable to fetch prediction.\nDefault analysis applied.";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        const profileData = await fetchData("/profile", token);
        if (profileData.status !== "ok" || !profileData.profile)
          throw new Error("Failed to fetch profile");
        setHasUpstoxToken(!!profileData.profile.upstoxAccessToken);

        if (!profileData.profile.upstoxAccessToken) {
          setLoading(false);
          return;
        }

        const stocks = await fetchData("/", token);
        const transformedPortfolio = stocks.map((stock) => ({
          symbol: stock.tradingSymbol,
          netQty: stock.quantity,
          avgPrice: stock.purchasePrice,
          ltp: stock.currentPrice,
          currentValue: stock.currentPrice * stock.quantity,
          overallPL:
            (stock.currentPrice - stock.purchasePrice) * stock.quantity,
          overallPercentage: stock.purchasePrice
            ? ((stock.currentPrice - stock.purchasePrice) /
                stock.purchasePrice) *
              100
            : 0,
          stockId: stock._id,
          sector: stock.tradingSymbol.startsWith("BANK")
            ? "Banking"
            : stock.tradingSymbol.startsWith("TECH")
            ? "Tech"
            : stock.tradingSymbol.startsWith("INFRA")
            ? "Infra"
            : "Others",
        }));
        setPortfolioData(transformedPortfolio);

        const totalInv = stocks.reduce(
          (sum, stock) => sum + stock.purchasePrice * stock.quantity,
          0
        );
        const currValue = stocks.reduce(
          (sum, stock) => sum + stock.currentPrice * stock.quantity,
          0
        );
        setTotalInvestments(totalInv);
        setCurrentValue(currValue);
        setOverallPL(currValue - totalInv);

        const { daily, monthly } = await fetchData("/portfolio/history", token);
        setDailyData(
          daily.map((item) => ({
            name: new Date(item.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
            value: item.value || 0,
          }))
        );
        setMonthlyData(
          monthly.map((item) => ({
            name: new Date(`${item.date}-01`).toLocaleString("en-IN", {
              month: "short",
              year: "numeric",
            }),
            value: item.value || 0,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const generateDiversificationData = (portfolio) => {
    if (!portfolio || portfolio.length === 0) {
      return [{ name: "No Data", currentWeight: 100, suggestedWeight: 100 }];
    }
    const totalValue =
      portfolio.reduce((sum, stock) => sum + stock.currentValue, 0) || 100000;
    const currentDist = portfolio.reduce((acc, stock) => {
      acc[stock.sector] = (acc[stock.sector] || 0) + stock.currentValue;
      return acc;
    }, {});

    const suggestedDist = {
      Banking: 0.4 * 100, // Convert to percentage
      Tech: 0.3 * 100,
      Infra: 0.2 * 100,
      Others: 0.1 * 100,
    };

    return Object.keys(currentDist).map((sector) => ({
      name: sector,
      currentWeight: (currentDist[sector] / totalValue) * 100 || 0,
      suggestedWeight: suggestedDist[sector] || 5, // Default to 5% if sector not predefined
    }));
  };

  const generatePredictionData = (monthlyData, portfolio) => {
    const totalValue =
      portfolio.length > 0
        ? portfolio.reduce((sum, stock) => sum + stock.currentValue, 0)
        : 100000;
    if (!monthlyData || monthlyData.length === 0) {
      return Array(18)
        .fill(0)
        .map((_, i) => ({
          name: `M${i + 1}`,
          current: i < 12 ? totalValue : null,
          predicted: i >= 12 ? totalValue * (1 + (i - 11) * 0.02) : null,
        }));
    }

    const x = monthlyData.map((_, i) => i);
    const y = monthlyData.map((d) => d.value || totalValue);
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const slope =
      n * sumXX - sumX * sumX
        ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        : 0;
    const intercept = n ? (sumY - slope * sumX) / n : totalValue;

    const pastMonths = monthlyData.map((item) => ({
      name: item.name,
      current: item.value || totalValue,
    }));

    const futureMonths = [];
    for (let i = 0; i < 6; i++) {
      const xFuture = n + i;
      const predictedValue = Math.max(
        slope * xFuture + intercept,
        totalValue * 0.95
      );
      const lastDate = new Date(
        `${monthlyData[monthlyData.length - 1].date}-01`
      );
      lastDate.setMonth(lastDate.getMonth() + i + 1);
      futureMonths.push({
        name: lastDate.toLocaleString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        predicted: predictedValue,
      });
    }

    return [...pastMonths, ...futureMonths];
  };

  const generateRiskData = (portfolio) => {
    if (!portfolio || portfolio.length === 0) {
      return [{ name: "No Data", value: 100000, risk: "Unknown" }];
    }
    const total =
      portfolio.reduce((sum, stock) => sum + stock.currentValue, 0) || 100000;
    const riskPerStock = portfolio.map((stock) => {
      const volatility = stock.avgPrice
        ? Math.abs((stock.ltp - stock.avgPrice) / stock.avgPrice) * 100
        : 0;
      const risk = volatility > 10 ? "High" : volatility > 5 ? "Medium" : "Low";
      return {
        name: stock.symbol,
        value: stock.currentValue || 0,
        risk,
        sector: stock.sector,
      };
    });

    const sectorRisk = riskPerStock.reduce((acc, stock) => {
      acc[stock.sector] = acc[stock.sector] || {
        value: 0,
        count: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
      acc[stock.sector].value += stock.value;
      acc[stock.sector].count += 1;
      if (stock.risk === "High") acc[stock.sector].high += 1;
      else if (stock.risk === "Medium") acc[stock.sector].medium += 1;
      else acc[stock.sector].low += 1;
      return acc;
    }, {});

    return Object.keys(sectorRisk).map((sector) => ({
      name: sector,
      value: sectorRisk[sector].value,
      risk:
        sectorRisk[sector].high > sectorRisk[sector].count * 0.5
          ? "High"
          : sectorRisk[sector].medium > sectorRisk[sector].count * 0.5
          ? "Medium"
          : "Low",
    }));
  };

  const fetchAIDiversification = async () => {
    setDivLoading(true);
    const aiPortfolioData = await fetchStockData();
    const portfolioStr = JSON.stringify(
      aiPortfolioData.map((s) => ({
        symbol: s.tradingSymbol,
        currentValue: s.currentPrice * s.quantity,
      }))
    );
    const suggestion = await fetchGeminiSuggestion(
      `Provide a 1-2 line diversification strategy for this portfolio: ${portfolioStr}. Limit to 2 lines.`
    );
    const detailedSuggestion = await fetchGeminiSuggestion(
      `Based on "${suggestion}", suggest 1-2 actionable steps for this portfolio: ${portfolioStr}. Limit to 2 lines.`
    );
    setDiversificationData({
      suggestion,
      detailedSuggestion,
      chartData: generateDiversificationData(aiPortfolioData),
    });
    setDivLoading(false);
  };

  const fetchAIPrediction = async () => {
    setPredLoading(true);
    const aiPortfolioData = await fetchStockData();
    const portfolioStr = JSON.stringify(
      aiPortfolioData.map((s) => ({
        symbol: s.tradingSymbol,
        currentValue: s.currentPrice * s.quantity,
      }))
    );
    const monthlyDataStr = JSON.stringify(monthlyData);
    const totalValue =
      aiPortfolioData.reduce(
        (sum, stock) => sum + stock.currentPrice * stock.quantity,
        0
      ) || 100000;

    const geminiSuggestion =
      totalValue === 0 || monthlyData.length === 0
        ? "Insufficient data for prediction.\nEnsure valid value and history."
        : await fetchGeminiSuggestion(
            `Predict portfolio performance for the next 6 months in 1-2 lines based on value: ${totalValue}, last 12 months: ${monthlyDataStr}, portfolio: ${portfolioStr}.`
          );
    const hfSuggestion =
      totalValue === 0 || monthlyData.length === 0
        ? "Data insufficient for analysis.\nSync portfolio for better insights."
        : await fetchHFSuggestion(
            `Predict portfolio performance for the next 6 months based on value: ${totalValue}, last 12 months: ${monthlyDataStr}, portfolio: ${portfolioStr}. Limit to 2 lines.`
          );
    const suggestion = `Gemini: ${geminiSuggestion}\nHF: ${hfSuggestion}`;
    const detailedSuggestion =
      totalValue === 0 || monthlyData.length === 0
        ? "Add valid portfolio value.\nProvide 12+ months of data."
        : await fetchGeminiSuggestion(
            `List 1-2 key factors for "${geminiSuggestion}" based on data: ${monthlyDataStr}, portfolio: ${portfolioStr}.`
          );

    setPredictionData({
      suggestion,
      detailedSuggestion,
      chartData: generatePredictionData(monthlyData, aiPortfolioData),
    });
    setPredLoading(false);
  };

  const fetchAIRisk = async () => {
    setRiskLoading(true);
    const aiPortfolioData = await fetchStockData();
    const portfolioStr = JSON.stringify(
      aiPortfolioData.map((s) => ({
        symbol: s.tradingSymbol,
        currentValue: s.currentPrice * s.quantity,
      }))
    );
    const suggestion = await fetchGeminiSuggestion(
      `Assess the risk profile in 1-2 lines for this portfolio: ${portfolioStr}.`
    );
    const detailedSuggestion = await fetchGeminiSuggestion(
      `Suggest 1-2 mitigation steps for "${suggestion}" based on this portfolio: ${portfolioStr}.`
    );
    const lowRiskStocks = await fetchGeminiSuggestion(
      `Recommend 3 low-risk stocks for this portfolio in 3 lines: ${portfolioStr}.`
    );
    setRiskData({
      suggestion,
      detailedSuggestion,
      chartData: generateRiskData(aiPortfolioData),
      lowRiskStocks: lowRiskStocks.split("\n").filter((s) => s.trim()),
    });
    setRiskLoading(false);
  };

  useEffect(() => {
    if (!loading && hasUpstoxToken) {
      Promise.all([
        fetchAIDiversification(),
        fetchAIPrediction(),
        fetchAIRisk(),
      ]);
    }
  }, [loading, hasUpstoxToken]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTab(null);
  };

  const getModalContent = () => {
    switch (activeTab) {
      case 0:
        return divLoading
          ? {
              suggestion: "Loading...",
              detailedSuggestion: "Please wait...",
              chartData: [],
            }
          : diversificationData;
      case 1:
        return predLoading
          ? {
              suggestion: "Loading...",
              detailedSuggestion: "Please wait...",
              chartData: [],
            }
          : predictionData;
      case 2:
        return riskLoading
          ? {
              suggestion: "Loading...",
              detailedSuggestion: "Please wait...",
              chartData: [],
              lowRiskStocks: [],
            }
          : riskData;
      default:
        return {
          suggestion: "",
          detailedSuggestion: "",
          chartData: [],
          lowRiskStocks: [],
        };
    }
  };

  const handleSyncPortfolio = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = await fetchData("/portfolio/sync", token);

      const stocks = data.stocks || [];
      const transformedPortfolio = stocks.map((stock) => ({
        symbol: stock.tradingSymbol,
        netQty: stock.quantity,
        avgPrice: stock.purchasePrice,
        ltp: stock.currentPrice,
        currentValue: stock.currentPrice * stock.quantity,
        overallPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
        overallPercentage: stock.purchasePrice
          ? ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) *
            100
          : 0,
        stockId: stock._id,
        sector: stock.tradingSymbol.startsWith("BANK")
          ? "Banking"
          : stock.tradingSymbol.startsWith("TECH")
          ? "Tech"
          : stock.tradingSymbol.startsWith("INFRA")
          ? "Infra"
          : "Others",
      }));
      setPortfolioData(transformedPortfolio);

      const totalInv = stocks.reduce(
        (sum, stock) => sum + stock.purchasePrice * stock.quantity,
        0
      );
      const currValue = stocks.reduce(
        (sum, stock) => sum + stock.currentPrice * stock.quantity,
        0
      );
      setTotalInvestments(totalInv);
      setCurrentValue(currValue);
      setOverallPL(currValue - totalInv);

      const { daily, monthly } = await fetchData("/portfolio/history", token);
      setDailyData(
        daily.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          value: item.value || 0,
        }))
      );
      setMonthlyData(
        monthly.map((item) => ({
          name: new Date(`${item.date}-01`).toLocaleString("en-IN", {
            month: "short",
            year: "numeric",
          }),
          value: item.value || 0,
        }))
      );

      setLoading(false);
      Promise.all([
        fetchAIDiversification(),
        fetchAIPrediction(),
        fetchAIRisk(),
      ]);
    } catch (error) {
      console.error("Error syncing portfolio:", error.message);
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-4 lg:p-6 text-gray-400">Loading...</div>;

  if (hasUpstoxToken === false) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Link Your Upstox Account
        </h2>
        <p className="text-gray-400 mb-6">
          Connect your Upstox account to view your portfolio.
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  const percentageChange = totalInvestments
    ? (((currentValue - totalInvestments) / totalInvestments) * 100).toFixed(1)
    : "0.0";
  const isNegative = percentageChange < 0;

  const enrichedPortfolioData = portfolioData.map((stock) => {
    const sectorData =
      diversificationData.chartData.find((d) => d.name === stock.sector) || {};
    const totalPortfolioValue =
      portfolioData.reduce((sum, s) => sum + s.currentValue, 0) || 100000;
    return {
      ...stock,
      currentSectorAllocation: totalPortfolioValue
        ? ((stock.currentValue / totalPortfolioValue) * 100).toFixed(2)
        : "0.00",
      suggestedSectorAllocation: sectorData.suggestedWeight
        ? sectorData.suggestedWeight.toFixed(2)
        : "N/A",
    };
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleSyncPortfolio}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Sync Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-bl from-slate-800/80 via-gray-900/90 to-stone-800/80 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-slate-500/20 via-gray-500/10 to-stone-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">
              Total Investments
            </h3>
            <div className="text-3xl font-bold">
              ₹
              {totalInvestments.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={`flex items-center mt-2 ${
                isNegative ? "text-red-400" : "text-green-400"
              }`}
            >
              {isNegative ? (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              )}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-blue-900/80 via-gray-900/90 to-steel-800/80 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/20 via-steel-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Current Value</h3>
            <div className="text-3xl font-bold">
              ₹
              {currentValue.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={`flex items-center mt-2 ${
                isNegative ? "text-red-400" : "text-green-400"
              }`}
            >
              {isNegative ? (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              )}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-amber-900/80 via-gray-900/90 to-bronze-800/80 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-amber-600/20 via-bronze-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Overall P&L</h3>
            <div className="text-3xl font-bold">
              ₹{overallPL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div
              className={`flex items-center mt-2 ${
                isNegative ? "text-red-400" : "text-green-400"
              }`}
            >
              {isNegative ? (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              )}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-gray-900 p-5 rounded-xl">
          <h3 className="font-medium text-white mb-4">
            Portfolio Performance (Last 15 Days)
          </h3>
          <div className="h-96 ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  dailyData.length ? dailyData : [{ name: "No Data", value: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  stroke="#4b5563"
                  tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                  domain={["dataMin", "dataMax"]}
                  padding={{ top: 10, bottom: 10 }}
                  tick={{ dx: -5 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e2d",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value) =>
                    `₹${value.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-fuchsia-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-fuchsia-500/20 via-pink-500/10 to-purple-500/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center text-white">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                AI Recommendations
              </h3>
            </div>
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className="relative bg-white/5 rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-all duration-200 overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-white">{rec.title}</h4>
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {rec.description}
                    </p>
                    <button className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center">
                      {rec.action} <ArrowUpRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/90 p-6 rounded-xl w-11/12 max-w-3xl max-h-[90vh] shadow-2xl border border-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-indigo-500/10 opacity-50"></div>
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative z-10 flex flex-col h-full">
              <h4 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                {aiRecommendations[activeTab].title}
              </h4>
              <div className="flex-1 space-y-4 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50 pr-2">
                <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <strong className="text-purple-300">Insight:</strong>
                    <br />
                    {getModalContent().suggestion}
                  </pre>
                </div>
                <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <strong className="text-purple-300">Steps:</strong>
                    <br />
                    {getModalContent().detailedSuggestion ||
                      "No steps available."}
                  </pre>
                </div>
                {activeTab === 2 && (
                  <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                      <strong className="text-purple-300">
                        Low-Risk Stock Recommendations:
                      </strong>
                      <br />
                      {getModalContent().lowRiskStocks.length
                        ? getModalContent().lowRiskStocks.join("\n")
                        : "No recommendations available."}
                    </pre>
                  </div>
                )}
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 0 ? (
                    <BarChart data={getModalContent().chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis
                        stroke="#9ca3af"
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e2d",
                          borderColor: "#374151",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value) => `${value.toFixed(2)}%`}
                      />
                      <Bar
                        dataKey="currentWeight"
                        fill="#8b5cf6"
                        name="Current Weight"
                        animationDuration={1000}
                      />
                      <Bar
                        dataKey="suggestedWeight"
                        fill="#f43f5e"
                        name="Suggested Weight"
                        animationDuration={1000}
                      />
                    </BarChart>
                  ) : activeTab === 1 ? (
                    <LineChart data={getModalContent().chartData}>
                      <CartesianGrid
                        strokeDasharray="5 5"
                        stroke="#1f2937"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tickFormatter={(value) =>
                          `₹${value.toLocaleString("en-IN")}`
                        }
                        domain={["dataMin - 5000", "dataMax + 5000"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e2d",
                          borderColor: "#374151",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value) =>
                          `₹${value.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="current"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#8b5cf6" }}
                        activeDot={{ r: 8, fill: "#fff", stroke: "#8b5cf6" }}
                        animationDuration={1500}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 5, fill: "#f43f5e" }}
                        activeDot={{ r: 8, fill: "#fff", stroke: "#f43f5e" }}
                        animationDuration={1500}
                        connectNulls
                      />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={getModalContent().chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {getModalContent().chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.risk === "High"
                                ? "#f43f5e"
                                : entry.risk === "Medium"
                                ? "#facc15"
                                : "#22c55e"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1e2d",
                          borderColor: "#374151",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value, name, props) => [
                          `${props.payload.risk} Risk`,
                          name,
                        ]}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 p-5 rounded-xl mt-6">
        <h3 className="font-medium text-white mb-4">
          Portfolio Performance (Last 12 Months)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                monthlyData.length
                  ? monthlyData
                  : [{ name: "No Data", value: 0 }]
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#4b5563" />
              <YAxis
                stroke="#4b5563"
                tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2d",
                  borderColor: "#374151",
                }}
                formatter={(value) =>
                  `₹${value.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}`
                }
              />
              <Bar dataKey="value" fill="#6366f1" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden mt-6">
        <div className="absolute inset-0 bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
        <div className="relative z-10">
          <h3 className="font-medium text-white mb-4">Portfolio Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Sector</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Avg Price</th>
                  <th className="pb-3 font-medium">LTP</th>
                  <th className="pb-3 font-medium">Value</th>
                  <th className="pb-3 font-medium">P&L</th>
                  <th className="pb-3 font-medium">%</th>
                  <th className="pb-3 font-medium">Current Alloc (%)</th>
                </tr>
              </thead>
              <tbody>
                {enrichedPortfolioData.map((stock, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 font-medium">{stock.symbol}</td>
                    <td className="py-3">{stock.sector}</td>
                    <td className="py-3">{stock.netQty}</td>
                    <td className="py-3">
                      ₹
                      {stock.avgPrice.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3">
                      ₹
                      {stock.ltp.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3">
                      ₹
                      {stock.currentValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`py-3 ${
                        stock.overallPL >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {stock.overallPL >= 0 ? "+" : ""}
                      {stock.overallPL.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`py-3 ${
                        stock.overallPercentage >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stock.overallPercentage >= 0 ? "+" : ""}
                      {stock.overallPercentage.toFixed(2)}%
                    </td>
                    <td className="py-3">{stock.currentSectorAllocation}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
