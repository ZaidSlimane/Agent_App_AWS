import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlowShape from "@/components/GlowShape";
import FeatureCard from "@/components/FeatureCard";
import { MessageSquare, Users, BarChart3, Zap, Shield, Globe } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Unified Messaging",
      description: "Connect all your messaging platforms in one centralized dashboard."
    },
    {
      icon: Users,
      title: "Sender Management",
      description: "Track and manage all message senders with detailed profiles."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Visualize response times, message volume, and performance metrics."
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Integrate with n8n for powerful automated response workflows."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for all your messaging data."
    },
    {
      icon: Globe,
      title: "Multi-Platform",
      description: "Support for WhatsApp, Telegram, Slack, and Messenger."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Glow Shapes */}
      <GlowShape variant="primary" size="lg" blur="lg" className="top-0 -right-32 animate-float" />
      <GlowShape variant="secondary" size="md" blur="lg" className="top-1/3 -left-16 animate-float-delayed" />
      <GlowShape variant="accent" size="sm" blur="md" className="bottom-1/4 right-1/4 animate-float" />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Agent App</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/auth?mode=signup">Sign Up</Link>
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Modern Agent Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Track & Manage Your{" "}
            <span className="gradient-text">Messaging</span>{" "}
            Interactions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            A powerful platform to centralize, analyze, and automate your messaging workflows across all major platforms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?mode=signup">Get Started Free</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/dashboard">View Demo</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features to help you manage messaging interactions at scale
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.5 + index * 0.1}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          © 2024 Agent App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
