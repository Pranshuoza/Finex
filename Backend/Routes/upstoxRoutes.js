const express = require("express");
const router = express.Router();
const upstoxController = require("../controller/upstoxController");

// Step 1: Get authorization URL
router.get("/auth", upstoxController.getAuthURL);

// Step 2: Callback to exchange code for access token
router.get("/callback", upstoxController.getAccessToken);

// Step 3: Refresh Access Token
router.post("/refresh", upstoxController.refreshAccessToken);

module.exports = router;