import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ChevronDown, ArrowUpRight, ArrowDownRight, Zap, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_API_URL = "http://localhost:3000/stocks";
const GEMINI_API_KEY = "AIzaSyBO6FEgfYf1m0QFGkj3-fo4fi5g3HqmZbs"; // Replace with your Gemini API key
const HF_API_TOKEN = "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"; // Your Hugging Face API token

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
  const [modalContent, setModalContent] = useState({ suggestion: "", detailedSuggestion: "", chartData: [] });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          navigate("/login");
          return;
        }

        const profileRes = await fetch(`${BASE_API_URL.replace("/stocks", "")}/profile`, {
          headers: { "x-access-token": token },
        });
        const profileData = await profileRes.json();
        if (profileData.status !== "ok" || !profileData.profile) throw new Error("Failed to fetch profile");
        setHasUpstoxToken(!!profileData.profile.upstoxAccessToken);

        if (!profileData.profile.upstoxAccessToken) {
          setLoading(false);
          return;
        }

        const stocksRes = await fetch(`${BASE_API_URL}/`, { headers: { "x-access-token": token } });
        if (!stocksRes.ok) throw new Error("Failed to fetch stocks");
        const stocks = await stocksRes.json();

        const transformedPortfolio = stocks.map((stock) => ({
          symbol: stock.tradingSymbol,
          netQty: stock.quantity,
          avgPrice: stock.purchasePrice,
          ltp: stock.currentPrice,
          currentValue: stock.currentPrice * stock.quantity,
          overallPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
          overallPercentage: stock.purchasePrice ? ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100 : 0,
          stockId: stock._id,
        }));
        setPortfolioData(transformedPortfolio);

        const totalInv = stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
        const currValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
        setTotalInvestments(totalInv);
        setCurrentValue(currValue);
        setOverallPL(currValue - totalInv);

        const historyRes = await fetch(`${BASE_API_URL}/portfolio/history`, { headers: { "x-access-token": token } });
        if (!historyRes.ok) throw new Error("Failed to fetch portfolio history");
        const { daily, monthly } = await historyRes.json();

        setDailyData(daily.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          value: item.value,
        })));

        setMonthlyData(monthly.map((item) => ({
          name: new Date(`${item.date}-01`).toLocaleString("en-IN", { month: "short", year: "numeric" }),
          value: item.value,
        })));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleSyncPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/portfolio/sync`, {
        method: "GET",
        headers: { "x-access-token": token },
      });
      if (!res.ok) throw new Error("Failed to sync portfolio");
      const data = await res.json();

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
      }));
      setPortfolioData(transformedPortfolio);

      const totalInv = stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
      const currValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
      setTotalInvestments(totalInv);
      setCurrentValue(currValue);
      setOverallPL(currValue - totalInv);

      const historyRes = await fetch(`${BASE_API_URL}/portfolio/history`, { headers: { "x-access-token": token } });
      if (!historyRes.ok) throw new Error("Failed to fetch portfolio history");
      const { daily, monthly } = await historyRes.json();

      setDailyData(daily.map((item) => ({
        name: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: item.value,
      })));

      setMonthlyData(monthly.map((item) => ({
        name: new Date(`${item.date}-01`).toLocaleString("en-IN", { month: "short", year: "numeric" }),
        value: item.value,
      })));
    } catch (error) {
      console.error("Error syncing portfolio:", error);
    }
  };

  const fetchGeminiSuggestion = async (prompt) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 100 } },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API error:", error);
      return "Unable to generate suggestion at this time.";
    }
  };

  const fetchHuggingFaceSuggestion = async (prompt) => {
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/distilgpt2",
        { inputs: prompt, max_length: 150 },
        { headers: { Authorization: `Bearer ${HF_API_TOKEN}` } }
      );
      return response.data[0].generated_text;
    } catch (error) {
      console.error("Hugging Face API error:", error);
      return "Unable to generate detailed suggestion at this time.";
    }
  };

  const generateDiversificationData = (currentPortfolio) => {
    const currentTotal = currentPortfolio.reduce((sum, stock) => sum + stock.currentValue, 0);
    const suggestedPortfolio = [
      { name: "Banking", value: currentTotal * 0.4 },
      { name: "Tech", value: currentTotal * 0.3 },
      { name: "Infra", value: currentTotal * 0.2 },
      { name: "Others", value: currentTotal * 0.1 },
    ];
    return currentPortfolio.map((stock, index) => ({
      name: stock.symbol,
      current: stock.currentValue,
      suggested: suggestedPortfolio[index % 4].value / (currentPortfolio.length / 4),
    }));
  };

  const generatePredictionData = (monthlyData) => {
    const lastThreeMonths = monthlyData.slice(-3);
    const futureThreeMonths = [];
    const lastValue = lastThreeMonths[lastThreeMonths.length - 1]?.value || currentValue;
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      const randomChange = (Math.random() - 0.5) * lastValue * 0.1;
      futureThreeMonths.push({
        name: date.toLocaleString("en-IN", { month: "short", year: "numeric" }),
        predicted: lastValue + randomChange * (i + 1),
      });
    }
    return [...lastThreeMonths, ...futureThreeMonths];
  };

  const generateRiskData = () => {
    return [
      { name: "Banking", value: 20, risk: "Low" },
      { name: "Tech", value: 30, risk: "Medium" },
      { name: "Infra", value: 40, risk: "High" },
      { name: "Others", value: 10, risk: "Low" },
    ];
  };

  const handleTabClick = async (index) => {
    setActiveTab(index);
    setModalOpen(true);

    const rec = aiRecommendations[index];
    let suggestion = "";
    let detailedSuggestion = "";
    let chartData = [];

    if (index === 0) { // Diversification Strategy
      suggestion = await fetchGeminiSuggestion(
        `Suggest a diversification strategy for a portfolio with ${portfolioData.map(s => s.symbol).join(", ")}.`
      );
      detailedSuggestion = await fetchHuggingFaceSuggestion(
        `${suggestion} Provide detailed steps to implement this strategy.`
      );
      chartData = generateDiversificationData(portfolioData);
    } else if (index === 1) { // Portfolio Prediction
      suggestion = await fetchGeminiSuggestion(
        `Predict the portfolio performance for the next 3 months based on current value ${currentValue}.`
      );
      detailedSuggestion = await fetchHuggingFaceSuggestion(
        `${suggestion} Explain the factors influencing this prediction.`
      );
      chartData = generatePredictionData(monthlyData);
    } else if (index === 2) { // Risk Analysis
      suggestion = await fetchGeminiSuggestion(
        `Analyze the risk of the portfolio with ${portfolioData.map(s => s.symbol).join(", ")} based on global and local factors.`
      );
      detailedSuggestion = await fetchHuggingFaceSuggestion(
        `${suggestion} Detail the risky sectors and mitigation steps.`
      );
      chartData = generateRiskData();
    }

    setModalContent({ suggestion, detailedSuggestion, chartData });
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveTab(null);
  };

  if (loading) return <div className="p-4 lg:p-6 text-gray-400">Loading...</div>;

  if (hasUpstoxToken === false) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-white mb-4">Link Your Upstox Account</h2>
        <p className="text-gray-400 mb-6">Please connect your Upstox account to view your portfolio.</p>
        <button
          onClick={() => navigate("/profile")}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  const percentageChange = totalInvestments ? ((currentValue - totalInvestments) / totalInvestments * 100).toFixed(1) : "0.0";
  const isNegative = percentageChange < 0;

  return (
    <div className="p-4 lg:p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleSyncPortfolio}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sync Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-bl from-slate-800/80 via-gray-900/90 to-stone-800/80 p-5 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-slate-500/20 via-gray-500/10 to-stone-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Total Investments</h3>
            <div className="text-3xl font-bold">₹{totalInvestments.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center mt-2 ${isNegative ? "text-red-400" : "text-green-400"}`}>
              {isNegative ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-blue-900/80 via-gray-900/90 to-steel-800/80 p-5 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-blue-600/20 via-steel-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Current Value</h3>
            <div className="text-3xl font-bold">₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center mt-2 ${isNegative ? "text-red-400" : "text-green-400"}`}>
              {isNegative ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
              <span>{percentageChange}%</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-amber-900/80 via-gray-900/90 to-bronze-800/80 p-5 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-amber-600/20 via-bronze-500/10 to-gray-500/20"></div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Portfolio Performance (Last 15 Days)</h3>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#4b5563" padding={{ left: 10, right: 10 }} />
                <YAxis
                  stroke="#4b5563"
                  tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                  domain={["dataMin", "dataMax"]}
                  padding={{ top: 10, bottom: 10 }}
                  tick={{ dx: -5, fill: "#4b5563" }}
                  tickMargin={10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }}
                  formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
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
                <Zap className="h-4 w-4 mr-2 text-yellow-400" /> AI Recommendations
              </h3>
            </div>
            <div className="flex space-x-2 mb-4">
              {aiRecommendations.map((rec, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    activeTab === index ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {rec.title}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 ${activeTab === index ? "block" : "hidden"}`}
                >
                  <p className="text-sm text-gray-400">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-11/12 max-w-3xl relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
            <h4 className="text-lg font-medium text-white mb-4">{aiRecommendations[activeTab].title}</h4>
            <p className="text-gray-300 mb-2"><strong>Gemini Insight:</strong> {modalContent.suggestion}</p>
            <p className="text-gray-400 mb-4"><strong>Detailed Steps (Hugging Face):</strong> {modalContent.detailedSuggestion}</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 0 ? (
                  <BarChart data={modalContent.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#4b5563" />
                    <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }}
                      formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                    />
                    <Bar dataKey="current" fill="#8b5cf6" name="Current" />
                    <Bar dataKey="suggested" fill="#f43f5e" name="Suggested" />
                  </BarChart>
                ) : activeTab === 1 ? (
                  <LineChart data={modalContent.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#4b5563" />
                    <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }}
                      formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} name="Past" />
                    <Line type="monotone" dataKey="predicted" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={modalContent.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {modalContent.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.risk === "High" ? "#f43f5e" : entry.risk === "Medium" ? "#facc15" : "#22c55e"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }}
                      formatter={(value, name, props) => [`${props.payload.risk} Risk`, name]}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 p-5 rounded-xl mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Portfolio Performance (Last 12 Months)</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#4b5563" />
              <YAxis stroke="#4b5563" tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e2d", borderColor: "#374151", borderRadius: "0.5rem" }}
                formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden mt-6">
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Portfolio Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Net Qty</th>
                  <th className="pb-3 font-medium">Avg Price</th>
                  <th className="pb-3 font-medium">LTP</th>
                  <th className="pb-3 font-medium">Current Value</th>
                  <th className="pb-3 font-medium">Overall P&L</th>
                  <th className="pb-3 font-medium">Overall %</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.map((stock, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-medium">{stock.symbol}</td>
                    <td className="py-3">{stock.netQty}</td>
                    <td className="py-3">₹{stock.avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3">₹{stock.ltp.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3">₹{stock.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className={`py-3 ${stock.overallPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.overallPL >= 0 ? "+" : ""}
                      {stock.overallPL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 ${stock.overallPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.overallPercentage >= 0 ? "+" : ""}
                      {stock.overallPercentage.toFixed(2)}%
                    </td>
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