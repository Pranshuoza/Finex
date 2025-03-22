import { useState, useEffect } from "react";
import { ArrowRight, Star, ArrowUpRight } from "lucide-react";
import { Button } from "../../Components/ui/button"; // Adjust path based on your project structure
import { cn } from "../../lib/utils"; // Adjust path based on your project structure
import { Link } from "react-router-dom";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-mesh min-h-screen">
      <div className="min-h-screen text-white">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">finex.</h1>
          </div>
          <Link className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-6 py-2 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transform hover:scale-105" to={localStorage.getItem('token') ? '/' : '/login'}>
            {localStorage.getItem('token') ? 'Dashboard' : 'Get Started'}
          </Link>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2
            className={cn(
              "text-4xl md:text-6xl font-bold mb-6 transition-all duration-1000 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            )}
          >
            AI-Powered Investment Advisory
          </h2>
          <p
            className={cn(
              "text-xl text-white/80 max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-300 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            )}
          >
            Make smarter investment decisions with personalized advice based on your goals, risk tolerance, and current
            market conditions. All powered by advanced AI.
          </p>
          <Button 
            className={cn(
              "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-8 py-6 text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transform hover:scale-105",
              "transition-all duration-1000 delay-500",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <Link to={localStorage.getItem('token') ? '/' : '/login'}>
              {localStorage.getItem('token') ? 'Dashboard' : 'Get Started'} <ArrowRight className="ml-2 inline-block animate-pulse" />
            </Link>
          </Button>
        </section>

        {/* Dashboard Section */}
        <section className="container mx-auto px-4 py-12 mb-20">
          <div
            className={cn(
              "bg-[#0f1123] rounded-xl overflow-hidden border border-gray-800 shadow-2xl transition-all duration-1000 delay-700 transform",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            )}
          >
            {/* Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Investments */}
                <div className="relative bg-gradient-to-bl from-slate-800/80 via-gray-900/90 to-stone-800/80 p-5 rounded-xl overflow-hidden group">
                  <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-slate-500/20 via-gray-500/10 to-stone-500/20"></div>
                  <div className="relative z-10">
                    <h3 className="text-gray-400 font-medium mb-1">Total Investments</h3>
                    <div className="text-3xl font-bold">₹48,560.90</div>
                    <div className="flex items-center mt-2 text-green-400">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+2.4%</span>
                      <span className="text-gray-400 text-sm ml-2">this month</span>
                    </div>
                  </div>
                </div>

                {/* Current Value */}
                <div className="relative bg-gradient-to-bl from-blue-900/80 via-gray-900/90 to-steel-800/80 p-5 rounded-xl overflow-hidden group">
                  <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-blue-600/20 via-steel-500/10 to-gray-500/20"></div>
                  <div className="relative z-10">
                    <h3 className="text-gray-400 font-medium mb-1">Current Value</h3>
                    <div className="text-3xl font-bold">₹52,345.75</div>
                    <div className="flex items-center mt-2 text-green-400">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+7.8%</span>
                      <span className="text-gray-400 text-sm ml-2">overall</span>
                    </div>
                  </div>
                </div>

                {/* Overall P&L */}
                <div className="relative bg-gradient-to-bl from-amber-900/80 via-gray-900/90 to-bronze-800/80 p-5 rounded-xl overflow-hidden group">
                  <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-amber-600/20 via-bronze-500/10 to-gray-500/20"></div>
                  <div className="relative z-10">
                    <h3 className="text-gray-400 font-medium mb-1">Overall P&L</h3>
                    <div className="text-3xl font-bold">+₹3,784.85</div>
                    <div className="flex items-center mt-2 text-green-400">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+7.8%</span>
                      <span className="text-gray-400 text-sm ml-2">all time</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Performance */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-[#1a1f42] to-[#2d2b5a] p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">Portfolio Performance</h3>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 rounded-md text-sm bg-[#0f1123] text-gray-400">1D</button>
                      <button className="px-3 py-1 rounded-md text-sm bg-[#0f1123] text-gray-400">1W</button>
                      <button className="px-3 py-1 rounded-md text-sm bg-[#7c3aed] text-white">1M</button>
                      <button className="px-3 py-1 rounded-md text-sm bg-[#0f1123] text-gray-400">1Y</button>
                      <button className="px-3 py-1 rounded-md text-sm bg-[#0f1123] text-gray-400">All</button>
                    </div>
                  </div>
                  <div className="h-64 w-full relative">
                    <svg viewBox="0 0 800 300" className="w-full h-full">
                      <path
                        d="M0,150 C50,120 100,180 150,150 C200,120 250,60 300,90 C350,120 400,240 450,210 C500,180 550,120 600,150 C650,180 700,120 750,90 L750,300 L0,300 Z"
                        fill="url(#gradient)"
                        fillOpacity="0.2"
                      />
                      <path
                        d="M0,150 C50,120 100,180 150,150 C200,120 250,60 300,90 C350,120 400,240 450,210 C500,180 550,120 600,150 C650,180 700,120 750,90"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="3"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <circle cx="150" cy="150" r="5" fill="#7c3aed" />
                      <circle cx="300" cy="90" r="5" fill="#7c3aed" />
                      <circle cx="450" cy="210" r="5" fill="#7c3aed" />
                      <circle cx="600" cy="150" r="5" fill="#7c3aed" />
                      <circle cx="750" cy="90" r="5" fill="#7c3aed" />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-4">
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul</span>
                      <span>Sep</span>
                      <span>Nov</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-br from-[#2d1a4e] to-[#1e1133] p-6 rounded-xl">
                  <h3 className="text-xl font-medium flex items-center mb-4">
                    <span className="mr-2 text-yellow-400">⚡</span> AI Recommendations
                  </h3>

                  {/* Recommendation Cards */}
                  <div className="space-y-4">
                    {/* Diversify Portfolio */}
                    <div className="bg-[#2a1b45] p-4 rounded-lg border border-purple-900/50 relative group">
                      <Star className="absolute top-4 right-4 w-5 h-5 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <h4 className="font-medium mb-1">Diversify Portfolio</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        Consider adding more tech stocks to balance your portfolio
                      </p>
                      <a
                        href="#"
                        className="text-sm text-purple-400 flex items-center hover:text-purple-300 transition-colors"
                      >
                        View Suggestions <ArrowUpRight className="ml-1 w-3 h-3" />
                      </a>
                    </div>

                    {/* Potential Opportunity */}
                    <div className="bg-[#2a1b45] p-4 rounded-lg border border-purple-900/50 relative group">
                      <Star className="absolute top-4 right-4 w-5 h-5 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <h4 className="font-medium mb-1">Potential Opportunity</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        NVDA showing strong momentum with recent product launch
                      </p>
                      <a
                        href="#"
                        className="text-sm text-purple-400 flex items-center hover:text-purple-300 transition-colors"
                      >
                        Research More <ArrowUpRight className="ml-1 w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-Powered Insights"
              description="Get personalized investment advice based on your goals, risk tolerance, and current market conditions."
              icon="⚡"
            />
            <FeatureCard
              title="Real-Time Market Data"
              description="Access real-time stock data through integrated financial APIs for informed decision making."
              icon="📊"
            />
            <FeatureCard
              title="Tax Compliance Tools"
              description="Understand the tax implications of your investments with our clear tax insights and tools."
              icon="📝"
            />
            <FeatureCard
              title="Interactive Charts"
              description="Visualize your portfolio performance and market trends with interactive and intuitive charts."
              icon="📈"
            />
            <FeatureCard
              title="Secure Portfolio Tracking"
              description="Track your investments securely with our robust authentication and data protection."
              icon="🔒"
            />
            <FeatureCard
              title="Regulatory Compliance"
              description="Rest easy knowing our platform is fully compliant with all relevant market regulations."
              icon="✅"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make Smarter Investment Decisions?</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12">
              Join thousands of retail investors who are leveraging AI to optimize their portfolios and achieve their
              financial goals.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-8 py-6 text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transform hover:scale-105">
            <Link to={localStorage.getItem('token') ? '/' : '/login'}>
              {localStorage.getItem('token') ? 'Dashboard' : 'Get Started'} <ArrowRight className="ml-2 inline-block animate-pulse" />
            </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h1 className="text-2xl font-bold">finex.</h1>
              <p className="text-white/60 mt-2">AI-powered retail investment advisory</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-white/60 text-sm">
            © {new Date().getFullYear()} Finex. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-gradient-to-br from-[#1e2142] to-[#171a36] p-8 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] group">
      <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
}