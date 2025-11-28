"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PricingPlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  isPopular?: boolean;
  delay: number;
  onGetStarted: () => void;
}

const PricingCard: React.FC<PricingPlanProps> = ({
  name,
  price,
  period,
  description,
  features,
  icon,
  isPopular,
  delay,
  onGetStarted,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className={cn("relative", isPopular && "md:-mt-4 md:mb-4")}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
          Most Popular
        </div>
      </div>
    )}
    
    <Card 
      className={cn(
        "relative h-full bg-slate-900/50 backdrop-blur-xl border-slate-800 transition-all duration-300 overflow-hidden",
        isPopular ? "border-blue-500/50 shadow-lg shadow-blue-500/10" : "hover:border-slate-700"
      )} 
      padding="none"
    >
      {isPopular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      )}
      
      <div className="relative p-6 md:p-8">
        {/* Icon & Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isPopular 
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
              : "bg-slate-800 text-blue-400"
          )}>
            {icon}
          </div>
          <h3 className="text-xl font-display font-bold text-white">{name}</h3>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-4xl md:text-5xl font-bold text-white">{price}</span>
          <span className="text-slate-400 ml-2">{period}</span>
        </div>

        {/* Description */}
        <p className="text-slate-400 mb-6">{description}</p>

        {/* CTA Button */}
        <Button
          onClick={onGetStarted}
          className={cn(
            "w-full mb-6",
            isPopular 
              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25" 
              : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          )}
        >
          Get Started
        </Button>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                isPopular ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400"
              )}>
                <Check className="w-3 h-3" />
              </div>
              <span className="text-slate-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  </motion.div>
);

interface PricingProps {
  onGetStarted: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onGetStarted }) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with basic learning tools.",
      icon: <Sparkles className="w-5 h-5" />,
      features: [
        "5 AI-assisted lessons per month",
        "Basic spaced repetition",
        "Community forums access",
        "Progress tracking",
        "Mobile app access",
      ],
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "Unlock the full power of AI-enhanced learning.",
      icon: <Zap className="w-5 h-5" />,
      isPopular: true,
      features: [
        "Unlimited AI lessons",
        "Advanced spaced repetition",
        "Memory palace builder",
        "Deep work mode with sounds",
        "Priority AI tutor access",
        "Detailed analytics dashboard",
        "Cross-domain connections",
      ],
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "/month",
      description: "For teams and organizations serious about learning.",
      icon: <Crown className="w-5 h-5" />,
      features: [
        "Everything in Pro",
        "Team collaboration tools",
        "Custom learning paths",
        "Admin dashboard",
        "API access",
        "Dedicated support",
        "White-label options",
      ],
    },
  ];

  return (
    <section id="pricing" className="relative py-20 md:py-32 bg-slate-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Learning Plan
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              {...plan}
              delay={index * 0.1}
              onGetStarted={onGetStarted}
            />
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400">
            🔒 30-day money-back guarantee • No credit card required for free plan
          </p>
        </motion.div>
      </div>
    </section>
  );
};
