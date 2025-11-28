"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Zap, Target, Layers, Sparkles, 
  Clock, BarChart3, Palette
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  delay 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className="group"
  >
    <Card className="relative h-full bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-blue-500/50 transition-all duration-300 overflow-hidden" padding="none">
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 md:p-8">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-xl mb-4 md:mb-6",
          "flex items-center justify-center",
          "bg-gradient-to-br from-slate-800 to-slate-900",
          "border border-slate-700 group-hover:border-blue-500/50",
          "transition-all duration-300"
        )}>
          <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg md:text-xl font-display font-semibold text-white mb-2 md:mb-3">
          {title}
        </h3>
        <p className="text-sm md:text-base text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  </motion.div>
);

const features = [
  {
    icon: <Brain className="w-6 h-6 md:w-7 md:h-7" />,
    title: "AI-Powered Learning",
    description: "Our AI adapts to your learning style, identifying knowledge gaps and creating personalized study paths.",
  },
  {
    icon: <Zap className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Spaced Repetition",
    description: "Scientifically-proven algorithms ensure you review content at optimal intervals for maximum retention.",
  },
  {
    icon: <Target className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Memory Palaces",
    description: "Build virtual memory palaces using ancient techniques combined with modern visualization.",
  },
  {
    icon: <Layers className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Interleaved Practice",
    description: "Mix different topics and skills for deeper understanding and better problem-solving abilities.",
  },
  {
    icon: <Clock className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Deep Work Sessions",
    description: "Structured focus blocks with ambient soundscapes and distraction blocking for peak productivity.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Progress Analytics",
    description: "Detailed insights into your learning patterns, strengths, and areas for improvement.",
  },
  {
    icon: <Sparkles className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Reward System",
    description: "Gamified learning with dopamine-optimized rewards to maintain motivation and engagement.",
  },
  {
    icon: <Palette className="w-6 h-6 md:w-7 md:h-7" />,
    title: "Cross-Domain Learning",
    description: "Connect concepts across different fields to develop true polymathic understanding.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-20 md:py-32 bg-slate-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Master Any Skill
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Built on neuroscience research and powered by AI to accelerate your learning journey.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-slate-400 mb-6">
            And many more features to supercharge your learning...
          </p>
          <a 
            href="#pricing" 
            className="inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors"
          >
            Explore all features
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
