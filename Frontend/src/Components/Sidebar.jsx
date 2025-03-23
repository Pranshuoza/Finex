import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare, User, TrendingUp, FileText, LogOut } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Future Goals", href: "/goals", icon: TrendingUp },
    { name: "Tax", href: "/tax", icon: FileText },
    { name: "Chatbot", href: "/chatbot", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/landing");
  };

  return (
    <div className="w-20 lg:w-64 h-full bg-gradient-to-bl from-purple-900/20 via-gray-900/30 to-indigo-900/20 backdrop-blur-md border-r border-white/10 flex flex-col z-10 transition-all duration-300">
      {/* Logo Section */}
      <div className="p-4 border-b border-white/10 flex items-center justify-center lg:justify-start">
        <h1 className="text-4xl font-bold text-white hidden lg:block">
          <Link to="/landing">
          finex<span className="text-green-500">.</span>
          </Link>
        </h1>
        <span className="text-2xl font-bold text-white lg:hidden">
          f<span className="text-purple-500">.</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all duration-200 group hover:bg-white/10 relative",
                    isActive
                      ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-400 border border-purple-500/20"
                      : "text-gray-400"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-purple-400")} />
                  <span className="ml-3 hidden lg:block">{item.name}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all duration-200 group hover:bg-white/10 text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3 hidden lg:block">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
