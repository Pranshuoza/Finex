import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm">© {new Date().getFullYear()} FinancePro. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm hover:text-blue-300 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-sm hover:text-blue-300 transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-sm hover:text-blue-300 transition-colors duration-200">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;