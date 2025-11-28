"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, animate, useMotionTemplate } from "framer-motion";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Play } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface HeroProps {
  onStartJourney: () => void;
}

// Floating Particles Component
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Background Pattern Component
const BGPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn("absolute inset-0 z-0", className)}
      style={{
        backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), 
                         linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
      }}
    />
  );
};

// Stats Card Component
interface StatsCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-blue-500/50 transition-all duration-300 group" padding="none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-6 flex flex-col items-center text-center space-y-2">
          <div className="text-blue-400 mb-2">{icon}</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {value}
          </div>
          <div className="text-sm text-slate-400">{label}</div>
        </div>
      </Card>
    </motion.div>
  );
};

export const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  const [mounted, setMounted] = useState(false);
  const color = useMotionValue("#3b82f6");

  useEffect(() => {
    setMounted(true);
    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#3b82f6"];
    animate(color, colors, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundGradient = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #0f172a 50%, ${color})`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <motion.section
      style={{ backgroundImage: backgroundGradient }}
      className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <BGPattern />
        <FloatingParticles />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-300">
                AI-Powered Learning Revolution
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 font-display">
              <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Transform Your Learning
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                in 30 Seconds
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              AI + Neuroscience + AR/VR to boost retention by{" "}
              <span className="font-bold text-blue-400">300%</span>. 
              Experience personalized learning that adapts to your brain.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Button
              size="lg"
              onClick={onStartJourney}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800/50 hover:border-slate-600 text-white px-8 py-6 text-lg font-semibold"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
          >
            <StatsCard
              icon={<BookOpen className="w-7 h-7 md:w-8 md:h-8" />}
              value="300%"
              label="Faster Learning"
              delay={0.8}
            />
            <StatsCard
              icon={<Users className="w-7 h-7 md:w-8 md:h-8" />}
              value="50K+"
              label="Active Learners"
              delay={0.9}
            />
            <StatsCard
              icon={<Award className="w-7 h-7 md:w-8 md:h-8" />}
              value="95%"
              label="Retention Rate"
              delay={1.0}
            />
            <StatsCard
              icon={<TrendingUp className="w-7 h-7 md:w-8 md:h-8" />}
              value="4.9/5"
              label="User Rating"
              delay={1.1}
            />
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3 mt-16"
          >
            {[
              "Spaced Repetition",
              "AI Tutoring",
              "Memory Palaces",
              "Deep Work Mode",
              "Adaptive Paths",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm text-sm text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all duration-300 cursor-default"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </motion.section>
  );
};
