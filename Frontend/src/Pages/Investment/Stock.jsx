import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ChevronDown, ArrowUpRight, ArrowDownRight, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = "http://localhost:3000/stocks";

export default function Dashboard() {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [overallPL, setOverallPL] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasUpstoxToken, setHasUpstoxToken] = useState(null);

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
        console.log("Profile data:", profileData);
        if (profileData.status !== "ok" || !profileData.profile) throw new Error("Failed to fetch profile");
        setHasUpstoxToken(!!profileData.profile.upstoxAccessToken);

        if (!profileData.profile.upstoxAccessToken) {
          console.log("No Upstox token found");
          setLoading(false);
          return;
        }

        // Fetch stocks (should auto-sync if empty)
        console.log("Fetching stocks...");
        const stocksRes = await fetch(`${BASE_API_URL}/`, { headers: { "x-access-token": token } });
        if (!stocksRes.ok) {
          const errorText = await stocksRes.text();
          throw new Error(`Failed to fetch stocks: ${errorText}`);
        }
        const stocks = await stocksRes.json();
        console.log("Fetched stocks:", stocks);

        if (stocks.length === 0) {
          console.log("No stocks found after fetch - auto-sync should have occurred");
        }

        // Transform portfolio data
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

        // Fetch portfolio history
        const historyRes = await fetch(`${BASE_API_URL}/portfolio/history`, { headers: { "x-access-token": token } });
        if (!historyRes.ok) throw new Error("Failed to fetch portfolio history");
        const { daily, monthly } = await historyRes.json();
        console.log("Portfolio history:", { daily, monthly });

        setDailyData(daily.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          value: item.value,
        })));

        setMonthlyData(monthly.map((item) => ({
          name: new Date(`${item.date}-01`).toLocaleString("en-IN", { month: "short", year: "numeric" }),
          value: item.value,
        })));

        // Set AI recommendations
        const recommendations = [
          { title: "Diversify Portfolio", description: "Consider adding more banking stocks", action: "View Suggestions" },
          { title: "Potential Opportunity", description: "YESBANK showing momentum", action: "Research More" },
          { title: "Risk Alert", description: "Infra sector exposure high", action: "Rebalance" },
        ];
        setAiRecommendations(recommendations);
        console.log("AI Recommendations set:", recommendations);

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
      const res = await fetch(`${BASE_API_URL}/portfolio/sync`, { headers: { "x-access-token": token } });
      if (!res.ok) throw new Error("Failed to sync portfolio");
      const data = await res.json();
      console.log("Manual sync result:", data);

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
                  tick={{ dx: -5, fill: "#4b5563" }} // Shift ticks slightly left and ensure visibility
                  tickMargin={10} // Add space between ticks and axis line
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
              <h3 className="font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" /> AI Recommendations
              </h3>
            </div>
            <div className="space-y-4">
              {aiRecommendations.length > 0 ? (
                aiRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="relative bg-white/5 rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-all duration-200 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-white">{rec.title}</h4>
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                      <button className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center">
                        {rec.action}
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No recommendations available</p>
              )}
            </div>
          </div>
        </div>
      </div>

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