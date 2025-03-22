import React, { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../Components/ui/card";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../Components/ui/dialog";

const BASE_URL = "http://localhost:3000/investment";

const StockApp = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [currentStock, setCurrentStock] = useState({
    symbol: "",
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    salePrice: 0,
    saleDate: "",
  });
  const [stats, setStats] = useState({
    active: { totalInvestment: 0, currentValue: 0, unrealizedPL: 0, numberOfStocks: 0 },
    sold: { totalInvestment: 0, totalReturns: 0, realizedPL: 0, shortTermGains: 0, longTermGains: 0, numberOfStocks: 0 },
  });

  useEffect(() => {
    if (token) fetchInvestments();
  }, [token]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(BASE_URL, { headers: { "x-access-token": token } });
      setInvestments(response.data.stocks);
      calculateStats(response.data.stocks);
    } catch (error) {
      setError("Failed to fetch investments");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (stocks) => {
    const activeStats = { totalInvestment: 0, currentValue: 0, unrealizedPL: 0, numberOfStocks: 0 };
    const soldStats = { totalInvestment: 0, totalReturns: 0, realizedPL: 0, shortTermGains: 0, longTermGains: 0, numberOfStocks: 0 };

    stocks.forEach(stock => {
      if (!stock.sold) {
        activeStats.numberOfStocks++;
        activeStats.totalInvestment += stock.purchasePrice * stock.quantity;
        activeStats.currentValue += stock.currentPrice * stock.quantity;
        activeStats.unrealizedPL += (stock.currentPrice - stock.purchasePrice) * stock.quantity;
      } else {
        soldStats.numberOfStocks++;
        soldStats.totalInvestment += stock.purchasePrice * stock.quantity;
        soldStats.totalReturns += stock.salePrice * stock.quantity;
        soldStats.realizedPL += stock.capitalGains || 0;
        soldStats.shortTermGains += stock.shortTermCapitalGains || 0;
        soldStats.longTermGains += stock.longTermCapitalGains || 0;
      }
    });

    setStats({ active: activeStats, sold: soldStats });
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 1) {
      try {
        const response = await axios.get(`${BASE_URL}/search?q=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        setError("Failed to fetch suggestions");
      }
    } else {
      setSuggestions([]);
    }
  };

  const refreshPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`${BASE_URL}/refresh`, {}, { headers: { "x-access-token": token } });
      setInvestments(response.data.stocks);
      calculateStats(response.data.stocks);
    } catch (error) {
      setError("Failed to refresh prices");
    } finally {
      setLoading(false);
    }
  };

  const handleStockAction = async (action) => {
    try {
      setLoading(true);
      const endpoint = action === "sell" ? "sellStock" : "addStock";
      const response = await axios.post(`${BASE_URL}/${endpoint}`, currentStock, { headers: { "x-access-token": token } });
      setInvestments(response.data.stocks);
      calculateStats(response.data.stocks);
      setShowModal(false);
      setSuggestions([]);
      setQuery("");
    } catch (error) {
      setError(`Failed to ${action} stock`);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const activeStocks = investments.filter(stock => !stock.sold);
  const soldStocks = investments.filter(stock => stock.sold);

  if (loading && investments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-xl font-semibold bg-white p-6 rounded-2xl shadow-md">Loading your portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Portfolio Tracker</h1>
          <Button
            onClick={refreshPrices}
            className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white rounded-xl py-2.5 px-6 flex items-center transition-all duration-300 shadow-md hover:shadow-xl"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Prices
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activeTab === "active" ? (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹{stats.active.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-green-700 uppercase tracking-wide">Current Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹{stats.active.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Unrealized P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center justify-center ${stats.active.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.active.unrealizedPL >= 0 ? <TrendingUp className="w-6 h-6 mr-2" /> : <TrendingDown className="w-6 h-6 mr-2" />}
                    ₹{Math.abs(stats.active.unrealizedPL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.active.numberOfStocks}</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Realized P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center justify-center ${stats.sold.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.sold.realizedPL >= 0 ? <TrendingUp className="w-6 h-6 mr-2" /> : <TrendingDown className="w-6 h-6 mr-2" />}
                    ₹{Math.abs(stats.sold.realizedPL).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Short Term Gains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹{stats.sold.shortTermGains.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-green-700 uppercase tracking-wide">Long Term Gains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">₹{stats.sold.longTermGains.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Closed Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.sold.numberOfStocks}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search and Error */}
        <div className="mb-12">
          <div className="relative max-w-md mx-auto mb-6">
            <Input
              type="text"
              placeholder="Search stocks (e.g., TCS, RELIANCE)"
              value={query}
              onChange={handleSearch}
              className="border border-gray-300 rounded-xl bg-white py-3 px-5 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-900 placeholder-gray-400"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-64 overflow-auto animate-in fade-in-0 zoom-in-95 duration-300">
                {suggestions.map((stock) => (
                  <li
                    key={stock.Symbol}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
                    onClick={() => {
                      setCurrentStock({ 
                        symbol: stock.Symbol,
                        quantity: 0,
                        purchasePrice: 0,
                        purchaseDate: new Date().toISOString().split('T')[0]
                      });
                      setShowModal(true);
                      setSuggestions([]);
                      setQuery("");
                    }}
                  >
                    <div className="font-semibold text-gray-900">{stock["Company Name"]}</div>
                    <div className="text-sm text-gray-500">{stock.Symbol}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <Alert className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 shadow-md animate-in fade-in-0 duration-300 max-w-md mx-auto">
              <AlertDescription className="text-red-600 font-semibold text-center">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-10">
            <button
              onClick={() => setActiveTab("active")}
              className={`py-4 px-4 border-b-2 font-semibold text-lg transition-all duration-300 ${
                activeTab === "active"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-300 hover:bg-gray-50"
              } rounded-t-xl`}
            >
              Active Investments ({activeStocks.length})
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`py-4 px-4 border-b-2 font-semibold text-lg transition-all duration-300 ${
                activeTab === "sold"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-500 hover:border-blue-300 hover:bg-gray-50"
              } rounded-t-xl`}
            >
              Sold Investments ({soldStocks.length})
            </button>
          </nav>
        </div>

        {/* Stock Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
          {(activeTab === "active" ? activeStocks : soldStocks).map((stock) => (
            <div key={stock.symbol} className="p-6 hover:bg-gray-50 transition-all duration-300">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                    activeTab === "active" ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-gray-500 to-gray-600"
                  }`}>
                    {stock.stockName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{stock.stockName}</h3>
                    <p className="text-sm text-gray-500 truncate">{stock.symbol}</p>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{activeTab === "active" ? "Current Price" : "Sale Price"}</p>
                  <p className="text-base font-semibold text-gray-900">
                    ₹{(activeTab === "active" ? stock.currentPrice : stock.salePrice)?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || "Updating..."}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Quantity</p>
                  <p className="text-base font-semibold text-gray-900">{stock.quantity}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Purchase Price</p>
                  <p className="text-base font-semibold text-gray-900">₹{stock.purchasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="col-span-2 flex justify-end space-x-3">
                  {activeTab === "active" ? (
                    <>
                      <Button
                        onClick={() => {
                          setCurrentStock({
                            symbol: stock.symbol,
                            salePrice: stock.currentPrice,
                            saleDate: new Date().toISOString().split('T')[0]
                          });
                          setShowModal(true);
                        }}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm px-4 py-2 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Sell
                      </Button>
                      <Button
                        onClick={() => {
                          setCurrentStock({
                            symbol: stock.symbol,
                            quantity: 0,
                            purchasePrice: stock.currentPrice,
                            purchaseDate: new Date().toISOString().split('T')[0]
                          });
                          setShowModal(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm px-4 py-2 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Buy More
                      </Button>
                    </>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Profit/Loss</p>
                      <p className={`text-base font-semibold ${stock.capitalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{stock.capitalGains?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(activeTab === "active" ? activeStocks : soldStocks).length === 0 && (
            <div className="p-12 text-center bg-white">
              <p className="text-gray-500 text-lg font-medium mb-6">
                {activeTab === "active" 
                  ? "No active investments yet. Search above to start building your portfolio!"
                  : "No sold investments yet. Keep trading to see your history here!"}
              </p>
              {activeTab === "active" && (
                <Button
                  onClick={() => setQuery("")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 px-6 transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Start Investing
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                {currentStock.salePrice ? "Sell Stock" : "Add Stock"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              {!currentStock.salePrice && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={currentStock.quantity}
                      onChange={(e) => setCurrentStock({ ...currentStock, quantity: e.target.value })}
                      className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Purchase Price (₹)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={currentStock.purchasePrice}
                      onChange={(e) => setCurrentStock({ ...currentStock, purchasePrice: e.target.value })}
                      className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter purchase price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={currentStock.purchaseDate}
                      onChange={(e) => setCurrentStock({ ...currentStock, purchaseDate: e.target.value })}
                      className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-900"
                    />
                  </div>
                </>
              )}
              {currentStock.salePrice && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sale Price (₹)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={currentStock.salePrice}
                      onChange={(e) => setCurrentStock({ ...currentStock, salePrice: e.target.value })}
                      className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="Enter sale price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saleDate" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sale Date</Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={currentStock.saleDate}
                      onChange={(e) => setCurrentStock({ ...currentStock, saleDate: e.target.value })}
                      className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-900"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="mt-8 flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setSuggestions([]);
                  setQuery("");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-2.5 px-6 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleStockAction(currentStock.salePrice ? "sell" : "add")}
                className={`${
                  currentStock.salePrice 
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                } text-white rounded-xl py-2.5 px-6 transition-all duration-300 shadow-md hover:shadow-xl`}
                disabled={loading}
              >
                {loading ? "Processing..." : currentStock.salePrice ? "Sell" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StockApp;