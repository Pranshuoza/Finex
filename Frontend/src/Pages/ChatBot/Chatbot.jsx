import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { useChatbot } from "../../Hooks/useChatbot";
import { ChatbotAPI } from "../../lib/chatbotapi";

export const FinancialChatbot = ({ metrics, recommendations = [], className = "" }) => {
  const token = localStorage.getItem("token");
  const api = new ChatbotAPI(token);
  const { messages, isLoading, sendMessage } = useChatbot({ api });
  const [input, setInput] = useState("");
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
    <div className={`p-4 lg:p-6 ${className}`}>
      <div className="flex h-[100vh] w-full rounded-xl overflow-hidden ">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/20 via-fuchsia-500/10 to-indigo-500/20"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center">
                <Bot className="w-6 h-6 mr-2 text-white" />
                <h2 className="text-lg font-semibold text-white">Finex Expert AI Chatbot</h2>
              </div>
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
                        ? "bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white"
                        : "bg-white/5 border border-white/10 text-gray-100"
                    } rounded-lg p-4`}
                  >
                    {message.role === "assistant" && <Bot className="w-5 h-5 mt-1 text-purple-400" />}
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
                  <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span className="text-gray-300">Analyzing market data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-black/20 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about investments, market analysis, or financial advice..."
                  className="flex-1 bg-white/5 text-gray-100 rounded-lg px-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};