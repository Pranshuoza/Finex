const mongoose = require("mongoose");

const aiChatSchema = new mongoose.Schema({
    message: { type: String, required: true },
    response: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Chat", aiChatSchema);