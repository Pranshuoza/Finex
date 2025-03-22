import React from "react";
import { Search, Briefcase, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-gradient-to-r from-purple-900/10 via-gray-900/10 to-indigo-900/10 backdrop-blur-md">
      <div className="relative w-64 lg:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search stocks..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Link
          to="/orders" // Changed from href to to for react-router-dom
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] hover:scale-105"
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Orders
        </Link>
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] hover:scale-105">
          <BarChart2 className="h-4 w-4 mr-2" />
          Holdings
        </button>
      </div>
    </header>
  );
}