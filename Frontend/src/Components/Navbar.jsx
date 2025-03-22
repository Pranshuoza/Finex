import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../Components/ui/button";
import Logout from "./Logout";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to={isLoggedIn ? "/profile" : "/login"} className="text-2xl font-bold tracking-tight">
              FinancePro
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                    }`
                  }
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/stock"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                    }`
                  }
                >
                  Stocks
                </NavLink>
                <NavLink
                  to="/fd"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                    }`
                  }
                >
                  Fixed Deposits
                </NavLink>
                <NavLink
                  to="/accounts"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                    }`
                  }
                >
                  Accounts
                </NavLink>
                <Logout className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 hover:text-white transition-all duration-200" />
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu} className="text-white hover:text-blue-300">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
              {isLoggedIn ? (
                <>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/stock"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Stocks
                  </NavLink>
                  <NavLink
                    to="/fd"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Fixed Deposits
                  </NavLink>
                  <NavLink
                    to="/accounts"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Accounts
                  </NavLink>
                  <Logout
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 hover:text-white transition-all duration-200 w-full text-left"
                    onClick={toggleMenu}
                  />
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700 hover:text-blue-300"
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;