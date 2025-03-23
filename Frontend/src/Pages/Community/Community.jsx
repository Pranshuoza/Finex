"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  MessageSquare,
  TrendingUp,
  BarChart4,
  BookOpen,
  Users,
  Star,
  Search,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Award,
  LineChart,
  DollarSign,
  Briefcase,
  Shield,
  Zap,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../Components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Badge } from "../../Components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../Components/ui/dialog";
import { Progress } from "../../Components/ui/progress";

// Mock socket implementation (client-side only)
const mockSocket = {
  on: (event, callback) => {
    // Store event listeners
    if (!mockSocket.listeners[event]) {
      mockSocket.listeners[event] = [];
    }
    mockSocket.listeners[event].push(callback);
    return mockSocket;
  },
  emit: (event, data) => {
    // Simulate emitting events
    setTimeout(() => {
      if (mockSocket.listeners[event]) {
        mockSocket.listeners[event].forEach((callback) => callback(data));
      }
    }, 100);
    return mockSocket;
  },
  listeners: {},
  // Mock disconnect method
  disconnect: () => {
    mockSocket.listeners = {};
  },
};

// Sample data
const trendingTopics = [
  {
    id: 1,
    title: "S&P 500 Outlook for Q2 2025",
    category: "Market Analysis",
    comments: 128,
    likes: 342,
  },
  {
    id: 2,
    title: "Best ETFs for Passive Income",
    category: "ETFs",
    comments: 87,
    likes: 231,
  },
  {
    id: 3,
    title: "Gold vs Bitcoin as Inflation Hedge",
    category: "Safe Investments",
    comments: 156,
    likes: 289,
  },
  {
    id: 4,
    title: "Monthly SIP vs Lump Sum Investment",
    category: "Strategies",
    comments: 92,
    likes: 178,
  },
  {
    id: 5,
    title: "Top Financial Advisors in 2025",
    category: "Advisors",
    comments: 64,
    likes: 143,
  },
];

const expertInsights = [
  {
    id: 1,
    author: "Sarah Johnson",
    role: "Portfolio Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Why Index Funds Should Be Your Core Investment",
    preview:
      "The data consistently shows that over long periods, low-cost index funds outperform...",
    likes: 423,
    comments: 87,
    timestamp: "2 hours ago",
    verified: true,
  },
  {
    id: 2,
    author: "Michael Chen",
    role: "Financial Analyst",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Sector Rotation Strategy for Volatile Markets",
    preview:
      "In times of market uncertainty, a tactical sector rotation approach can help...",
    likes: 287,
    comments: 53,
    timestamp: "5 hours ago",
    verified: true,
  },
  {
    id: 3,
    author: "Priya Patel",
    role: "Retirement Specialist",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Maximizing Tax Benefits in Your Investment Portfolio",
    preview:
      "Tax-efficient investing can significantly improve your long-term returns...",
    likes: 356,
    comments: 71,
    timestamp: "Yesterday",
    verified: true,
  },
];

const discussionThreads = [
  {
    id: 1,
    author: "Alex Morgan",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Has anyone worked with Fidelity advisors?",
    content:
      "I'm considering working with a Fidelity financial advisor for retirement planning. Would appreciate any feedback from those who have experience with them.",
    category: "Financial Advisors",
    timestamp: "3 hours ago",
    likes: 24,
    comments: 18,
    tags: ["advisors", "retirement", "planning"],
  },
  {
    id: 2,
    author: "Jamie Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "SCHD vs VYM - Which dividend ETF is better for long term?",
    content:
      "I'm looking to add a dividend ETF to my portfolio for long-term growth. Trying to decide between SCHD and VYM. Any thoughts on which has better prospects?",
    category: "ETFs & Mutual Funds",
    timestamp: "6 hours ago",
    likes: 42,
    comments: 31,
    tags: ["dividends", "ETFs", "passive income"],
  },
  {
    id: 3,
    author: "Taylor Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "Poll: What percentage of your portfolio is in index funds?",
    content:
      "Curious to know what percentage of your investment portfolio is allocated to index funds vs individual stocks or other assets?",
    category: "Investment Strategies",
    timestamp: "12 hours ago",
    likes: 87,
    comments: 64,
    isPoll: true,
    pollOptions: [
      { option: "0-25%", votes: 124 },
      { option: "26-50%", votes: 287 },
      { option: "51-75%", votes: 346 },
      { option: "76-100%", votes: 198 },
    ],
    tags: ["index funds", "portfolio allocation", "survey"],
  },
];

const resourceLibrary = [
  {
    id: 1,
    title: "Beginner's Guide to Stock Market Investing",
    type: "Guide",
    downloads: 1245,
    rating: 4.8,
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Retirement Calculator",
    type: "Tool",
    downloads: 876,
    rating: 4.6,
    icon: BarChart4,
  },
  {
    id: 3,
    title: "Tax-Efficient Investing Strategies",
    type: "Research Report",
    downloads: 543,
    rating: 4.7,
    icon: DollarSign,
  },
  {
    id: 4,
    title: "Bond Yield Calculator",
    type: "Tool",
    downloads: 689,
    rating: 4.5,
    icon: LineChart,
  },
];

const mockStockData = [
    {
        stockName: "Adani Energy Solutions Ltd.",
        symbol: "ADANIENSOL",
        tradingSymbol: "ADANIENSOL",
        currentPrice: 1000.00, // Replace with actual current price
        priceHistory: [{ date: new Date(), price: 1000.00 }], // Replace with actual price history
    },
    {
        stockName: "Adani Green Energy Ltd.",
        symbol: "ADANIGREEN",
        tradingSymbol: "ADANIGREEN",
        currentPrice: 1800.00, // Replace with actual current price
        priceHistory: [{ date: new Date(), price: 1800.00 }], // Replace with actual price history
    },
    {
        stockName: "Zomato Ltd.",
        symbol: "ZOMATO",
        tradingSymbol: "ZOMATO",
        currentPrice: 180.00, // Replace with actual current price
        priceHistory: [{ date: new Date(), price: 180.00 }], // Replace with actual price history
    },
    {
        stockName: "Indian Renewable Energy Development Agency Ltd.",
        symbol: "IREDA",
        tradingSymbol: "IREDA",
        currentPrice: 150.00, // Replace with actual current price
        priceHistory: [{ date: new Date(), price: 150.00 }], // Replace with actual price history
    },
    {
        stockName: "NOCIL Ltd.",
        symbol: "NOCIL",
        tradingSymbol: "NOCIL",
        currentPrice: 280.00, // Replace with actual current price
        priceHistory: [{ date: new Date(), price: 280.00 }], // Replace with actual price history
    },
];

const NewsCarousel = ({ stocks }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const generateNewsWithAI = async (stocks) => {
    try {
      const generatedNews = stocks.map((stock) => {
        const priceChange = (Math.random() * 6 - 3).toFixed(2);
        const isPositive = Number.parseFloat(priceChange) > 0;

        const headlines = [
          `${stock.stockName} ${isPositive ? "Rises" : "Falls"} ${Math.abs(
            priceChange
          )}% Amid ${isPositive ? "Strong" : "Weak"} Quarterly Results`,
          `Analysts ${isPositive ? "Upgrade" : "Downgrade"} ${
            stock.stockName
          } (${stock.symbol}) to ${isPositive ? "Buy" : "Hold"}`,
          `${stock.stockName} Announces ${
            isPositive ? "Expansion" : "Restructuring"
          } Plans, Stock ${isPositive ? "Jumps" : "Drops"}`,
          `${stock.stockName} ${
            isPositive ? "Beats" : "Misses"
          } Market Expectations, Shares ${isPositive ? "Rally" : "Decline"}`,
          `New Product Launch from ${stock.stockName} Receives ${
            isPositive ? "Positive" : "Mixed"
          } Market Response`,
        ];

        const randomHeadline =
          headlines[Math.floor(Math.random() * headlines.length)];

        return {
          id: stock.symbol,
          headline: randomHeadline,
          source: [
            "Bloomberg",
            "CNBC",
            "Reuters",
            "Financial Times",
            "Wall Street Journal",
          ][Math.floor(Math.random() * 5)],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sentiment: isPositive ? "positive" : "negative",
          stockSymbol: stock.symbol,
        };
      });

      return generatedNews;
    } catch (error) {
      console.error("Error generating news:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const news = await generateNewsWithAI(stocks);
      setNewsItems(news);
      setLoading(false);
    };

    fetchNews();
  }, [stocks]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (newsItems.length > 0) {
        setActiveIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: activeIndex * carouselRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-xl overflow-hidden flex items-center justify-center h-24">
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
            <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-xl overflow-hidden">
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Newspaper className="h-4 w-4 mr-2 text-purple-400" />
            <h3 className="font-medium">Trending Market News</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs text-gray-400">
              {activeIndex + 1} / {newsItems.length}
            </div>
            <button
              onClick={handleNext}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${newsItems.length * 100}%`,
              transform: `translateX(-${
                (activeIndex / newsItems.length) * 100
              }%)`,
            }}
          >
            {newsItems.map((item, index) => (
              <div
                key={item.id}
                className="w-full"
                style={{ width: `${100 / newsItems.length}%` }}
              >
                <div
                  className={`p-3 rounded-lg ${
                    item.sentiment === "positive"
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      className={
                        item.sentiment === "positive"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }
                    >
                      {item.stockSymbol}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-400">
                      <span className="mr-2">{item.source}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-sm">{item.headline}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Stock Market Insights",
    tags: "",
  });
  const [stocks, setStocks] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize mock socket
    socketRef.current = mockSocket;
    setIsConnected(true);

    // Set up event listeners
    socketRef.current.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Mock initial messages
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          user: "JaneDoe",
          text: "What do you all think about the recent Fed announcement?",
          timestamp: "10:30 AM",
        },
        {
          id: 2,
          user: "InvestorPro",
          text: "I think it signals they're concerned about inflation more than growth now.",
          timestamp: "10:32 AM",
        },
        {
          id: 3,
          user: "MarketWatcher",
          text: "Agreed. The language was more hawkish than I expected.",
          timestamp: "10:35 AM",
        },
      ]);
    }, 1000);

    // Fetch mock stock data
    setStocks(mockStockData);

    return () => {
      // Clean up
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const message = {
      id: messages.length + 1,
      user: "You",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socketRef.current.emit("message", message);
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  const handleNewPost = (e) => {
    e.preventDefault();
    setShowNewPostDialog(false);

    const newDiscussion = {
      id: discussionThreads.length + 1,
      author: "You",
      avatar: "/placeholder.svg?height=40&width=40",
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      tags: newPost.tags.split(",").map((tag) => tag.trim()),
    };

    socketRef.current.emit("newPost", newDiscussion);

    setNewPost({
      title: "",
      content: "",
      category: "Stock Market Insights",
      tags: "",
    });
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-900 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 lg:mb-0">Investor Community</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              className="pl-9 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/30"
            />
          </div>

          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] hover:scale-105">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-bl from-purple-900/90 via-gray-900/95 to-indigo-900/90 border border-white/10 shadow-xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share your thoughts, questions, or insights with the
                  community.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewPost} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Title
                  </label>
                  <Input
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    placeholder="Enter a descriptive title"
                    className="w-full bg-white/5 border-white/10 focus:border-purple-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="Stock Market Insights">
                      Stock Market Insights
                    </option>
                    <option value="ETFs & Mutual Funds">
                      ETFs & Mutual Funds
                    </option>
                    <option value="Gold Bonds & Safe Investments">
                      Gold Bonds & Safe Investments
                    </option>
                    <option value="Retail Investment Strategies">
                      Retail Investment Strategies
                    </option>
                    <option value="Financial Advisors & Recommendations">
                      Financial Advisors & Recommendations
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    placeholder="Share your thoughts, questions, or insights..."
                    className="w-full h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Tags (comma separated)
                  </label>
                  <Input
                    value={newPost.tags}
                    onChange={(e) =>
                      setNewPost({ ...newPost, tags: e.target.value })
                    }
                    placeholder="e.g., stocks, retirement, ETFs"
                    className="w-full bg-white/5 border-white/10 focus:border-purple-500/50"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewPostDialog(false)}
                    className="border-white/10 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Add the NewsCarousel component here */}
      <div className="mb-6">
        <NewsCarousel stocks={stocks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="relative bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/20 via-fuchsia-500/10 to-indigo-500/20"></div>
            <div className="relative z-10">
              <h3 className="font-medium mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 mr-3 text-purple-400" />
                    <span>Stock Market Insights</span>
                    <Badge className="ml-auto bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                      128
                    </Badge>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <BarChart4 className="h-4 w-4 mr-3 text-blue-400" />
                    <span>ETFs & Mutual Funds</span>
                    <Badge className="ml-auto bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
                      94
                    </Badge>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-3 text-yellow-400" />
                    <span>Gold Bonds & Safe Investments</span>
                    <Badge className="ml-auto bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">
                      76
                    </Badge>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Briefcase className="h-4 w-4 mr-3 text-green-400" />
                    <span>Retail Investment Strategies</span>
                    <Badge className="ml-auto bg-green-500/20 text-green-300 hover:bg-green-500/30">
                      112
                    </Badge>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Users className="h-4 w-4 mr-3 text-red-400" />
                    <span>Financial Advisors</span>
                    <Badge className="ml-auto bg-red-500/20 text-red-300 hover:bg-red-500/30">
                      68
                    </Badge>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="relative bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-indigo-500/20 via-blue-500/10 to-cyan-500/20"></div>
            <div className="relative z-10">
              <h3 className="font-medium mb-3 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                Trending Topics
              </h3>
              <ul className="space-y-3">
                {trendingTopics.map((topic) => (
                  <li key={topic.id}>
                    <a
                      href="#"
                      className="block p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                          {topic.category}
                        </span>
                        <div className="flex items-center text-xs text-gray-400">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {topic.comments}
                        </div>
                      </div>
                      <h4 className="font-medium text-sm">{topic.title}</h4>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resource Library Preview */}
          <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-purple-400" />
                  Resource Library
                </h3>
                <Button
                  variant="link"
                  className="text-xs text-purple-400 p-0 h-auto"
                >
                  View All
                </Button>
              </div>
              <ul className="space-y-2">
                {resourceLibrary.slice(0, 3).map((resource) => (
                  <li key={resource.id}>
                    <a
                      href="#"
                      className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <resource.icon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">
                          {resource.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-400 mt-0.5">
                          <span className="mr-2">{resource.type}</span>
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span>{resource.rating}</span>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            defaultValue="discussions"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full bg-white/5 p-1 rounded-lg">
              <TabsTrigger
                value="discussions"
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger
                value="experts"
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
              >
                <Award className="h-4 w-4 mr-2" />
                Expert Insights
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
              >
                <Zap className="h-4 w-4 mr-2" />
                Live Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 border-white/10 bg-white/5 hover:bg-white/10"
                      >
                        Latest
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-white/10">
                      <DropdownMenuItem>Latest</DropdownMenuItem>
                      <DropdownMenuItem>Most Popular</DropdownMenuItem>
                      <DropdownMenuItem>Most Commented</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {discussionThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="relative bg-gradient-to-bl from-purple-900/30 via-gray-900/60 to-indigo-900/30 p-5 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/10 via-fuchsia-500/5 to-indigo-500/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3 border border-white/10">
                        <AvatarImage src={thread.avatar} alt={thread.author} />
                        <AvatarFallback>
                          {thread.author.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{thread.author}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {thread.timestamp}
                            </span>
                          </div>
                          <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                            {thread.category}
                          </Badge>
                        </div>
                        <h3 className="font-medium mt-1">{thread.title}</h3>
                        <p className="text-sm text-gray-300 mt-2">
                          {thread.content}
                        </p>

                        {thread.isPoll && (
                          <div className="mt-4 space-y-3">
                            {thread.pollOptions.map((option, index) => {
                              const totalVotes = thread.pollOptions.reduce(
                                (sum, opt) => sum + opt.votes,
                                0
                              );
                              const percentage = Math.round(
                                (option.votes / totalVotes) * 100
                              );

                              return (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{option.option}</span>
                                    <span>
                                      {percentage}% ({option.votes})
                                    </span>
                                  </div>
                                  <Progress
                                    value={percentage}
                                    className="h-2 bg-white/10"
                                    indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500"
                                  />
                                </div>
                              );
                            })}
                            <div className="text-xs text-gray-400 mt-2">
                              Total votes:{" "}
                              {thread.pollOptions.reduce(
                                (sum, opt) => sum + opt.votes,
                                0
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center mt-4 space-x-4">
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {thread.likes}
                          </button>
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {thread.comments}
                          </button>
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </button>
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors ml-auto">
                            <Bookmark className="h-4 w-4 mr-1" />
                            Save
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {thread.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-white/5 hover:bg-white/10 border-white/10 text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300">
                Load More Discussions
              </Button>
            </TabsContent>

            <TabsContent value="experts" className="mt-6 space-y-4">
              {expertInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="relative bg-gradient-to-bl from-blue-900/30 via-gray-900/60 to-indigo-900/30 p-5 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-purple-500/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start">
                      <div className="relative">
                        <Avatar className="h-10 w-10 mr-3 border border-white/10">
                          <AvatarImage
                            src={insight.avatar}
                            alt={insight.author}
                          />
                          <AvatarFallback>
                            {insight.author.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {insight.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {insight.author}
                            </span>
                            <span className="text-xs text-blue-400 ml-2">
                              {insight.role}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {insight.timestamp}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-medium mt-1">{insight.title}</h3>
                        <p className="text-sm text-gray-300 mt-2">
                          {insight.preview}
                        </p>

                        <div className="flex items-center mt-4 space-x-4">
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {insight.likes}
                          </button>
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {insight.comments}
                          </button>
                          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </button>
                          <button className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors ml-auto">
                            Read More
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300">
                View More Expert Insights
              </Button>
            </TabsContent>

            <TabsContent value="live" className="mt-6">
              <div className="relative bg-gradient-to-bl from-purple-900/30 via-gray-900/60 to-indigo-900/30 rounded-xl overflow-hidden">
                <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/10 via-fuchsia-500/5 to-indigo-500/10"></div>
                <div className="relative z-10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      <h3 className="font-medium">Live Market Discussion</h3>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300">
                      {isConnected ? "Connected" : "Connecting..."}
                    </Badge>
                  </div>

                  <div className="h-80 overflow-y-auto mb-4 p-3 bg-black/20 rounded-lg">
                    {messages.map((msg) => (
                      <div key={msg.id} className="mb-3">
                        <div className="flex items-start">
                          <div className="font-medium text-sm mr-2">
                            {msg.user}:
                          </div>
                          <div className="text-sm text-gray-300 flex-1">
                            {msg.text}
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/5 border-white/10 focus:border-purple-500/50"
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile */}
          <div className="relative bg-gradient-to-bl from-indigo-900/50 via-gray-900/80 to-blue-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-indigo-500/20 via-blue-500/10 to-cyan-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3 border border-white/10">
                  <AvatarImage
                    src="/placeholder.svg?height=48&width=48"
                    alt="Your Profile"
                  />
                  <AvatarFallback>YP</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Your Profile</h3>
                  <p className="text-sm text-gray-400">Retail Investor</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-lg font-medium">24</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-lg font-medium">156</div>
                  <div className="text-xs text-gray-400">Comments</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <div className="text-lg font-medium">38</div>
                  <div className="text-xs text-gray-400">Saved</div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 hover:bg-white/10"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="relative bg-gradient-to-bl from-fuchsia-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-fuchsia-500/20 via-pink-500/10 to-purple-500/20"></div>
            <div className="relative z-10">
              <h3 className="font-medium mb-3 flex items-center">
                <Bell className="h-4 w-4 mr-2 text-purple-400" />
                Recent Activity
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <MessageCircle className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Michael Chen</span> replied
                      to your comment on{" "}
                      <a href="#" className="text-purple-400 hover:underline">
                        ETF comparison thread
                      </a>
                    </p>
                    <span className="text-xs text-gray-400">
                      15 minutes ago
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <ThumbsUp className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Sarah Johnson</span> liked
                      your post about{" "}
                      <a href="#" className="text-purple-400 hover:underline">
                        retirement planning
                      </a>
                    </p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <Award className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm">
                      Your comment was marked as helpful in{" "}
                      <a href="#" className="text-purple-400 hover:underline">
                        Gold vs Bitcoin discussion
                      </a>
                    </p>
                    <span className="text-xs text-gray-400">Yesterday</span>
                  </div>
                </div>
              </div>

              <Button
                variant="link"
                className="text-sm text-purple-400 p-0 h-auto mt-3"
              >
                View All Activity
              </Button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
            <div className="relative z-10">
              <h3 className="font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-violet-400" />
                Upcoming Events
              </h3>

              <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        Fed Interest Rate Decision
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        March 26, 2025 • 2:00 PM ET
                      </p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      Important
                    </Badge>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        Webinar: ETF Selection Strategies
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        March 28, 2025 • 1:00 PM ET
                      </p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300">
                      Webinar
                    </Badge>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        Q1 Earnings Season Begins
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        April 10, 2025
                      </p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      Earnings
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="link"
                className="text-sm text-purple-400 p-0 h-auto mt-3"
              >
                View Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
