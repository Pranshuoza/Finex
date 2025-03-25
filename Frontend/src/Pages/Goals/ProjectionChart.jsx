import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { BarChart4 } from "lucide-react";

export default function ProjectionChart({ investmentAmount,  }) {
  const [projectionData, setProjectionData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("2Y");

  useEffect(() => {
    const generateProjection = () => {
      const months = timeFrame === "1Y" ? 12 : timeFrame === "2Y" ? 24 : 60;
      const growthRate = 0.10; // 10% annual growth
      const monthlyRate = growthRate / 12; // Monthly interest rate
      const monthlyAddition = 1000; // Fixed monthly investment

      const data = [];
      const today = new Date();
      let basePlusMonthly = investmentAmount; // Start with initial investment, no interest
      let withInterest = investmentAmount; // Start with initial investment, with interest

      for (let i = 0; i <= months; i++) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = monthDate.toLocaleString("en-IN", { month: "short", year: "2-digit" });

        // Calculate for "Base + Monthly" (no interest)
        if (i > 0) basePlusMonthly += monthlyAddition; // Add monthly amount starting from month 1

        // Calculate for "Base + Monthly + Interest"
        const interest = withInterest * monthlyRate; // Interest on previous total
        withInterest += interest; // Add interest
        if (i > 0) withInterest += monthlyAddition; // Add monthly amount starting from month 1

        data.push({
          month: `${monthName}-${(today.getFullYear() + Math.floor((today.getMonth() + i) / 12)) % 100}`,
          BasePlusMonthly: Math.round(basePlusMonthly),
          WithInterest: Math.round(withInterest),
        });
      }

      setProjectionData(data);
    };

    generateProjection();
  }, [investmentAmount, timeFrame]);

  const formatYAxis = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <div className="relative bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl overflow-hidden">
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-indigo-500/20 via-blue-500/10 to-cyan-500/20"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            <BarChart4 className="h-4 w-4 mr-2 text-blue-400" />
            Investment Growth Projection
          </h3>
          <div className="flex items-center space-x-2">
            {["1Y", "2Y", "5Y"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-3 py-1 text-sm rounded-md ${timeFrame === tf ? "bg-blue-500/20 text-blue-400" : "bg-white/5 hover:bg-white/10"} transition-colors`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#4b5563" />
              <YAxis stroke="#4b5563" tickFormatter={formatYAxis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2d",
                  borderColor: "#374151",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, ""]}
              />
              <Legend />
              <ReferenceLine
                y={projectionData[0]?.BasePlusMonthly}
                label="Initial Investment"
                stroke="#6b7280"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="BasePlusMonthly"
                name="Base + Monthly"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="WithInterest"
                name="Base + Monthly + Interest"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-sm">
              ₹{investmentAmount.toLocaleString("en-IN")} + ₹1K/month could grow to{" "}
              <span className="text-purple-400 font-medium">
                ₹{(projectionData[projectionData.length - 1]?.WithInterest || 0).toLocaleString("en-IN")}
              </span>{" "}
              in {timeFrame} with interest.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}