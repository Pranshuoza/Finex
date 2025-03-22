const express = require("express");
const router = express.Router();
const { handleChat, getChatHistory, deleteChatHistory } = require("../controller/chatController");

router.post("/", handleChat);
router.get("/history", getChatHistory);
router.delete("/history", deleteChatHistory); // Route to delete chat history

module.exports = router;
