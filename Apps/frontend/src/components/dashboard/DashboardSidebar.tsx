import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SenderPreview {
  id: string;
  name: string;
  platform: string;
  lastMessageTime: string;
  status: "online" | "offline" | "away";
  unread: number;
}

const mockSenders: SenderPreview[] = [
  { id: "1", name: "John Smith", platform: "WhatsApp", lastMessageTime: "2 min ago", status: "online", unread: 3 },
  { id: "2", name: "Sarah Connor", platform: "Telegram", lastMessageTime: "15 min ago", status: "online", unread: 0 },
  { id: "3", name: "Mike Johnson", platform: "Messenger", lastMessageTime: "1 hour ago", status: "away", unread: 1 },
  { id: "4", name: "Emily Davis", platform: "Slack", lastMessageTime: "3 hours ago", status: "offline", unread: 0 },
  { id: "5", name: "Alex Brown", platform: "WhatsApp", lastMessageTime: "Yesterday", status: "offline", unread: 0 },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Senders", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface DashboardSidebarProps {
  selectedSender: string | null;
  onSelectSender: (id: string) => void;
}

const DashboardSidebar = ({ selectedSender, onSelectSender }: DashboardSidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "WhatsApp": return "bg-green-500";
      case "Telegram": return "bg-blue-500";
      case "Messenger": return "bg-primary";
      case "Slack": return "bg-purple-500";
      default: return "bg-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-80"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-foreground">Agent App</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              location.pathname === item.path
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Senders List */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground">Message Senders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{mockSenders.length} active</p>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {mockSenders.map((sender, index) => (
              <motion.button
                key={sender.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectSender(sender.id)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all duration-200",
                  selectedSender === sender.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                      {sender.name.charAt(0)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                      getStatusColor(sender.status)
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{sender.name}</span>
                      {sender.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                          {sender.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("w-2 h-2 rounded-full", getPlatformColor(sender.platform))} />
                      <span className="text-xs text-muted-foreground truncate">{sender.platform}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{sender.lastMessageTime}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Log Out</span>}
        </Link>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
