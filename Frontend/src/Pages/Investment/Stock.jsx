import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, Zap, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = "http://localhost:3000/stocks";

export default function Dashboard() {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [aiRecommendations] = useState([
    { title: "Diversification Strategy", description: "Optimize your portfolio allocation", action: "View Details" },
    { title: "Portfolio Prediction", description: "See future performance trends", action: "View Forecast" },
    { title: "Risk Analysis", description: "Assess sector risks", action: "View Risks" },
  ]);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [overallPL, setOverallPL] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasUpstoxToken, setHasUpstoxToken] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  // Static AI-like content based on your portfolio
  const staticDiversificationData = {
    suggestion: "Your portfolio is heavily concentrated in 'Others' sector.\nDiversify into Banking and Tech for stability.",
    detailedSuggestion: "Reduce exposure to high-volatility stocks like HEROMOTOCO and IREDA.\nAdd stable stocks like TCS and HDFCBANK.",
    chartData: [
      { name: "HEROMOTOCO", currentWeight: 4.26, suggestedWeight: 2.0 },
      { name: "BAJAJHFL", currentWeight: 21.78, suggestedWeight: 15.0 },
      { name: "ADANIENSOL", currentWeight: 9.77, suggestedWeight: 7.0 },
      { name: "NOCIL", currentWeight: 16.83, suggestedWeight: 10.0 },
      { name: "IREDA", currentWeight: 9.09, suggestedWeight: 5.0 },
      { name: "ADANIGREEN", currentWeight: 22.42, suggestedWeight: 15.0 },
      { name: "ZOMATO", currentWeight: 13.36, suggestedWeight: 10.0 },
      { name: "NTPC", currentWeight: 0.41, suggestedWeight: 1.0 },
      { name: "HDFCBANK", currentWeight: 2.08, suggestedWeight: 10.0 },
      { name: "TCS", currentWeight: 0, suggestedWeight: 15.0 },
      { name: "RELIANCE", currentWeight: 0, suggestedWeight: 10.0 },
    ],
    newStocks: ["TCS", "RELIANCE", "ICICIBANK"],
  };

  const staticPredictionData = {
    suggestion: "Portfolio may see moderate growth over 6 months.\nPositive performers like ADANIGREEN and ZOMATO to drive gains.",
    detailedSuggestion: "Recent volatility in HEROMOTOCO and IREDA impacts short-term growth.\nStable performers like HDFCBANK provide a buffer.",
    chartData: [
      { name: "Mar 24", value: 85000, type: "current" },
      { name: "Apr 24", value: 83000, type: "current" },
      { name: "May 24", value: 84000, type: "current" },
      { name: "Jun 24", value: 82000, type: "current" },
      { name: "Jul 24", value: 86000, type: "current" },
      { name: "Aug 24", value: 87000, type: "current" },
      { name: "Sep 24", value: 85000, type: "current" },
      { name: "Oct 24", value: 88000, type: "current" },
      { name: "Nov 24", value: 85142, type: "current" },
      { name: "Dec 24", value: 86000, type: "current" },
      { name: "Jan 25", value: 87000, type: "current" },
      { name: "Feb 25", value: 85142, type: "current" },
      { name: "Mar 25", value: 86000, type: "predicted" },
      { name: "Apr 25", value: 87500, type: "predicted" },
      { name: "May 25", value: 89000, type: "predicted" },
      { name: "Jun 25", value: 90500, type: "predicted" },
      { name: "Jul 25", value: 92000, type: "predicted" },
      { name: "Aug 25", value: 93500, type: "predicted" },
    ],
  };

  const staticRiskData = {
    suggestion: "High risk detected due to volatility in HEROMOTOCO and IREDA.\nOverall portfolio leans towards medium-high risk.",
    detailedSuggestion: "Mitigate risk by reducing stakes in high-loss stocks.\nIncrease allocation to low-volatility stocks like HDFCBANK.",
    chartData: [
      { name: "Others", value: 85142, risk: "High" }, // Aggregated sector data
    ],
    lowRiskStocks: ["HDFCBANK", "RELIANCE", "INFY"],
  };

  const [diversificationData, setDiversificationData] = useState(staticDiversificationData);
  const [predictionData, setPredictionData] = useState(staticPredictionData);
  const [riskData, setRiskData] = useState(staticRiskData);
  const [divLoading, setDivLoading] = useState(false);
  const [predLoading, setPredLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);

  const fetchData = async (endpoint, token) => {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, { headers: { "x-access-token": token } });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const handleSyncPortfolio = async () => {
    try {
      setLoading(true);
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

      // Update static AI data with real portfolio data
      const divData = generateDiversificationData(transformedPortfolio);
      setDiversificationData({
        ...staticDiversificationData,
        chartData: divData.chartData,
        newStocks: staticDiversificationData.newStocks,
      });
      setPredictionData({
        ...staticPredictionData,
        chartData: generatePredictionData(monthly, transformedPortfolio),
      });
      setRiskData({
        ...staticRiskData,
        chartData: generateRiskData(transformedPortfolio),
      });
    } catch (error) {
      console.error("Error syncing portfolio:", error.message);
      setLoading(false);

      // Fallback to your static portfolio if sync fails
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
      setPortfolioData(fallbackPortfolio);
      const totalInv = fallbackPortfolio.reduce((sum, stock) => sum + stock.avgPrice * stock.netQty, 0);
      const currValue = fallbackPortfolio.reduce((sum, stock) => sum + stock.currentValue, 0);
      setTotalInvestments(totalInv);
      setCurrentValue(currValue);
      setOverallPL(currValue - totalInv);

      const divData = generateDiversificationData(fallbackPortfolio);
      setDiversificationData({
        ...staticDiversificationData,
        chartData: divData.chartData,
        newStocks: staticDiversificationData.newStocks,
      });
      setPredictionData({
        ...staticPredictionData,
        chartData: generatePredictionData([], fallbackPortfolio), // No monthly data, use fallback
      });
      setRiskData({
        ...staticRiskData,
        chartData: generateRiskData(fallbackPortfolio),
      });
    }
  };

  // Auto-sync on page load
  useEffect(() => {
    handleSyncPortfolio();
  }, [navigate]);

  const generateDiversificationData = (portfolio) => {
    const totalValue = portfolio.reduce((sum, stock) => sum + stock.currentValue, 0) || 100000;
    const suggestedWeights = {
      Banking: 0.4,
      Tech: 0.3,
      Infra: 0.2,
      Others: 0.1,
    };

    const sectorTotals = portfolio.reduce((acc, stock) => {
      acc[stock.sector] = (acc[stock.sector] || 0) + stock.currentValue;
      return acc;
    }, {});

    const currentStocks = portfolio.map((stock) => {
      const sectorSuggestedWeight = suggestedWeights[stock.sector] || 0.1;
      const sectorCurrentTotal = sectorTotals[stock.sector] || stock.currentValue;
      const stockSuggestedWeight = (stock.currentValue / sectorCurrentTotal) * sectorSuggestedWeight * 100;
      return {
        name: stock.symbol,
        currentWeight: (stock.currentValue / totalValue) * 100,
        suggestedWeight: Math.min(stockSuggestedWeight, 100),
      };
    });

    const newStocks = [
      { name: "RELIANCE", currentWeight: 0, suggestedWeight: 10 },
      { name: "TCS", currentWeight: 0, suggestedWeight: 8 },
      { name: "ICICIBANK", currentWeight: 0, suggestedWeight: 12 },
    ];

    return {
      chartData: [...currentStocks, ...newStocks],
      newStocks: newStocks.map(stock => stock.name),
    };
  };

  const generatePredictionData = (monthlyData, portfolio) => {
    const totalValue = portfolio.reduce((sum, stock) => sum + stock.currentValue, 0) || 85142; // Your current portfolio value
    if (!monthlyData || monthlyData.length === 0) {
      return Array(18).fill(0).map((_, i) => ({
        name: `M${i + 1}`,
        value: i < 12 ? totalValue : totalValue * (1 + (i - 11) * 0.02),
        type: i < 12 ? "current" : "predicted",
      }));
    }

    const x = monthlyData.map((_, i) => i);
    const y = monthlyData.map(d => d.value || totalValue);
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const slope = n * sumXX - sumX * sumX ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
    const intercept = n ? (sumY - slope * sumX) / n : totalValue;

    const pastMonths = monthlyData.map((item) => ({
      name: item.name,
      value: item.value || totalValue,
      type: "current",
    }));

    const futureMonths = [];
    for (let i = 0; i < 6; i++) {
      const xFuture = n + i;
      const predictedValue = Math.max(slope * xFuture + intercept, totalValue * 0.95);
      const lastDate = new Date(`${monthlyData[monthlyData.length - 1].date}-01`);
      lastDate.setMonth(lastDate.getMonth() + i + 1);
      futureMonths.push({
        name: lastDate.toLocaleString("en-IN", { month: "short", year: "numeric" }),
        value: predictedValue,
        type: "predicted",
      });
    }

    return [...pastMonths, ...futureMonths];
  };

  const generateRiskData = (portfolio) => {
    const total = portfolio.reduce((sum, stock) => sum + stock.currentValue, 0) || 100000;
    const riskPerStock = portfolio.map(stock => {
      const volatility = stock.avgPrice ? Math.abs((stock.ltp - stock.avgPrice) / stock.avgPrice) * 100 : 0;
      const risk = volatility > 10 ? "High" : volatility > 5 ? "Medium" : "Low";
      return { name: stock.symbol, value: stock.currentValue || 0, risk, sector: stock.sector };
    });

    const sectorRisk = riskPerStock.reduce((acc, stock) => {
      acc[stock.sector] = acc[stock.sector] || { value: 0, count: 0, high: 0, medium: 0, low: 0 };
      acc[stock.sector].value += stock.value;
      acc[stock.sector].count += 1;
      if (stock.risk === "High") acc[stock.sector].high += 1;
      else if (stock.risk === "Medium") acc[stock.sector].medium += 1;
      else acc[stock.sector].low += 1;
      return acc;
    }, {});

    return Object.keys(sectorRisk).map(sector => ({
      name: sector,
      value: sectorRisk[sector].value,
      risk: sectorRisk[sector].high > sectorRisk[sector].count * 0.5 ? "High" :
             sectorRisk[sector].medium > sectorRisk[sector].count * 0.5 ? "Medium" : "Low",
    }));
  };

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
      case 0: return divLoading ? { suggestion: "Loading...", detailedSuggestion: "Please wait...", chartData: [], newStocks: [] } : diversificationData;
      case 1: return predLoading ? { suggestion: "Loading...", detailedSuggestion: "Please wait...", chartData: [] } : predictionData;
      case 2: return riskLoading ? { suggestion: "Loading...", detailedSuggestion: "Please wait...", chartData: [], lowRiskStocks: [] } : riskData;
      default: return { suggestion: "", detailedSuggestion: "", chartData: [], newStocks: [], lowRiskStocks: [] };
    }
  };

  if (loading) return <div className="p-4 lg:p-6 text-gray-400">Loading...</div>;

  if (hasUpstoxToken === false) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-white mb-4">Link Your Upstox Account</h2>
        <p className="text-gray-400 mb-6">Connect your Upstox account to view your portfolio.</p>
        <button onClick={() => navigate("/profile")} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Go to Profile
        </button>
      </div>
    );
  }

  const percentageChange = totalInvestments ? ((currentValue - totalInvestments) / totalInvestments * 100).toFixed(1) : "0.0";
  const isNegative = percentageChange < 0;

  const enrichedPortfolioData = portfolioData.map(stock => {
    const stockData = diversificationData.chartData.find(d => d.name === stock.symbol) || {};
    const totalPortfolioValue = portfolioData.reduce((sum, s) => sum + s.currentValue, 0) || 100000;
    return {
      ...stock,
      currentSectorAllocation: totalPortfolioValue ? (stock.currentValue / totalPortfolioValue * 100).toFixed(2) : "0.00",
      suggestedSectorAllocation: stockData.suggestedWeight ? stockData.suggestedWeight.toFixed(2) : "N/A",
    };
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="flex space-x-4 mb-6">
        <button onClick={handleSyncPortfolio} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Sync Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-bl from-slate-800/80 via-gray-900/90 to-stone-800/80 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-slate-500/20 via-gray-500/10 to-stone-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Total Investments</h3>
            <div className="text-3xl font-bold">₹{totalInvestments.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center mt-2 ${isNegative ? "text-red-400" : "text-green-400"}`}>
              {isNegative ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-blue-900/80 via-gray-900/90 to-steel-800/80 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/20 via-steel-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Current Value</h3>
            <div className="text-3xl font-bold">₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center mt-2 ${isNegative ? "text-red-400" : "text-green-400"}`}>
              {isNegative ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-amber-900/80 via-gray-900/90 to-bronze-800/80 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-amber-600/20 via-bronze-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Overall P&L</h3>
            <div className="text-3xl font-bold">₹{overallPL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center mt-2 ${isNegative ? "text-red-400" : "text-green-400"}`}>
              {isNegative ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-gray-900 p-5 rounded-xl">
          <h3 className="font-medium text-white mb-4">Portfolio Performance (Last 15 Days)</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData.length ? dailyData : [{ name: "No Data", value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#4b5563" padding={{ left: 10, right: 10 }} />
                <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} domain={["dataMin", "dataMax"]} padding={{ top: 10, bottom: 10 }} tickMargin={10} />
                <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
                <Line type="monotone" dataKey="value" stroke="#8██описаниеLineChart strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-fuchsia-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-bl from-fuchsia-500/20 via-pink-500/10 to-purple-500/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center text-white">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                AI Recommendations
              </h3>
            </div>
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} onClick={() => handleTabClick(index)} className="relative bg-white/5 rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-all duration-200 overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-white">{rec.title}</h4>
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
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
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="relative z-10 flex flex-col h-full">
              <h4 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                {aiRecommendations[activeTab].title}
              </h4>
              <div className="flex-1 space-y-4 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50 pr-2">
                <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <strong className="text-purple-300">Insight:</strong><br/>
                    {getModalContent().suggestion}
                  </pre>
                </div>
                <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                    <strong className="text-purple-300">Steps:</strong><br/>
                    {getModalContent().detailedSuggestion || "No steps available."}
                  </pre>
                </div>
                {activeTab === 0 && (
                  <>
                    <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="py-2">Stock</th>
                            <th className="py-2">Current Weight (%)</th>
                            <th className="py-2">Suggested Weight (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getModalContent().chartData.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="py-2">{item.name}</td>
                              <td className="py-2">{item.currentWeight.toFixed(2)}</td>
                              <td className="py-2">{item.suggestedWeight.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                        <strong className="text-purple-300">New Stock Recommendations:</strong><br/>
                        {getModalContent().newStocks.length ? getModalContent().newStocks.join('\n') : "No new stocks suggested."}
                      </pre>
                    </div>
                  </>
                )}
                {activeTab === 2 && (
                  <div className="max-h-40 overflow-y-auto scrollbar scrollbar-thumb-rounded-lg scrollbar-thumb-purple-500 scrollbar-track-gray-800/50">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                      <strong className="text-purple-300">Low-Risk Stock Recommendations:</strong><br/>
                      {getModalContent().lowRiskStocks.length ? getModalContent().lowRiskStocks.join('\n') : "No recommendations available."}
                    </pre>
                  </div>
                )}
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 0 ? (
                    <BarChart data={getModalContent().chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#9ca3af" interval={0} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}%`} domain={[0, 'dataMax + 10']} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value) => `${value.toFixed(2)}%`} />
                      <Legend />
                      <Bar dataKey="currentWeight" fill="#8b5cf6" name="Current Weight" animationDuration={1000} />
                      <Bar dataKey="suggestedWeight" fill="#f43f5e" name="Suggested Weight" animationDuration={1000} />
                    </BarChart>
                  ) : activeTab === 1 ? (
                    <LineChart data={getModalContent().chartData}>
                      <CartesianGrid strokeDasharray="5 5" stroke="#1f2937" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#9ca3af" interval={0} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} domain={['dataMin - 5000', 'dataMax + 5000']} tickMargin={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#8b5cf6" }}
                        activeDot={{ r: 8, fill: "#fff", stroke: "#8b5cf6" }}
                        animationDuration={1500}
                        strokeDasharray={getModalContent().chartData.some(item => item.type === "predicted") ? "5 5" : "0 0"}
                        name="Portfolio Value"
                      />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={getModalContent().chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                        {getModalContent().chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.risk === "High" ? "#f43f5e" : entry.risk === "Medium" ? "#facc15" : "#22c55e"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }} formatter={(value, name, props) => [`${props.payload.risk} Risk`, name]} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 p-5 rounded-xl mt-6">
        <h3 className="font-medium text-white mb-4">Portfolio Performance (Last 12 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData.length ? monthlyData : [{ name: "No Data", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#4b5563" interval={0} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} tickMargin={10} />
              <Tooltip contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151" }} formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
              <Line dataKey="value" stroke="#6366f1" animationDuration={1000} strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
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
                  <th className="pb-3 font-medium">Suggested Alloc (%)</th>
                </tr>
              </thead>
              <tbody>
                {enrichedPortfolioData.map((stock, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
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
                    <td className="py-3">{stock.suggestedSectorAllocation}%</td>
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