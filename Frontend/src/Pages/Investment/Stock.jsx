import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChevronDown, ArrowUpRight, Zap, Star, Search } from "lucide-react";

const BASE_API_URL = "http://localhost:3000/stocks";

export default function Dashboard() {
  const [stockData, setStockData] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [overallPL, setOverallPL] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [newStock, setNewStock] = useState({ stockName: "", symbol: "", quantity: "", purchasePrice: "" });
  const [sellStock, setSellStock] = useState({ stockId: "", quantity: "", salePrice: "" });
  const [error, setError] = useState(null); // Add error state for debugging

  // Fetch initial dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in.");

        // Portfolio History
        const historyRes = await fetch(`${BASE_API_URL}/portfolio/history`, {
          headers: { "x-access-token": token },
        });
        if (!historyRes.ok) throw new Error("Failed to fetch portfolio history");
        const historyData = await historyRes.json();
        setStockData(
          historyData.map((item) => ({
            name: new Date(item.date).toLocaleString("default", { month: "short" }),
            value: item.totalValue,
          }))
        );

        // Stocks
        const stocksRes = await fetch(`${BASE_API_URL}/`, {
          headers: { "x-access-token": token },
        });
        if (!stocksRes.ok) throw new Error("Failed to fetch stocks");
        const stocks = await stocksRes.json();
        const transformedPortfolio = stocks.map((stock) => ({
          symbol: stock.symbol,
          netQty: stock.quantity,
          avgPrice: stock.purchasePrice,
          ltp: stock.currentPrice,
          currentValue: stock.currentPrice * stock.quantity,
          dayPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
          dayPercentage: ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100,
          overallPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
          overallPercentage: ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100,
          stockId: stock._id,
          sold: stock.sold,
        }));
        setPortfolioData(transformedPortfolio.filter((stock) => !stock.sold));

        const totalInv = stocks.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
        const currValue = stocks.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
        setTotalInvestments(totalInv);
        setCurrentValue(currValue);
        setOverallPL(currValue - totalInv);

        // Monthly Spending
        const monthlyData = historyData.reduce((acc, trans) => {
          const month = new Date(trans.date).toLocaleString("default", { month: "short" });
          acc[month] = (acc[month] || 0) + trans.totalValue;
          return acc;
        }, {});
        setMonthlySpending(Object.entries(monthlyData).map(([name, amount]) => ({ name, amount })));

        // AI Recommendations (static)
        setAiRecommendations([
          { title: "Diversify Portfolio", description: "Consider adding more tech stocks", action: "View Suggestions" },
          { title: "Potential Opportunity", description: "NVDA showing strong momentum", action: "Research More" },
          { title: "Risk Alert", description: "Energy sector exposure high", action: "Rebalance" },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Upstox Login
  const handleUpstoxLogin = () => {
    window.location.href = `${BASE_API_URL}/upstox-login`;
  };

  // Search Stocks
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/search?q=${searchQuery}`, {
        headers: { "x-access-token": token },
      });
      if (!res.ok) throw new Error("Failed to search stocks");
      const results = await res.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching stocks:", error);
      setError(error.message);
    }
  };

  // Add Stock
  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/`, {
        method: "POST",
        headers: { "x-access-token": token, "Content-Type": "application/json" },
        body: JSON.stringify(newStock),
      });
      if (!res.ok) throw new Error("Failed to add stock");
      const data = await res.json();
      setPortfolioData((prev) => [
        ...prev,
        {
          symbol: data.stock.symbol,
          netQty: data.stock.quantity,
          avgPrice: data.stock.purchasePrice,
          ltp: data.stock.currentPrice,
          currentValue: data.stock.currentPrice * data.stock.quantity,
          dayPL: (data.stock.currentPrice - data.stock.purchasePrice) * data.stock.quantity,
          dayPercentage: ((data.stock.currentPrice - data.stock.purchasePrice) / data.stock.purchasePrice) * 100,
          overallPL: (data.stock.currentPrice - data.stock.purchasePrice) * data.stock.quantity,
          overallPercentage: ((data.stock.currentPrice - data.stock.purchasePrice) / data.stock.purchasePrice) * 100,
          stockId: data.stock._id,
          sold: false,
        },
      ]);
      setNewStock({ stockName: "", symbol: "", quantity: "", purchasePrice: "" });
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding stock:", error);
      setError(error.message);
    }
  };

  // Sell Stock
  const handleSellStock = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/sell`, {
        method: "POST",
        headers: { "x-access-token": token, "Content-Type": "application/json" },
        body: JSON.stringify(sellStock),
      });
      if (!res.ok) throw new Error("Failed to sell stock");
      const data = await res.json();
      setPortfolioData((prev) =>
        prev
          .map((stock) =>
            stock.stockId === data.stock._id
              ? { ...stock, netQty: stock.netQty - data.transaction.quantity, sold: data.stock.sold }
              : stock
          )
          .filter((stock) => !stock.sold)
      );
      setSellStock({ stockId: "", quantity: "", salePrice: "" });
    } catch (error) {
      console.error("Error selling stock:", error);
      setError(error.message);
    }
  };

  // Sync Portfolio
  const handleSyncPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/portfolio/sync`, {
        headers: { "x-access-token": token },
      });
      if (!res.ok) throw new Error("Failed to sync portfolio");
      const data = await res.json();
      console.log(data.message);
      const stocksRes = await fetch(`${BASE_API_URL}/`, {
        headers: { "x-access-token": token },
      });
      if (!stocksRes.ok) throw new Error("Failed to refresh stocks after sync");
      const stocks = await stocksRes.json();
      const transformedPortfolio = stocks.map((stock) => ({
        symbol: stock.symbol,
        netQty: stock.quantity,
        avgPrice: stock.purchasePrice,
        ltp: stock.currentPrice,
        currentValue: stock.currentPrice * stock.quantity,
        dayPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
        dayPercentage: ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100,
        overallPL: (stock.currentPrice - stock.purchasePrice) * stock.quantity,
        overallPercentage: ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100,
        stockId: stock._id,
        sold: stock.sold,
      }));
      setPortfolioData(transformedPortfolio.filter((stock) => !stock.sold));
    } catch (error) {
      console.error("Error syncing portfolio:", error);
      setError(error.message);
    }
  };

  if (loading) return <div className="p-4 lg:p-6 text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 lg:p-6 text-red-400">{error}</div>;

  return (
    <div className="p-4 lg:p-6">
      {/* Upstox Login and Sync Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleUpstoxLogin}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Connect to Upstox
        </button>
        <button
          onClick={handleSyncPortfolio}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sync Portfolio
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-bl from-slate-800/80 via-gray-900/90 to-stone-800/80 p-5 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-slate-500/20 via-gray-500/10 to-stone-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Total Investments</h3>
            <div className="text-3xl font-bold">${totalInvestments.toFixed(2)}</div>
            <div className="flex items-center mt-2 text-green-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+2.4%</span>
              <span className="text-gray-400 text-sm ml-2">this month</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-blue-900/80 via-gray-900/90 to-steel-800/80 p-5 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-blue-600/20 via-steel-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Current Value</h3>
            <div className="text-3xl font-bold">${currentValue.toFixed(2)}</div>
            <div className="flex items-center mt-2 text-green-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{((currentValue - totalInvestments) / totalInvestments * 100).toFixed(1)}%</span>
              <span className="text-gray-400 text-sm ml-2">overall</span>
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-bl from-amber-900/80 via-gray-900/90 to-bronze-800/80 p-5 rounded-xl overflow-hidden group">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-amber-600/20 via-bronze-500/10 to-gray-500/20"></div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-medium mb-1">Overall P&L</h3>
            <div className="text-3xl font-bold">${overallPL.toFixed(2)}</div>
            <div className="flex items-center mt-2 text-green-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{((currentValue - totalInvestments) / totalInvestments * 100).toFixed(1)}%</span>
              <span className="text-gray-400 text-sm ml-2">all time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Stock */}
      <div className="mt-6 bg-gray-900 p-5 rounded-xl">
        <form onSubmit={handleSearch} className="flex items-center mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks..."
              className="w-full p-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button type="submit" className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Search
          </button>
        </form>
        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((stock) => (
              <div key={stock.symbol} className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                <span>{stock.stockName} ({stock.symbol})</span>
                <button
                  onClick={() => setNewStock({ ...newStock, stockName: stock.stockName, symbol: stock.symbol })}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-gray-900 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Portfolio Performance</h3>
            <div className="flex items-center space-x-2">
              {["1D", "1W", "1M", "1Y", "All"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    period === "1M" ? "bg-purple-600 text-purple-200" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e2d",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
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
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                AI Recommendations
              </h3>
            </div>
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spending */}
      <div className="bg-gray-900 p-5 rounded-xl mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Monthly Spending</h3>
          <div className="relative">
            <button className="flex items-center space-x-1 bg-gray-800 px-3 py-1.5 rounded-lg text-sm text-gray-300">
              <span>Last 30 days</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#4b5563" />
              <YAxis stroke="#4b5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2d",
                  borderColor: "#374151",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Spending"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden mt-6">
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Portfolio Holdings</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</button>
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
                  <th className="pb-3 font-medium">Day P&L</th>
                  <th className="pb-3 font-medium">Day %</th>
                  <th className="pb-3 font-medium">Overall P&L</th>
                  <th className="pb-3 font-medium">Overall %</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.map((stock, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-medium">{stock.symbol}</td>
                    <td className="py-3">{stock.netQty}</td>
                    <td className="py-3">${stock.avgPrice.toFixed(2)}</td>
                    <td className="py-3">${stock.ltp.toFixed(2)}</td>
                    <td className="py-3">${stock.currentValue.toFixed(2)}</td>
                    <td className={`py-3 ${stock.dayPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.dayPL >= 0 ? "+" : ""}{stock.dayPL.toFixed(2)}
                    </td>
                    <td className={`py-3 ${stock.dayPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.dayPercentage >= 0 ? "+" : ""}{stock.dayPercentage.toFixed(2)}%
                    </td>
                    <td className={`py-3 ${stock.overallPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.overallPL >= 0 ? "+" : ""}{stock.overallPL.toFixed(2)}
                    </td>
                    <td className={`py-3 ${stock.overallPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.overallPercentage >= 0 ? "+" : ""}{stock.overallPercentage.toFixed(2)}%
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