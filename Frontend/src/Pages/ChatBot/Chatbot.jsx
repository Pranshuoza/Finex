import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { useChatbot } from "../../Hooks/useChatbot";
import { ChatbotAPI } from "../../lib/chatbotapi";

export const FinancialChatbot = ({ metrics, recommendations = [], className = "" }) => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  const api = new ChatbotAPI(token); // Pass token to ChatbotAPI
  const { messages, isLoading, sendMessage } = useChatbot({ api });
  const [input, setInput] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div
      className={`flex h-[800px] w-full max-w-7xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="w-6 h-6 mr-2 text-white" />
            <h2 className="text-lg font-semibold text-white">Financial Expert AI</h2>
          </div>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100"
                } rounded-lg p-4`}
              >
                {message.role === "assistant" && <Bot className="w-5 h-5 mt-1" />}
                {message.role === "user" && <User className="w-5 h-5 mt-1" />}
                <div className="space-y-1">
                  <div className="prose prose-sm max-w-none prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className="text-xs opacity-70">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-gray-300">Analyzing market data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about investments, market analysis, or financial advice..."
              className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Analytics Sidebar */}
      {showAnalytics && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Analytics
          </h3>

          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-4">AI Recommendations</h4>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{rec.title}</span>
                      <span className="text-xs text-blue-400">{rec.confidence}%</span>
                    </div>
                    <p className="text-sm text-gray-400">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Response Time</div>
                  <div className="text-xl font-semibold text-white">
                    {metrics.responseTime}ms
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Satisfaction</div>
                  <div className="text-xl font-semibold text-white">
                    {metrics.satisfaction}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};