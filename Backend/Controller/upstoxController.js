require("dotenv").config();
const axios = require("axios");
const qs = require("querystring");
const mongoose = require("mongoose");
const User = require("../Model/User");
const jwt = require("jsonwebtoken");

// Redirect User to Upstox Login Page
exports.getAuthURL = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    user.recentToken = token;
    await user.save();

    const authUrl = `${process.env.UPSTOX_AUTH_URL}?client_id=${process.env.UPSTOX_CLIENT_ID}&redirect_uri=${process.env.UPSTOX_REDIRECT_URI}&response_type=code`;
    console.log("Generated auth URL:", authUrl);
    res.json({ authUrl });
  } catch (error) {
    console.error("Error in getAuthURL:", error.message);
    res.status(500).json({ message: "Error generating auth URL", error: error.message });
  }
};

// Handle Callback & Exchange Code for Access Token
exports.getAccessToken = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect("http://localhost:5173/login?error=no_code");
    }

    const user = await User.findOne({ recentToken: { $exists: true, $ne: null } }).sort({ updatedAt: -1 });
    if (!user || !user.recentToken) {
      return res.redirect("http://localhost:5173/login?error=no_token");
    }

    const decoded = jwt.verify(user.recentToken, process.env.JWT_SECRET);
    if (decoded.email !== user.email) {
      return res.redirect("http://localhost:5173/login?error=invalid_token");
    }

    const data = qs.stringify({
      client_id: process.env.UPSTOX_CLIENT_ID,
      client_secret: process.env.UPSTOX_CLIENT_SECRET,
      redirect_uri: process.env.UPSTOX_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code,
    });

    console.log("Token request URL:", process.env.UPSTOX_TOKEN_URL);
    console.log("Token request data:", data);

    const response = await axios.post(process.env.UPSTOX_TOKEN_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
    });

    const { access_token, user_id } = response.data;

    user.upstoxAccessToken = access_token;
    user.upstoxUserId = user_id;
    await user.save();

    res.redirect("http://localhost:5173/");
  } catch (error) {
    console.error("Error in getAccessToken:", error.response?.data || error.message);
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.response?.data?.message || error.message)}`);
  }
};

// Refresh Access Token
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const data = qs.stringify({
      client_id: process.env.UPSTOX_CLIENT_ID,
      client_secret: process.env_UPSTOX_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    });

    const response = await axios.post(process.env.UPSTOX_REFRESH_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
    });

    const { access_token } = response.data;
    user.upstoxAccessToken = access_token;
    await user.save();

    res.json({ message: "Access token refreshed", access_token });
  } catch (error) {
    console.error("Error in refreshAccessToken:", error.response?.data || error.message);
    res.status(500).json({ message: "Error refreshing access token", error: error.response?.data || error.message });
  }
};

module.exports = exports;