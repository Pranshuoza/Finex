const axios = require("axios");

exports.generateAIResponse = async (message) => {
    try {
        // Example: Using OpenAI API for chatbot response
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
            },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("AI response error:", error);
        return "Sorry, I couldn't process that request.";
    }
};
