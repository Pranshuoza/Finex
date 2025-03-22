import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../../Components/ui/card";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Transactions from "../Transaction/Transactions";
import { 
  BarChart, Bar, LineChart, Line, PieChart, ComposedChart, RadarChart, Pie, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, } from 'recharts';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../Components/ui/select";

const AccountDetails = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [timeline, setTimeline] = useState('1month');

  useEffect(() => {
    if (!accountId) {
      setError("No account ID provided in the URL");
      setLoading(false);
      return;
    }
    fetchAccountAndTransactions();
  }, [accountId]);

  const fetchAccountAndTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: No token provided");
        setLoading(false);
        return;
      }

      const [accountRes, transactionsRes] = await Promise.all([
        axios.get(`http://localhost:3000/account/get/${accountId}`, {
          headers: { "x-access-token": token },
        }),
        axios.get("http://localhost:3000/transaction", {
          headers: { "x-access-token": token },
        }),
      ]);

      setAccount(accountRes.data);
      const accountTransactions = Array.isArray(transactionsRes.data.transactions) 
        ? transactionsRes.data.transactions.filter(t => t.accountId === accountId)
        : [];
      setTransactions(accountTransactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || "Error fetching account or transactions");
      setLoading(false);
    }
  };

  const calculateAnalytics = (transactions, period) => {
    const now = new Date();
    const periods = {
      '1month': 30,
      '3month': 90,
      '6month': 180,
      '1year': 365,
    };
    const days = periods[period] || 30;
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - days);

    const filtered = transactions.filter(t => new Date(t.date) >= cutoff);
    const data = [];
    const categoryBreakdown = { income: {}, expense: {} };

    const startDate = new Date(cutoff);
    const endDate = new Date(now);
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const weekEnd = new Date(d);
      weekEnd.setDate(d.getDate() + 6);
      if (weekEnd > now) weekEnd.setTime(now.getTime());

      const weekIncome = filtered
        .filter(t => t.type === "income" && new Date(t.date) >= d && new Date(t.date) <= weekEnd)
        .reduce((sum, t) => {
          const amount = parseFloat(t.amount) || 0;
          categoryBreakdown.income[t.categoryName] = (categoryBreakdown.income[t.categoryName] || 0) + amount;
          return sum + amount;
        }, 0);
      const weekExpense = filtered
        .filter(t => t.type === "expense" && new Date(t.date) >= d && new Date(t.date) <= weekEnd)
        .reduce((sum, t) => {
          const amount = parseFloat(t.amount) || 0;
          categoryBreakdown.expense[t.categoryName] = (categoryBreakdown.expense[t.categoryName] || 0) + amount;
          return sum + amount;
        }, 0);

      data.push({
        name: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        income: weekIncome,
        expense: weekExpense,
      });
      if (weekEnd >= now) break;
    }

    const pieData = [
      ...Object.entries(categoryBreakdown.income).map(([name, value]) => ({ name, value, type: 'income' })),
      ...Object.entries(categoryBreakdown.expense).map(([name, value]) => ({ name, value, type: 'expense' })),
    ];

    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
    const avgIncome = totalIncome / data.length || 0;
    const avgExpense = totalExpense / data.length || 0;

    return { data, pieData, totalIncome, totalExpense, avgIncome, avgExpense };
  };

  const getChartColors = (type) => {
    return type === 'income' ? '#22c55e' : '#ef4444';
  };

  const renderChart = () => {
    const { data, pieData } = calculateAnalytics(transactions, timeline);
    const commonProps = {
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} {...commonProps}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} fontFamily="Roboto" />
              <YAxis stroke="#6b7280" fontSize={12} fontFamily="Roboto" tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderRadius: '8px', border: 'none', color: '#fff', padding: '10px' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend wrapperStyle={{ fontSize: '14px', fontFamily: 'Roboto', color: '#1f2937', paddingTop: '10px' }} />
              <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} barSize={20} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} {...commonProps}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} fontFamily="Roboto" />
              <YAxis stroke="#6b7280" fontSize={12} fontFamily="Roboto" tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderRadius: '8px', border: 'none', color: '#fff', padding: '10px' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend wrapperStyle={{ fontSize: '14px', fontFamily: 'Roboto', color: '#1f2937', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} {...commonProps}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} fontFamily="Roboto" />
              <YAxis stroke="#6b7280" fontSize={12} fontFamily="Roboto" tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderRadius: '8px', border: 'none', color: '#fff', padding: '10px' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend wrapperStyle={{ fontSize: '14px', fontFamily: 'Roboto', color: '#1f2937', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="rgba(34, 197, 94, 0.3)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="rgba(239, 68, 68, 0.3)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        );
        case 'ComposedChart':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} {...commonProps}>
                {/* X and Y Axes */}
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  fontFamily="Roboto" 
                  tickLine={false} 
                  axisLine={{ stroke: "#d1d5db" }} 
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  fontFamily="Roboto" 
                  tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
                  tickLine={false} 
                  axisLine={{ stroke: "#d1d5db" }} 
                />
        
                {/* Tooltip and Legend */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    fontFamily: "Roboto",
                  }}
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Legend 
                  wrapperStyle={{
                    fontSize: '14px',
                    fontFamily: 'Roboto',
                    color: '#1f2937',
                    paddingTop: '10px'
                  }} 
                />
        
                {/* Bar Charts */}
                <Bar 
                  dataKey="income" 
                  fill="#22c55e" 
                  radius={[8, 8, 0, 0]} 
                  barSize={24} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="#ef4444" 
                  radius={[8, 8, 0, 0]} 
                  barSize={24} 
                />
        
                {/* Line Charts */}
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#22c55e" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  fill="rgba(34, 197, 94, 0.3)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="rgba(239, 68, 68, 0.3)"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          );        
        case 'radarChart':
          return (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} {...commonProps}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  fontFamily="Roboto" 
                />
                <PolarRadiusAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  fontFamily="Roboto" 
                  tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    padding: '10px'
                  }}
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Legend 
                  wrapperStyle={{
                    fontSize: '14px',
                    fontFamily: 'Roboto',
                    color: '#1f2937',
                    paddingTop: '10px'
                  }} 
                />
                <Radar 
                  dataKey="income" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          );        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart {...commonProps}>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                innerRadius={0} 
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChartColors(entry.type)} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', color: '#ffffff', padding: '10px' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend wrapperStyle={{ fontSize: '14px', fontFamily: 'Roboto', color: '#1f2937', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart {...commonProps}>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                innerRadius={60} 
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChartColors(entry.type)} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', color: '#ffffff', padding: '10px' }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend wrapperStyle={{ fontSize: '14px', fontFamily: 'Roboto', color: '#ffffff', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <BarChart data={data} {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-xl font-semibold bg-white p-6 rounded-2xl shadow-md">Loading account details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-md animate-in fade-in-0 duration-300 max-w-md">
          <AlertDescription className="text-red-600 font-semibold text-center">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-10 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-md max-w-md">
          No account found.
        </div>
      </div>
    );
  }

  const { totalIncome, totalExpense, avgIncome, avgExpense } = calculateAnalytics(transactions, timeline);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Account Details</h1>
        </div>

        {/* Account Info */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div 
                className={`w-4 h-16 rounded-full ${
                  account.accountType === "savings" ? "bg-gradient-to-b from-blue-600 to-blue-800" : "bg-gradient-to-b from-purple-600 to-purple-800"
                } shadow-md`}
              />
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{account.accountName}</h2>
                    <p className="text-sm text-gray-500 capitalize font-medium">{account.accountType}</p>
                  </div>
                  {account.isDefault && (
                    <span className="bg-green-100 text-green-700 text-xs px-4 py-1.5 rounded-full font-semibold shadow-sm">
                      Default Account
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Account Type</p>
                    <p className="text-2xl font-semibold text-gray-900 capitalize">{account.accountType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Default</p>
                    <p className="text-2xl font-semibold text-gray-900">{account.isDefault ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Transaction Analytics</h3>
            <div className="flex space-x-4">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-40 bg-white border border-gray-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <SelectItem value="bar" className="text-gray-900 hover:bg-gray-100">Bar</SelectItem>
                  <SelectItem value="line" className="text-gray-900 hover:bg-gray-100">Line</SelectItem>
                  <SelectItem value="area" className="text-gray-900 hover:bg-gray-100">Area</SelectItem>
                  <SelectItem value="ComposedChart" className="text-gray-900 hover:bg-gray-100">Composed Chart</SelectItem>
                  <SelectItem value="radarChart" className="text-gray-900 hover:bg-gray-100">Radar Chart</SelectItem>
                  <SelectItem value="pie" className="text-gray-900 hover:bg-gray-100">Pie</SelectItem>
                  <SelectItem value="doughnut" className="text-gray-900 hover:bg-gray-100">Doughnut</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger className="w-40 bg-white border border-gray-300 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900">
                  <SelectValue placeholder="Timeline" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <SelectItem value="1month" className="text-gray-900 hover:bg-gray-100">1 Month</SelectItem>
                  <SelectItem value="3month" className="text-gray-900 hover:bg-gray-100">3 Months</SelectItem>
                  <SelectItem value="6month" className="text-gray-900 hover:bg-gray-100">6 Months</SelectItem>
                  <SelectItem value="1year" className="text-gray-900 hover:bg-gray-100">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 h-96 transition-all duration-300 hover:shadow-xl overflow-hidden">
            {renderChart()}
          </div>
          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-md p-4">
              <CardContent className="p-2 text-center">
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Income</p>
                <p className="text-xl font-bold text-green-800">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-md p-4">
              <CardContent className="p-2 text-center">
                <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Total Expense</p>
                <p className="text-xl font-bold text-red-800">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-md p-4">
              <CardContent className="p-2 text-center">
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Avg Income</p>
                <p className="text-xl font-bold text-blue-800">₹{avgIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-md p-4">
              <CardContent className="p-2 text-center">
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Avg Expense</p>
                <p className="text-xl font-bold text-purple-800">₹{avgExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Recent Transactions</h3>
          <Transactions accountId={accountId} onTransactionChange={fetchAccountAndTransactions} />
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;