import { useState, useCallback, useEffect } from "react";
import { ChatbotAPI } from "../lib/chatbotapi";

export const useChatbot = ({
  api,
  initialMessage = "Hello! How can I assist you today?",
} = {}) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim()) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: message, timestamp: new Date() },
      ]);
      setIsLoading(true);

      try {
        const response = await api.generateResponse(message);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response, timestamp: new Date() },
        ]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  // Cleanup API session on unmount
  useEffect(() => {
    return () => {
      api.closeSession();
    };
  }, [api]);

  return { messages, isLoading, sendMessage };
};