import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Sidebar from "./Components/Sidebar";
import Login from "./Pages/Authentication/Login/Login";
import Register from "./Pages/Authentication/Register/Register";
import Profile from "./Pages/Profile/Profile";
import StockApp from "./Pages/Investment/Stock";
import FixedDepositApp from "./Pages/Investment/FD";
import Accounts from "./Pages/Account/Accounts";
import AccountDetails from "./Pages/Account/AccountDetails";
import CategoryPage from "./Pages/Category/Category";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/profile", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicRoutes = ["/login", "/register"];
    if (!token && !publicRoutes.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Enhanced Mesh Background */}
      <div className="absolute inset-0 bg-black z-0">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-transparent to-transparent opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-t from-purple-600/20 via-purple-800/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-indigo-900/20 to-transparent opacity-70"></div>
        <div className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-600/20 via-fuchsia-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1/3 h-1/3 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-1/4 h-1/4 bg-gradient-to-bl from-pink-600/20 via-fuchsia-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1/3 h-1/3 bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-1/4 h-1/4 bg-gradient-to-bl from-violet-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,50,255,0.05),transparent_70%)]"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        {/* Navbar */}
        <Navbar className="sticky top-0 bg-gray-900/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]" />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/stock" element={<StockApp />} />
            <Route path="/fd" element={<FixedDepositApp />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:accountId" element={<AccountDetails />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/" element={<StockApp />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App;