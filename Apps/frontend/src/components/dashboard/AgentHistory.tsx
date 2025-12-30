import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  MessageSquare,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  timestamp: string;
  platform: string;
  content: string;
  agentResponse: string;
  status: "delivered" | "pending" | "failed";
}

const mockMessages: Message[] = [
  {
    id: "1",
    timestamp: "Today, 2:45 PM",
    platform: "WhatsApp",
    content: "Hi, I need help with my order #12345",
    agentResponse: "Hello! I'd be happy to help you with your order. Let me look that up for you.",
    status: "delivered"
  },
  {
    id: "2",
    timestamp: "Today, 2:43 PM",
    platform: "WhatsApp",
    content: "When will my package arrive?",
    agentResponse: "Your package is currently in transit and should arrive within 2-3 business days.",
    status: "delivered"
  },
  {
    id: "3",
    timestamp: "Today, 2:40 PM",
    platform: "WhatsApp",
    content: "Can I change my delivery address?",
    agentResponse: "Yes, you can update your delivery address. Please provide the new address.",
    status: "pending"
  },
  {
    id: "4",
    timestamp: "Yesterday, 5:30 PM",
    platform: "WhatsApp",
    content: "Thanks for the quick response!",
    agentResponse: "You're welcome! Let us know if you need anything else.",
    status: "delivered"
  },
];

interface AgentHistoryProps {
  senderId: string | null;
}

const AgentHistory = ({ senderId }: AgentHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const stats = [
    { label: "Total Messages", value: "1,234", icon: MessageSquare, change: "+12%" },
    { label: "Avg Response Time", value: "2.4s", icon: Clock, change: "-8%" },
    { label: "Success Rate", value: "98.5%", icon: TrendingUp, change: "+2%" },
  ];

  if (!senderId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Select a Sender</h3>
          <p className="text-muted-foreground mt-1">Choose a sender from the sidebar to view their history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent History</h1>
            <p className="text-muted-foreground mt-1">Conversation history with selected sender</p>
          </div>
          <Button variant="default" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  stat.change.startsWith("+") ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
                )}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="messenger">Messenger</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {mockMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{message.timestamp}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {message.platform}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(message.status)}
                  <span className="text-xs text-muted-foreground capitalize">{message.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">User Message</p>
                  <p className="text-foreground">{message.content}</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <p className="text-xs text-primary mb-1">Agent Response</p>
                  <p className="text-foreground">{message.agentResponse}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentHistory;
