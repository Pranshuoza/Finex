import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Pages/Authentication/Login/Login";
import Register from "./Pages/Authentication/Register/Register";
import Profile from "./Pages/Profile/Profile";
import StockApp from "./Pages/Investment/Stock";
import FixedDepositApp from "./Pages/Investment/FD";
import Accounts from "./Pages/Account/Accounts";
import AccountDetails from "./Pages/Account/AccountDetails";
import CategoryPage from "./Pages/Category/Category";

function App() {
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
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/stock" element={<StockApp />} />
        <Route path="/fd" element={<FixedDepositApp />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:accountId" element={<AccountDetails />} />
        <Route path="/category" element={<CategoryPage />} />
        {/* <Route path="/tax" element={<TaxApp />} /> */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
