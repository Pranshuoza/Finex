"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Zap,
  PieChart,
  BarChart4,
  FileText,
  Download,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lightbulb,
} from "lucide-react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Progress } from "../../Components/ui/progress";
import { Badge } from "../../Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../Components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../Components/ui/accordian";

// Mock API calls for demo purposes
const mockApiCall = (endpoint, data = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: { endpoint, data } });
    }, 1000);
  });
};

// AI Tax Recommendations
const generateTaxRecommendations = (taxData) => {
  if (!taxData) return [];

  const recommendations = [];

  // LTCG vs STCG recommendation
  if (taxData.stcgTax > 5000 && taxData.taxRate > 0.15) {
    recommendations.push({
      title: "Optimize Short-Term Capital Gains",
      description:
        "Consider holding investments for over a year to benefit from lower long-term capital gains tax rates.",
      impact: "Reduce tax liability on short-term gains.",
      priority: "High",
      icon: FileText,
    });
  }

  // Tax-saving investments recommendation
  if (taxData.incomeTax > 50000) {
    recommendations.push({
      title: "Invest in Tax-Saving Instruments",
      description:
        "Utilize Section 80C to invest in ELSS, PPF, or NSC to reduce taxable income.",
      impact: "Save up to ₹1.5 lakh in taxable income.",
      priority: "High",
      icon: FileText,
    });
  }

  // Home loan recommendation
  if (taxData.taxRate >= 0.2) {
    recommendations.push({
      title: "Home Loan Interest Deduction",
      description:
        "Claim deductions on home loan interest under Section 24(b) up to ₹2 lakh annually.",
      impact: "Significant tax savings for homeowners.",
      priority: "Medium",
      icon: FileText,
    });
  }

  // Dividend strategy
  if (taxData.dividendTax > 10000) {
    recommendations.push({
      title: "Dividend Reinvestment Plan",
      description:
        "Opt for dividend reinvestment plans to defer tax liability and grow investments.",
      impact: "Reduce immediate tax burden on dividends.",
      priority: "Medium",
      icon: FileText,
    });
  }

  // Health insurance recommendation
  recommendations.push({
    title: "Health Insurance Deduction",
    description:
      "Invest in health insurance to claim deduction under Section 80D up to ₹25,000 for self and family, plus ₹50,000 for parents.",
    impact: `Save up to ₹${Math.round(
      (75000 * taxData.taxRate) / 100
    )} annually.`,
    priority: "Medium",
    icon: FileText,
  });

  return recommendations;
};

export default function TaxCalculator() {
  const [userId, setUserId] = useState("user123");
  const [taxYear, setTaxYear] = useState("2024");
  const [userIncome, setUserIncome] = useState(1200000);
  const [longTermCapitalGains, setLongTermCapitalGains] = useState(200000);
  const [shortTermCapitalGains, setShortTermCapitalGains] = useState(150000);
  const [dividendIncome, setDividendIncome] = useState(50000);
  const [taxResult, setTaxResult] = useState(null);
  const [taxRecords, setTaxRecords] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFetchingRecords, setIsFetchingRecords] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState("calculator");

  useEffect(() => {
    const fetchTaxRecords = async () => {
      setIsFetchingRecords(true);
      const response = await mockApiCall(`/tax-records/${userId}`);
      setTaxRecords(response.data);
      setIsFetchingRecords(false);
    };

    fetchTaxRecords();
  }, [userId]);

  const calculateTax = async (e) => {
    e.preventDefault();
    setIsCalculating(true);

    const taxData = {
      income: userIncome,
      ltcg: longTermCapitalGains,
      stcg: shortTermCapitalGains,
      dividends: dividendIncome,
    };

    const response = await mockApiCall("/calculate-tax", taxData);
    setTaxResult(response.data);
    setRecommendations(generateTaxRecommendations(response.data));
    setIsCalculating(false);
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-900 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 lg:mb-0">
          Tax Calculator & AI Recommendations
        </h1>
      </div>

      <Tabs
        defaultValue="calculator"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full bg-white/5 p-1 rounded-lg mb-6">
          <TabsTrigger
            value="calculator"
            className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Tax Calculator
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
          >
            <Zap className="h-4 w-4 mr-2" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
          >
            <FileText className="h-4 w-4 mr-2" />
            Tax History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tax Calculator Form */}
            <div className="lg:col-span-2">
              <div className="relative bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl overflow-hidden">
                <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/20 via-fuchsia-500/10 to-indigo-500/20"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <Calculator className="h-5 w-5 mr-2 text-purple-400" />
                    <h2 className="text-xl font-medium">
                      Income Tax Calculator
                    </h2>
                  </div>

                  <form onSubmit={calculateTax} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          User ID
                        </label>
                        <Input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          className="w-full bg-white/5 border-white/10 focus:border-purple-500/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Tax Year
                        </label>
                        <Select value={taxYear} onValueChange={setTaxYear}>
                          <SelectTrigger className="w-full bg-white/5 border-white/10 focus:ring-purple-500/30">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-white/10">
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm text-gray-400">
                          Annual Income
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 border-white/10">
                              <p className="text-xs">
                                Total income from salary, business, and other
                                sources
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          value={userIncome}
                          onChange={(e) =>
                            setUserIncome(Number(e.target.value))
                          }
                          className="w-full pl-9 bg-white/5 border-white/10 focus:border-purple-500/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm text-gray-400">
                            Long-Term Capital Gains
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 border-white/10">
                                <p className="text-xs">
                                  Gains from assets held for more than 1 year
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            value={longTermCapitalGains}
                            onChange={(e) =>
                              setLongTermCapitalGains(Number(e.target.value))
                            }
                            className="w-full pl-9 bg-white/5 border-white/10 focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm text-gray-400">
                            Short-Term Capital Gains
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 border-white/10">
                                <p className="text-xs">
                                  Gains from assets held for less than 1 year
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            value={shortTermCapitalGains}
                            onChange={(e) =>
                              setShortTermCapitalGains(Number(e.target.value))
                            }
                            className="w-full pl-9 bg-white/5 border-white/10 focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm text-gray-400">
                            Dividend Income
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 border-white/10">
                                <p className="text-xs">
                                  Income received as dividends from investments
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            value={dividendIncome}
                            onChange={(e) =>
                              setDividendIncome(Number(e.target.value))
                            }
                            className="w-full pl-9 bg-white/5 border-white/10 focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                      disabled={isCalculating}
                    >
                      {isCalculating ? (
                        <>
                          <div className="mr-2 h-4 w-4 rounded-full border-2 border-b-transparent animate-spin"></div>
                          Calculating...
                        </>
                      ) : (
                        "Calculate Tax"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Tax Summary */}
            <div className="lg:col-span-1">
              <div className="relative bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl overflow-hidden h-full">
                <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-indigo-500/20 via-blue-500/10 to-cyan-500/20"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    <h2 className="text-xl font-medium">Tax Summary</h2>
                  </div>

                  {taxResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Total Tax</span>
                          <span className="text-xl font-medium">
                            {formatCurrency(taxResult.currentTax)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>Effective Tax Rate</span>
                          <span>
                            {Math.round(
                              (taxResult.currentTax /
                                (userIncome +
                                  longTermCapitalGains +
                                  shortTermCapitalGains +
                                  dividendIncome)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="text-gray-400">Income Tax</span>
                            <span>{formatCurrency(taxResult.incomeTax)}</span>
                          </div>
                          <Progress
                            value={
                              (taxResult.incomeTax / taxResult.currentTax) * 100
                            }
                            className="h-2 bg-white/10"
                            indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="text-gray-400">
                              Long-Term Capital Gains Tax
                            </span>
                            <span>{formatCurrency(taxResult.ltcgTax)}</span>
                          </div>
                          <Progress
                            value={
                              (taxResult.ltcgTax / taxResult.currentTax) * 100
                            }
                            className="h-2 bg-white/10"
                            indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="text-gray-400">
                              Short-Term Capital Gains Tax
                            </span>
                            <span>{formatCurrency(taxResult.stcgTax)}</span>
                          </div>
                          <Progress
                            value={
                              (taxResult.stcgTax / taxResult.currentTax) * 100
                            }
                            className="h-2 bg-white/10"
                            indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="text-gray-400">Dividend Tax</span>
                            <span>{formatCurrency(taxResult.dividendTax)}</span>
                          </div>
                          <Progress
                            value={
                              (taxResult.dividendTax / taxResult.currentTax) *
                              100
                            }
                            className="h-2 bg-white/10"
                            indicatorClassName="bg-gradient-to-r from-yellow-500 to-amber-500"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400">Cess (4%)</span>
                          <span>
                            {formatCurrency(taxResult.currentTax * 0.04)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-medium">
                          <span>Total Payable Tax</span>
                          <span className="text-lg">
                            {formatCurrency(taxResult.currentTax * 1.04)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-white/5 hover:bg-white/10"
                          onClick={() => setActiveTab("recommendations")}
                        >
                          <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                          View Tax Saving Tips
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-white/5 hover:bg-white/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center">
                      <BarChart4 className="h-12 w-12 text-gray-600 mb-3" />
                      <p className="text-gray-400">
                        Enter your details and calculate tax to see the summary
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown */}
          {taxResult && (
            <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
              <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <PieChart className="h-5 w-5 mr-2 text-violet-400" />
                  <h2 className="text-xl font-medium">
                    Detailed Tax Breakdown
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Income Tax Calculation
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-400 text-sm">
                              Annual Income
                            </span>
                            <div className="font-medium">
                              {formatCurrency(userIncome)}
                            </div>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300">
                            {taxResult.taxRate * 100}% Tax Rate
                          </Badge>
                        </div>
                      </div>

                      <Accordion
                        type="single"
                        collapsible
                        className="bg-white/5 rounded-lg border border-white/10"
                      >
                        <AccordionItem
                          value="item-1"
                          className="border-b-white/10"
                        >
                          <AccordionTrigger className="px-3 py-2 hover:bg-white/5 hover:no-underline">
                            <div className="flex items-center">
                              <span>Income Tax Slabs</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Up to ₹2.5 Lakhs
                                </span>
                                <span>0%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  ₹2.5 Lakhs to ₹5 Lakhs
                                </span>
                                <span>5%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  ₹5 Lakhs to ₹10 Lakhs
                                </span>
                                <span>10%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  ₹10 Lakhs to ₹15 Lakhs
                                </span>
                                <span>15%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  ₹15 Lakhs to ₹20 Lakhs
                                </span>
                                <span>20%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Above ₹20 Lakhs
                                </span>
                                <span>30%</span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Capital Gains & Dividend
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">
                            Long-Term Capital Gains
                          </span>
                          <span>{formatCurrency(longTermCapitalGains)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Tax Rate</span>
                          <Badge className="bg-green-500/20 text-green-300">
                            10%
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">
                            Short-Term Capital Gains
                          </span>
                          <span>{formatCurrency(shortTermCapitalGains)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Tax Rate</span>
                          <Badge className="bg-blue-500/20 text-blue-300">
                            15%
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">
                            Dividend Income
                          </span>
                          <span>{formatCurrency(dividendIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Tax Rate</span>
                          <Badge className="bg-yellow-500/20 text-yellow-300">
                            10%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="relative bg-gradient-to-bl from-fuchsia-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-fuchsia-500/20 via-pink-500/10 to-purple-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                  <h2 className="text-xl font-medium">
                    AI Tax Saving Recommendations
                  </h2>
                </div>
                {taxResult ? (
                  <Badge className="bg-green-500/20 text-green-300">
                    Potential Savings:{" "}
                    {formatCurrency(taxResult.currentTax * 0.25)}+
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    onClick={() => setActiveTab("calculator")}
                  >
                    Calculate Tax First
                  </Button>
                )}
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations?.map((rec, index) => (
                    <div
                      key={index}
                      className="relative bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-200 overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4 mt-1">
                            <rec.icon className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium">{rec.title}</h3>
                              <Badge
                                className={`${
                                  rec.priority === "High"
                                    ? "bg-red-500/20 text-red-300"
                                    : rec.priority === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : "bg-green-500/20 text-green-300"
                                }`}
                              >
                                {rec.priority} Priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">
                              {rec.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-green-400 font-medium">
                                {rec.impact}
                              </span>
                              <Button
                                variant="link"
                                className="text-sm text-purple-400 p-0 h-auto"
                              >
                                Learn More
                                <ArrowUpRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Important Disclaimer</h4>
                        <p className="text-sm text-gray-300 mt-1">
                          These recommendations are for informational purposes
                          only and do not constitute tax advice. Please consult
                          with a qualified tax professional before making
                          financial decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : taxResult ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Generating Recommendations...
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Our AI is analyzing your tax data to provide personalized
                    recommendations for tax optimization.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <Calculator className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No Tax Data Available
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Please use the tax calculator first to receive personalized
                    AI recommendations for tax optimization.
                  </p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    onClick={() => setActiveTab("calculator")}
                  >
                    Go to Calculator
                  </Button>
                </div>
              )}
            </div>
          </div>

          {taxResult && (
            <div className="relative bg-gradient-to-bl from-blue-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl overflow-hidden">
              <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-blue-500/20 via-indigo-500/10 to-purple-500/20"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                  <h2 className="text-xl font-medium">
                    Tax Optimization Checklist
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Maximize Section 80C Deductions
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Invest in ELSS, PPF, EPF, NPS, or pay life insurance
                        premiums up to ₹1.5 lakhs.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Health Insurance Premium (Sec 80D)
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Claim deduction for health insurance premiums up to
                        ₹25,000 for self and family.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Home Loan Benefits</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Claim interest deduction up to ₹2 lakhs and principal
                        repayment under Sec 80C.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Education Loan Interest (Sec 80E)
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Claim deduction for interest paid on education loans
                        with no upper limit.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Additional NPS Contribution (Sec 80CCD)
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Claim additional deduction up to ₹50,000 for NPS
                        contributions.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm">6</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Donations (Sec 80G)</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Claim deductions for donations to approved charitable
                        organizations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="relative bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-indigo-500/20 via-blue-500/10 to-cyan-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                <h2 className="text-xl font-medium">Tax History & Records</h2>
              </div>

              {isFetchingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 rounded-full border-2 border-b-transparent border-purple-500 animate-spin"></div>
                </div>
              ) : taxRecords ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                      <div className="text-gray-400 text-sm mb-1">
                        Total Income
                      </div>
                      <div className="text-xl font-medium">
                        {formatCurrency(taxRecords.totalIncome)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                      <div className="text-gray-400 text-sm mb-1">
                        Total Tax Paid
                      </div>
                      <div className="text-xl font-medium">
                        {formatCurrency(taxRecords.totalTaxPaid)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                      <div className="text-gray-400 text-sm mb-1">
                        Total Cess Paid
                      </div>
                      <div className="text-xl font-medium">
                        {formatCurrency(taxRecords.totalCessPaid)}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                      <div className="text-gray-400 text-sm mb-1">
                        Total Amount Paid
                      </div>
                      <div className="text-xl font-medium">
                        {formatCurrency(taxRecords.totalAmountPaid)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Tax Payment History
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 font-medium text-gray-400">
                              Tax Year
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">
                              Income
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">
                              Tax Paid
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">
                              Cess Paid
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">
                              Total Paid
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxRecords.taxHistory?.map((record, index) => (
                            <tr
                              key={index}
                              className="border-b border-white/5 hover:bg-white/5"
                            >
                              <td className="py-3 px-4">{record.year}</td>
                              <td className="py-3 px-4 text-right">
                                {formatCurrency(record.income)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {formatCurrency(record.taxPaid)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {formatCurrency(record.cessPaid)}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">
                                {formatCurrency(record.totalPaid)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Tax History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No Tax Records Found
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Please enter your User ID and calculate your taxes to view
                    your tax history.
                  </p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    onClick={() => setActiveTab("calculator")}
                  >
                    Go to Calculator
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
