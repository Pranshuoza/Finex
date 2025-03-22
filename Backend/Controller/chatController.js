const Chat = require("../model/Chat");
const { generateAIResponse } = require("../utils/aiService");
const User = require("../model/User");

exports.handleChat = async (req, res) => {
    try {
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const userId = await User.findOne({ email: email }).select('-password')
        if (!userId) return res.status(404).json({ message: "User not found" });

        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const response = await generateAIResponse(message);

        const chatEntry = new Chat({ message, response });
        await chatEntry.save();

        userId.chatHistory.push(chatEntry);
        await userId.save();

        res.status(200).json({ message, response });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Error processing chat request" });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const userId = await User.findOne({ email: email }).select('-password')
        if (!userId) return res.status(404).json({ message: "User not found" });

        const chatHistory = await Chat.find({ _id: { $in: userId.chatHistory } });
        
        res.status(200).json(chatHistory);

    } catch (error) {
        res.status(500).json({ error: "Error fetching chat history" });
    }
};

exports.deleteChatHistory = async (req, res) => {
    try {
        await Chat.deleteMany({});
        res.status(200).json({ message: "Chat history deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting chat history" });
    }
};
