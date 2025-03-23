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

const fallbackPortfolio = [
  { symbol: "HEROMOTOCO", sector: "Others", netQty: 1, avgPrice: 5940, ltp: 3629, currentValue: 3629, overallPL: -2311, overallPercentage: -38.91 },
  { symbol: "BAJAJHFL", sector: "Others", netQty: 150, avgPrice: 138, ltp: 123.61, currentValue: 18541.5, overallPL: -2158.5, overallPercentage: -10.43 },
  { symbol: "ADANIENSOL", sector: "Others", netQty: 10, avgPrice: 950, ltp: 831.7, currentValue: 8317, overallPL: -1183, overallPercentage: -12.45 },
  { symbol: "NOCIL", sector: "Others", netQty: 75, avgPrice: 241.68, ltp: 191.08, currentValue: 14331, overallPL: -3795, overallPercentage: -20.94 },
  { symbol: "IREDA", sector: "Others", netQty: 50, avgPrice: 239, ltp: 154.82, currentValue: 7741, overallPL: -4209, overallPercentage: -35.22 },
  { symbol: "ADANIGREEN", sector: "Others", netQty: 20, avgPrice: 913.85, ltp: 954.25, currentValue: 19085, overallPL: 808, overallPercentage: 4.42 },
  { symbol: "ZOMATO", sector: "Others", netQty: 50, avgPrice: 215, ltp: 227.52, currentValue: 11376, overallPL: 626, overallPercentage: 5.82 },
  { symbol: "NTPC", sector: "Others", netQty: 1, avgPrice: 435.55, ltp: 351.3, currentValue: 351.3, overallPL: -84.25, overallPercentage: -19.34 },
  { symbol: "HDFCBANK", sector: "Others", netQty: 1, avgPrice: 1777, ltp: 1770.35, currentValue: 1770.35, overallPL: -6.65, overallPercentage: -0.37 },
];

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

  const [diversificationData, setDiversificationData] = useState({ suggestion: "", detailedSuggestion: "", chartData: [] });
  const [predictionData, setPredictionData] = useState({ suggestion: "", detailedSuggestion: "", chartData: [] });
  const [riskData, setRiskData] = useState({ suggestion: "", detailedSuggestion: "", chartData: [], lowRiskStocks: [] });
  const [divLoading, setDivLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);

  const navigate = useNavigate();
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const fetchStockData = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${BASE_API_URL}/allstocks`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-access-token": token },
      });
      if (!response.ok) throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      const data = await response.json();
      console.log("AI Stock Data:", data);
      console.log("monthlyData", monthlyData);
      return data;
    } catch (error) {
      console.error("Error fetching stock data for AI:", error);
      return [];
    }
  };

  const fetchData = async (endpoint, token) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, { headers: { "x-access-token": token } });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  // Mock Gemini API responses based on fallbackPortfolio
  const fetchGeminiSuggestion = async (prompt) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (prompt.includes("diversification strategy")) {
          resolve("Shift 30% to Banking and 20% to Tech.\nReduce Others from 100% to 40%.");
        } else if (prompt.includes("actionable steps") && prompt.includes("Shift 30% to Banking")) {
          resolve("Buy ₹20K HDFCBANK and ₹15K TCS.\nSell ₹25K of IREDA and HEROMOTOCO.");
        } else if (prompt.includes("Predict portfolio performance")) {
          resolve("Expect 5-7% growth in 6 months.\nZOMATO and ADANIGREEN to offset losses.");
        } else if (prompt.includes("key factors")) {
          resolve("ZOMATO’s 5.82% gain boosts upside.\nHEROMOTOCO’s -38.91% drags performance.");
        } else if (prompt.includes("risk profile")) {
          resolve("High risk with 100% in volatile Others.\nHEROMOTOCO and IREDA increase exposure.");
        } else if (prompt.includes("mitigation steps") && prompt.includes("High risk")) {
          resolve("Reduce IREDA by 50% (₹3.8K).\nAdd ₹10K in RELIANCE for stability.");
        } else if (prompt.includes("low-risk stocks")) {
          resolve("HDFCBANK: Low volatility at -0.37%.\nRELIANCE: Steady conglomerate.\nINFY: Reliable tech growth.");
        } else {
          resolve("Mock Gemini response.\nAdjust prompt for specific data.");
        }
      }, 1000); // Simulate API delay
    });
  };

  // Mock Hugging Face API responses based on fallbackPortfolio
  const fetchHFSuggestion = async (prompt) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (prompt.includes("Predict portfolio performance")) {
          resolve("Moderate 6% growth potential.\nHigh volatility in IREDA limits gains.");
        } else {
          resolve("Mock HF response.\nAdjust prompt for specific data.");
        }
      }, 1000); // Simulate API delay
    });
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

        const profileData = await fetchData("/profile", token.replace("/stocks", ""));
        if (profileData.status !== "ok" || !profileData.profile) throw new Error("Failed to fetch profile");
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
          overallPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
          overallPercentage: stock.purchasePrice ? ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100 : 0,
          stockId: stock._id,
          sector: stock.tradingSymbol.startsWith("BANK") ? "Banking" :
                  stock.tradingSymbol.startsWith("TECH") ? "Tech" :
                  stock.tradingSymbol.startsWith("INFRA") ? "Infra" : "Others",
        }));
        setPortfolioData(transformedPortfolio);

        const totalInv = stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
        const currValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
        setTotalInvestments(totalInv);
        setCurrentValue(currValue);
        setOverallPL(currValue - totalInv);

        const { daily, monthly } = await fetchData("/portfolio/history", token);
        setDailyData(daily.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          value: item.value || 0,
        })));
        setMonthlyData(monthly.map((item) => ({
          name: new Date(`${item.date}-01`).toLocaleString("en-IN", { month: "short", year: "numeric" }),
          value: item.value || 0,
        })));

        console.log("Monthly Data", monthlyData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, location.pathname]);

  // Diversification Data based on fallbackPortfolio
  const generateDiversificationData = () => {
    const totalValue = fallbackPortfolio.reduce((sum, stock) => sum + stock.currentValue, 0);
    const currentDist = fallbackPortfolio.reduce((acc, stock) => {
      acc[stock.sector] = (acc[stock.sector] || 0) + stock.currentValue;
      return acc;
    }, {});

    const suggestedDist = {
      Banking: totalValue * 0.3, // 30%
      Tech: totalValue * 0.2,    // 20%
      Infra: totalValue * 0.1,   // 10%
      Others: totalValue * 0.4,  // 40%
    };

    return [
      { name: "Banking", currentWeight: 0, suggestedWeight: (suggestedDist.Banking / totalValue) * 100 },
      { name: "Tech", currentWeight: 0, suggestedWeight: (suggestedDist.Tech / totalValue) * 100 },
      { name: "Infra", currentWeight: 0, suggestedWeight: (suggestedDist.Infra / totalValue) * 100 },
      { name: "Others", currentWeight: (currentDist.Others / totalValue) * 100, suggestedWeight: (suggestedDist.Others / totalValue) * 100 },
    ];
  };

  // Prediction Data based on fallbackPortfolio
  const generatePredictionData = () => {
    const totalCurrentValue = fallbackPortfolio.reduce((sum, stock) => sum + stock.currentValue, 0);
    const mockMonthlyData = [
      { name: "Apr 2024", value: 91772.6 },
      { name: "May 2024", value: 93585.15 },
      { name: "Jun 2024", value: 93633.75 },
      { name: "Jul 2024", value: 105239.95 },
      { name: "Aug 2024", value: 100145.75 },
      { name: "Sept 2024", value: 126332.4 },
      { name: "Oct 2024", value: 113159.9 },
      { name: "Nov 2024", value: 106200.9 },
      { name: "Dec 2024", value: 97198.3 },
      { name: "Jan 2025", value: 89871.65 },
      { name: "Feb 2025", value: 75913.2 },
      { name: "Mar 2025", value: 85142.15 },
    ];

    const futureMonths = [
      { name: "Mar 2025", predicted: 85142.15 },
      { name: "Apr 2025", predicted: 87142.15 },
      { name: "May 2025", predicted: 88642.15 },
      { name: "Jun 2025", predicted: 87197.15 },
      { name: "Jul 2025", predicted: 90278.4 },
      { name: "Aug 2025", predicted: 91695.32 },
      { name: "Sep 2025", predicted: 91185.82 },
    ];

    return [...mockMonthlyData.map(d => ({ ...d, current: d.value })), ...futureMonths.map(d => ({ ...d, current: null }))];
  };

  // Risk Data based on fallbackPortfolio
  const generateRiskData = () => {
    const riskPerStock = fallbackPortfolio.map(stock => {
      const volatility = Math.abs(stock.overallPercentage);
      const risk = volatility > 20 ? "High" : volatility > 10 ? "Medium" : "Low";
      return { name: stock.symbol, value: stock.currentValue, risk, sector: stock.sector };
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
    const suggestion = await fetchGeminiSuggestion("Provide a 1-2 line diversification strategy for this portfolio.");
    const detailedSuggestion = await fetchGeminiSuggestion(`Based on "${suggestion}", suggest 1-2 actionable steps for this portfolio.`);
    setDiversificationData({
      suggestion,
      detailedSuggestion,
      chartData: generateDiversificationData(),
    });
    setDivLoading(false);
  };

  const fetchAIPrediction = async () => {
    setPredLoading(true);
    const geminiSuggestion = await fetchGeminiSuggestion("Predict portfolio performance for the next 6 months in 1-2 lines.");
    const hfSuggestion = await fetchHFSuggestion("Predict portfolio performance for the next 6 months.");
    const suggestion = `${geminiSuggestion}\nHF: ${hfSuggestion}`;
    const detailedSuggestion = await fetchGeminiSuggestion(`List 1-2 key factors for "${geminiSuggestion}".`);
    setPredictionData({
      suggestion,
      detailedSuggestion,
      chartData: generatePredictionData(),
    });
    setPredLoading(false);
  };

  const fetchAIRisk = async () => {
    setRiskLoading(true);
    const suggestion = await fetchGeminiSuggestion("Assess the risk profile in 1-2 lines for this portfolio.");
    const detailedSuggestion = await fetchGeminiSuggestion(`Suggest 1-2 mitigation steps for "${suggestion}".`);
    const lowRiskStocks = await fetchGeminiSuggestion("Recommend 3 low-risk stocks for this portfolio in 3 lines.");
    setRiskData({
      suggestion,
      detailedSuggestion,
      chartData: generateRiskData(),
      lowRiskStocks: lowRiskStocks.split('\n').filter(s => s.trim()),
    });
    setRiskLoading(false);
  };

  useEffect(() => {
    if (!loading && hasUpstoxToken) {
      Promise.all([fetchAIDiversification(), fetchAIPrediction(), fetchAIRisk()]);
    }
  }, [loading, hasUpstoxToken, location.pathname]);

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
      case 0: return divLoading ? { suggestion: "Loading...", detailedSuggestion: "Please wait...", chartData: [] } : diversificationData;
      case 1: return predLoading ? { suggestion: "Loading...", detailedSuggestion: "Please wait...", chartData: [] } : predictionData;
      case 2: return riskLoading ? { suggestion: "Loading...", detailedSuggestion: "Please wait...", chartData: [], lowRiskStocks: [] } : riskData;
      default: return { suggestion: "", detailedSuggestion: "", chartData: [], lowRiskStocks: [] };
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
        overallPercentage: stock.purchasePrice ? ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100 : 0,
        stockId: stock._id,
        sector: stock.tradingSymbol.startsWith("BANK") ? "Banking" :
                stock.tradingSymbol.startsWith("TECH") ? "Tech" :
                stock.tradingSymbol.startsWith("INFRA") ? "Infra" : "Others",
      }));
      setPortfolioData(transformedPortfolio);

      const totalInv = stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
      const currValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
      setTotalInvestments(totalInv);
      setCurrentValue(currValue);
      setOverallPL(currValue - totalInv);

      const { daily, monthly } = await fetchData("/portfolio/history", token);
      setDailyData(daily.map((item) => ({
        name: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: item.value || 0,
      })));
      setMonthlyData(monthly.map((item) => ({
        name: new Date(`${item.date}-01`).toLocaleString("en-IN", { month: "short", year: "numeric" }),
        value: item.value || 0,
      })));

      setLoading(false);
      Promise.all([fetchAIDiversification(), fetchAIPrediction(), fetchAIRisk()]);
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

  const enrichedPortfolioData = portfolioData.map(stock => {
    const sectorData = diversificationData.chartData.find(d => d.name === stock.sector) || {};
    const totalPortfolioValue = portfolioData.reduce((sum, s) => sum + s.currentValue, 0) || 100000;
    return {
      ...stock,
      currentSectorAllocation: totalPortfolioValue ? (stock.currentValue / totalPortfolioValue * 100).toFixed(2) : "0.00",
      suggestedSectorAllocation: sectorData.suggestedWeight ? sectorData.suggestedWeight.toFixed(2) : "N/A",
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
          <h3 className="font-medium text-white mb-4">Portfolio Performance (Last 15 Days)</h3>
          <div className="h-96 ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  dailyData.length ? dailyData : [{ name: "No Data", value: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#4b5563" padding={{ left: 10, right: 10 }} />
                <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} domain={["dataMin", "dataMax"]} padding={{ top: 10, bottom: 10 }} tick={{ dx: -5 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: "#d1d5db" }} />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}%`} domain={[0, 100]} tick={{ fill: "#d1d5db" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value) => `${value.toFixed(2)}%`} />
                      <Bar dataKey="currentWeight" fill="#8b5cf6" name="Current" animationDuration={1000} barSize={30} />
                      <Bar dataKey="suggestedWeight" fill="#f43f5e" name="Suggested" animationDuration={1000} barSize={30} />
                    </BarChart>
                  ) : activeTab === 1 ? (
                    <LineChart data={getModalContent().chartData}>
                      <CartesianGrid strokeDasharray="5 5" stroke="#1f2937" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#9ca3af" interval={0} angle={-45} textAnchor="end" height={60} tick={{ fill: "#d1d5db" }} />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} domain={['dataMin - 5000', 'dataMax + 5000']} tick={{ fill: "#d1d5db" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
                      <Line type="monotone" dataKey="current" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: "#8b5cf6" }} activeDot={{ r: 8, fill: "#fff", stroke: "#8b5cf6" }} animationDuration={1500} connectNulls />
                      <Line type="monotone" dataKey="predicted" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5, fill: "#f43f5e" }} activeDot={{ r: 8, fill: "#fff", stroke: "#f43f5e" }} animationDuration={1500} connectNulls />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={getModalContent().chartData} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value" animationDuration={1000}>
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
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value, name, props) => [`${props.payload.risk} Risk`, `₹${value.toLocaleString("en-IN")}`]} />
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
            <BarChart data={monthlyData.length ? monthlyData : [{ name: "No Data", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#4b5563" />
              <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
              <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151" }} formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
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
                    <td className="py-3">₹{stock.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3">₹{stock.ltp.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3">₹{stock.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className={`py-3 ${stock.overallPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.overallPL >= 0 ? "+" : ""}{stock.overallPL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 ${stock.overallPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.overallPercentage >= 0 ? "+" : ""}{stock.overallPercentage.toFixed(2)}%
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
