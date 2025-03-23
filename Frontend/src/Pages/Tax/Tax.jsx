import { useState, useEffect } from "react";
import {
  Calculator,
  FileText,
  Download,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Progress } from "../../Components/ui/progress";
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

// API base URL
const BASE_URL = "http://localhost:3000/tax";

// API calls with token
const fetchTaxRecords = async () => {
  const token = localStorage.getItem("x-access-token");
  const response = await fetch(`${BASE_URL}/records`, {
    headers: { "x-access-token": token },
  });
  return response.json();
};

const calculateTax = async (taxData) => {
  const token = localStorage.getItem("x-access-token");
  const response = await fetch(`${BASE_URL}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify(taxData),
  });
  return response.json();
};

// Mock Gemini SDK for tax-saving suggestions
const fetchGeminiTaxSuggestion = async (taxData) => {
  const { userIncome, longTermCapitalGains, shortTermCapitalGains, dividendIncome, taxYear } = taxData;
  const totalIncome = userIncome + longTermCapitalGains + shortTermCapitalGains + dividendIncome;

  // Structured prompt for Gemini
  const prompt = `
    You are a tax expert specializing in Indian tax laws for the financial year ${taxYear}. I am providing you with a user's financial details, and I need you to suggest specific, actionable ways they can save tax based on their income and investments. Please consider all applicable sections of the Income Tax Act, such as Section 80C, 80D, 54, and others, and provide detailed recommendations tailored to their financial situation. Ensure the suggestions are practical and legally compliant.

    Here are the user's financial details:
    - Annual Income: ₹${userIncome.toLocaleString("en-IN")}
    - Long-Term Capital Gains (LTCG): ₹${longTermCapitalGains.toLocaleString("en-IN")}
    - Short-Term Capital Gains (STCG): ₹${shortTermCapitalGains.toLocaleString("en-IN")}
    - Dividend Income: ₹${dividendIncome.toLocaleString("en-IN")}
    - Total Income: ₹${totalIncome.toLocaleString("en-IN")}

    Based on this data, please provide a detailed list of tax-saving strategies, including:
    1. Specific investment options or deductions they can claim (e.g., ELSS, PPF, NSC, etc.).
    2. Ways to optimize capital gains tax (e.g., loss harvesting, reinvestment options).
    3. Any other relevant tax-saving opportunities specific to their income profile.
    4. Estimated tax savings where possible.

    Format your response as a concise, readable list with clear explanations.
  `;

  return new Promise((resolve) => {
    setTimeout(() => {
      let suggestion = "";

      if (userIncome > 1000000) {
        suggestion += "1. Section 80C Deduction: Invest up to ₹1.5 lakh in Equity-Linked Savings Schemes (ELSS) to reduce taxable income. ELSS offers tax benefits and potential equity returns. Estimated savings: ₹31,200 (assuming 20% tax slab).\n";
        suggestion += "2. Section 80D: Purchase health insurance for self and family (up to ₹25,000 for self, ₹50,000 for senior citizen parents) to claim additional deductions. Estimated savings: ₹5,200-₹10,400.\n";
      } else {
        suggestion += "1. Section 80C Deduction: Maximize your ₹1.5 lakh limit with Public Provident Fund (PPF) or National Savings Certificate (NSC) for safe, tax-free returns. Estimated savings: ₹15,600 (assuming 10% tax slab).\n";
      }

      if (longTermCapitalGains > 100000) {
        suggestion += `2. LTCG Optimization: Offset LTCG by booking capital losses from underperforming assets (tax loss harvesting). Alternatively, reinvest gains in residential property under Section 54 (exemption up to ₹2 crore if reinvested). Estimated savings: ₹${(longTermCapitalGains * 0.1).toLocaleString("en-IN")} (10% LTCG tax).\n`;
      } else if (shortTermCapitalGains > 0) {
        suggestion += `2. STCG Strategy: Hold assets for over 1 year to convert STCG (taxed at 15%) into LTCG (taxed at 10% with ₹1 lakh exemption). Estimated savings: ₹${(shortTermCapitalGains * 0.05).toLocaleString("en-IN")} (difference between 15% and 10%).\n`;
      } else {
        suggestion += "2. Capital Gains: No immediate action needed; maintain current strategy as capital gains are minimal.\n";
      }

      suggestion +=`3. Dividend Income: Since dividend income is tax-free up to ₹10 lakh under Section 115BBDA (for FY ${taxYear}), no additional tax-saving action is required unless it exceeds this limit.\n`;
      suggestion += `4. Other Options: Consider National Pension System (NPS) under Section 80CCD(1B) for an additional ₹50,000 deduction. Estimated savings: ₹10,400 (assuming 20% tax slab).\n`;

      resolve(suggestion.trim());
    }, 1000); // Simulate network delay
  });
};

export default function FinancialCalculators() {
  // Tax Calculator State
  const [taxYear, setTaxYear] = useState("2024");
  const [userIncome, setUserIncome] = useState(1200000);
  const [longTermCapitalGains, setLongTermCapitalGains] = useState(200000);
  const [shortTermCapitalGains, setShortTermCapitalGains] = useState(150000);
  const [dividendIncome, setDividendIncome] = useState(50000);
  const [taxResult, setTaxResult] = useState(null);
  const [taxRecords, setTaxRecords] = useState(null);
  const [taxSuggestion, setTaxSuggestion] = useState(null);
  const [isCalculatingTax, setIsCalculatingTax] = useState(false);
  const [isFetchingRecords, setIsFetchingRecords] = useState(false);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);

  // FD Calculator State
  const [fdAmount, setFdAmount] = useState(100000);
  const [fdRate, setFdRate] = useState(6.5);
  const [fdTenure, setFdTenure] = useState(5);
  const [fdResult, setFdResult] = useState(null);

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(10);
  const [loanResult, setLoanResult] = useState(null);

  // Compound Interest Calculator State
  const [ciPrincipal, setCiPrincipal] = useState(10000);
  const [ciRate, setCiRate] = useState(5);
  const [ciTime, setCiTime] = useState(3);
  const [ciResult, setCiResult] = useState(null);

  // NPS Calculator State
  const [npsAmount, setNpsAmount] = useState(50000);
  const [npsRate, setNpsRate] = useState(10);
  const [npsTenure, setNpsTenure] = useState(20);
  const [npsResult, setNpsResult] = useState(null);

  // RD Calculator State
  const [rdAmount, setRdAmount] = useState(5000);
  const [rdRate, setRdRate] = useState(6);
  const [rdTenure, setRdTenure] = useState(5);
  const [rdResult, setRdResult] = useState(null);

  // PPF Calculator State
  const [ppfAmount, setPpfAmount] = useState(150000);
  const [ppfRate, setPpfRate] = useState(7.1);
  const [ppfTenure, setPpfTenure] = useState(15);
  const [ppfResult, setPpfResult] = useState(null);

  // EPF Calculator State
  const [epfSalary, setEpfSalary] = useState(50000);
  const [epfRate, setEpfRate] = useState(12);
  const [epfTenure, setEpfTenure] = useState(20);
  const [epfResult, setEpfResult] = useState(null);

  // SIP Calculator State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipTenure, setSipTenure] = useState(10);
  const [sipResult, setSipResult] = useState(null);

  // Lumpsum Calculator State
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [lumpsumRate, setLumpsumRate] = useState(10);
  const [lumpsumTenure, setLumpsumTenure] = useState(5);
  const [lumpsumResult, setLumpsumResult] = useState(null);

  useEffect(() => {
    const loadTaxRecords = async () => {
      setIsFetchingRecords(true);
      try {
        const records = await fetchTaxRecords();
        setTaxRecords(records.data);
      } catch (error) {
        console.error("Failed to fetch tax records:", error);
      }
      setIsFetchingRecords(false);
    };
    loadTaxRecords();
  }, []);

  const formatCurrency = (amount) =>
    `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  // Tax Calculator Handler
  const handleCalculateTax = async (e) => {
    e.preventDefault();
    setIsCalculatingTax(true);
    setIsFetchingSuggestion(true);

    const taxData = {
      taxYear,
      userIncome,
      longTermCapitalGains,
      shortTermCapitalGains,
      dividendIncome,
    };

    try {
      const [result, suggestion] = await Promise.all([
        calculateTax(taxData),
        fetchGeminiTaxSuggestion(taxData),
      ]);

      setTaxResult(result.data);
      setTaxSuggestion(suggestion);
    } catch (error) {
      console.error("Tax calculation failed:", error);
    }

    setIsCalculatingTax(false);
    setIsFetchingSuggestion(false);
  };

  // FD Calculator Handler
  const handleCalculateFD = (e) => {
    e.preventDefault();
    const interest = (fdAmount * fdRate * fdTenure) / 100;
    const maturity = fdAmount + interest;
    setFdResult({ interest, maturity });
  };

  // Loan Calculator Handler
  const handleCalculateLoan = (e) => {
    e.preventDefault();
    const r = loanRate / 12 / 100;
    const n = loanTenure * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;
    setLoanResult({ emi, totalInterest, totalPayment });
  };

  // Compound Interest Calculator Handler
  const handleCalculateCI = (e) => {
    e.preventDefault();
    const amount = ciPrincipal * Math.pow(1 + ciRate / 100, ciTime);
    const interest = amount - ciPrincipal;
    setCiResult({ amount, interest });
  };

  // NPS Calculator Handler
  const handleCalculateNPS = (e) => {
    e.preventDefault();
    const amount = npsAmount * Math.pow(1 + npsRate / 100, npsTenure);
    const maturity = amount * 0.4 + amount * 0.6; // 40% lump sum, 60% annuity (simplified)
    setNpsResult({ maturity });
  };

  // RD Calculator Handler
  const handleCalculateRD = (e) => {
    e.preventDefault();
    const n = rdTenure * 12;
    const r = rdRate / 100 / 12;
    const maturity = rdAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const interest = maturity - rdAmount * n;
    setRdResult({ maturity, interest });
  };

  // PPF Calculator Handler
  const handleCalculatePPF = (e) => {
    e.preventDefault();
    const amount = ppfAmount * ((Math.pow(1 + ppfRate / 100, ppfTenure) - 1) / (ppfRate / 100));
    setPpfResult({ maturity: amount });
  };

  // EPF Calculator Handler
  const handleCalculateEPF = (e) => {
    e.preventDefault();
    const monthlyContribution = (epfSalary * epfRate) / 100 * 2; // Employee + Employer
    const amount = monthlyContribution * 12 * ((Math.pow(1 + epfRate / 100, epfTenure) - 1) / (epfRate / 100));
    setEpfResult({ maturity: amount });
  };

  // SIP Calculator Handler
  const handleCalculateSIP = (e) => {
    e.preventDefault();
    const r = sipRate / 100 / 12;
    const n = sipTenure * 12;
    const amount = sipAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    setSipResult({ maturity: amount });
  };

  // Lumpsum Calculator Handler
  const handleCalculateLumpsum = (e) => {
    e.preventDefault();
    const amount = lumpsumAmount * Math.pow(1 + lumpsumRate / 100, lumpsumTenure);
    setLumpsumResult({ maturity: amount });
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Financial Calculators</h1>

      {/* AI Recommendation at Top */}
      {taxSuggestion && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl border border-white/10">
          <h2 className="text-lg font-medium text-gray-300 mb-2 flex items-center">
            <Info className="h-5 w-5 mr-2 text-purple-400" />
            AI Tax-Saving Recommendation
          </h2>
          <p className="text-sm text-gray-400 whitespace-pre-line">{taxSuggestion}</p>
        </div>
      )}

      <Tabs defaultValue="tax" className="w-full">
        <TabsList className="w-full bg-gradient-to-r from-gray-800/80 via-gray-900/90 to-gray-800/80 p-2 rounded-xl mb-6 flex flex-wrap gap-2 shadow-lg border border-gray-700/50 backdrop-blur-sm mb-6">
          <TabsTrigger 
            value="tax" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">Tax</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="fd" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">FD</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="loan" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">Loan</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="compound" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">Compound Interest</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="nps" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">NPS</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="rd" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">RD</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="ppf" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">PPF</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="epf" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">EPF</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="sip" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">SIP</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="lumpsum" 
            className="relative px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <span className="relative z-10">Lumpsum</span>
            <span className="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
        </TabsList>

        {/* Tax Calculator */}
        <TabsContent value="tax" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateTax} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tax Year</label>
                  <Select value={taxYear} onValueChange={setTaxYear}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-gray-300 focus:ring-2 focus:ring-purple-500 rounded-lg">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border border-white/10 text-white rounded-lg shadow-lg">
                      <SelectItem value="2024" className="hover:bg-purple-600/20 focus:bg-purple-600/30 transition-colors duration-200">
                        FY 2024-25
                      </SelectItem>
                      <SelectItem value="2025" className="hover:bg-purple-600/20 focus:bg-purple-600/30 transition-colors duration-200">
                        FY 2025-26
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Annual Income (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={userIncome}
                      onChange={(e) => setUserIncome(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Long-Term Capital Gains (₹)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 inline ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>{"Gains from assets held > 1 year"}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <Input
                        type="number"
                        value={longTermCapitalGains}
                        onChange={(e) => setLongTermCapitalGains(Number(e.target.value))}
                        className="pl-9 bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Short-Term Capital Gains (₹)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 inline ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>{"Gains from assets held < 1 year"}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <Input
                        type="number"
                        value={shortTermCapitalGains}
                        onChange={(e) => setShortTermCapitalGains(Number(e.target.value))}
                        className="pl-9 bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Dividend Income (₹)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 inline ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>{"Tax-free in India"}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <Input
                        type="number"
                        value={dividendIncome}
                        onChange={(e) => setDividendIncome(Number(e.target.value))}
                        className="pl-9 bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                  disabled={isCalculatingTax || isFetchingSuggestion}
                >
                  {isCalculatingTax || isFetchingSuggestion ? "Processing..." : "Calculate Tax"}
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Tax Summary
              </h2>
              {taxResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Total Tax</span>
                      <span className="text-xl font-medium">{formatCurrency(taxResult.totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Effective Tax Rate</span>
                      <span>
                        {Math.round(
                          (taxResult.totalTax /
                            (userIncome + longTermCapitalGains + shortTermCapitalGains + dividendIncome)) * 100
                        )}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Income Tax</span>
                      <span>{formatCurrency(taxResult.incomeTax)}</span>
                    </div>
                    <Progress
                      value={(taxResult.incomeTax / taxResult.totalTax) * 100}
                      className="h-2 bg-white/10"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">LTCG Tax</span>
                      <span>{formatCurrency(taxResult.ltcgTax)}</span>
                    </div>
                    <Progress
                      value={(taxResult.ltcgTax / taxResult.totalTax) * 100}
                      className="h-2 bg-white/10"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">STCG Tax</span>
                      <span>{formatCurrency(taxResult.stcgTax)}</span>
                    </div>
                    <Progress
                      value={(taxResult.stcgTax / taxResult.totalTax) * 100}
                      className="h-2 bg-white/10"
                    />
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Cess (4%)</span>
                      <span>{formatCurrency(taxResult.cess)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Payable Tax</span>
                      <span className="text-lg">{formatCurrency(taxResult.currentTax)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate tax to see summary</p>
              )}
            </div>
          </div>
          {isFetchingRecords ? (
            <p>Loading...</p>
          ) : taxRecords ? (
            <div className="bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Tax History
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Total Income</div>
                  <div className="text-xl font-medium">{formatCurrency(taxRecords.totalIncome)}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Total Tax Paid</div>
                  <div className="text-xl font-medium">{formatCurrency(taxRecords.totalTaxPaid)}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Total Cess Paid</div>
                  <div className="text-xl font-medium">{formatCurrency(taxRecords.totalCessPaid)}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Total Amount Paid</div>
                  <div className="text-xl font-medium">{formatCurrency(taxRecords.totalAmountPaid)}</div>
                </div>
              </div>
              <Button className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </div>
          ) : (
            <p className="text-gray-400">No tax records found</p>
          )}
        </TabsContent>

        {/* FD Calculator */}
        <TabsContent value="fd" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateFD} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Principal Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={fdAmount}
                      onChange={(e) => setFdAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={fdTenure}
                    onChange={(e) => setFdTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate FD
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                FD Summary
              </h2>
              {fdResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Interest Earned</span>
                      <span>{formatCurrency(fdResult.interest)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(fdResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate FD to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Loan Calculator */}
        <TabsContent value="loan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateLoan} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Loan Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate Loan
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Loan Summary
              </h2>
              {loanResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Monthly EMI</span>
                      <span>{formatCurrency(loanResult.emi)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Total Interest</span>
                      <span>{formatCurrency(loanResult.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Payment</span>
                      <span className="text-lg">{formatCurrency(loanResult.totalPayment)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate loan to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Compound Interest Calculator */}
        <TabsContent value="compound" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateCI} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Principal Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={ciPrincipal}
                      onChange={(e) => setCiPrincipal(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={ciRate}
                    onChange={(e) => setCiRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time (Years)</label>
                  <Input
                    type="number"
                    value={ciTime}
                    onChange={(e) => setCiTime(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate Compound Interest
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Compound Interest Summary
              </h2>
              {ciResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Interest Earned</span>
                      <span>{formatCurrency(ciResult.interest)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Amount</span>
                      <span className="text-lg">{formatCurrency(ciResult.amount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* NPS Calculator */}
        <TabsContent value="nps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateNPS} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Annual Contribution (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={npsAmount}
                      onChange={(e) => setNpsAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Expected Return (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={npsRate}
                    onChange={(e) => setNpsRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={npsTenure}
                    onChange={(e) => setNpsTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate NPS
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                NPS Summary
              </h2>
              {npsResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(npsResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate NPS to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* RD Calculator */}
        <TabsContent value="rd" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateRD} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Deposit (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={rdAmount}
                      onChange={(e) => setRdAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={rdRate}
                    onChange={(e) => setRdRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={rdTenure}
                    onChange={(e) => setRdTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate RD
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                RD Summary
              </h2>
              {rdResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Interest Earned</span>
                      <span>{formatCurrency(rdResult.interest)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(rdResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate RD to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* PPF Calculator */}
        <TabsContent value="ppf" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculatePPF} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Annual Investment (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={ppfAmount}
                      onChange={(e) => setPpfAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={ppfRate}
                    onChange={(e) => setPpfRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={ppfTenure}
                    onChange={(e) => setPpfTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate PPF
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                PPF Summary
              </h2>
              {ppfResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(ppfResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate PPF to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* EPF Calculator */}
        <TabsContent value="epf" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateEPF} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Salary (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={epfSalary}
                      onChange={(e) => setEpfSalary(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contribution Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={epfRate}
                    onChange={(e) => setEpfRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={epfTenure}
                    onChange={(e) => setEpfTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate EPF
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                EPF Summary
              </h2>
              {epfResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(epfResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate EPF to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SIP Calculator */}
        <TabsContent value="sip" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateSIP} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Investment (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Expected Return (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={sipRate}
                    onChange={(e) => setSipRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={sipTenure}
                    onChange={(e) => setSipTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate SIP
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                SIP Summary
              </h2>
              {sipResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(sipResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate SIP to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Lumpsum Calculator */}
        <TabsContent value="lumpsum" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl">
              <form onSubmit={handleCalculateLumpsum} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Investment Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      type="number"
                      value={lumpsumAmount}
                      onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                      className="pl-9 bg-white/5 border-white/10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Expected Return (% p.a.)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={lumpsumRate}
                    onChange={(e) => setLumpsumRate(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tenure (Years)</label>
                  <Input
                    type="number"
                    value={lumpsumTenure}
                    onChange={(e) => setLumpsumTenure(Number(e.target.value))}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Calculate Lumpsum
                </Button>
              </form>
            </div>
            <div className="lg:col-span-1 bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Lumpsum Summary
              </h2>
              {lumpsumResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between font-medium">
                      <span>Maturity Amount</span>
                      <span className="text-lg">{formatCurrency(lumpsumResult.maturity)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Calculate Lumpsum to see summary</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}