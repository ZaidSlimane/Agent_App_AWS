import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowShapeProps {
  variant?: "primary" | "secondary" | "accent";
  className?: string;
  size?: "sm" | "md" | "lg";
  blur?: "sm" | "md" | "lg";
}

const GlowShape = ({ 
  variant = "primary", 
  className,
  size = "md",
  blur = "md"
}: GlowShapeProps) => {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96"
  };

  const blurClasses = {
    sm: "blur-2xl",
    md: "blur-3xl",
    lg: "blur-[100px]"
  };

  const colorClasses = {
    primary: "bg-primary/30",
    secondary: "bg-secondary/30",
    accent: "bg-accent/25"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={cn(
        "absolute rounded-full pointer-events-none animate-glow-pulse",
        sizeClasses[size],
        blurClasses[blur],
        colorClasses[variant],
        className
      )}
    />
  );
};

export default GlowShape;
