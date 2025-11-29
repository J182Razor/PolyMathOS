"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PricingPlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: string;
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
        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white text-sm font-semibold">
          Most Popular
        </div>
      </div>
    )}
    
    <Card 
      className={cn(
        "relative h-full bg-surface-dark backdrop-blur-xl border border-white/10 transition-all duration-300 overflow-hidden",
        isPopular ? "border-primary/50 shadow-lg shadow-primary/10" : "hover:border-white/20"
      )} 
      padding="none"
    >
      {isPopular && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
      )}
      
      <div className="relative p-6 md:p-8">
        {/* Icon & Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isPopular 
              ? "bg-gradient-to-r from-primary to-purple-500 text-white" 
              : "bg-background-dark text-primary"
          )}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <h3 className="text-xl font-display font-bold text-white">{name}</h3>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-4xl md:text-5xl font-bold text-white">{price}</span>
          <span className="text-text-secondary-dark ml-2">{period}</span>
        </div>

        {/* Description */}
        <p className="text-text-secondary-dark mb-6">{description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              <span className="text-text-primary-dark text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          onClick={onGetStarted}
          className={cn(
            "w-full",
            isPopular
              ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white"
              : "bg-background-dark border border-white/10 hover:border-primary/50 text-white"
          )}
        >
          Get Started
        </Button>
      </div>
    </Card>
  </motion.div>
);

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started with AI-powered learning',
    features: [
      '5 learning sessions per month',
      'Basic spaced repetition',
      'Progress tracking',
      'Community support',
    ],
    icon: 'rocket_launch',
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For serious learners who want to accelerate their growth',
    features: [
      'Unlimited learning sessions',
      'Advanced spaced repetition',
      'Memory palace builder',
      'AI tutor access',
      'Priority support',
      'Advanced analytics',
    ],
    icon: 'stars',
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
    ],
    icon: 'workspace_premium',
    isPopular: false,
  },
];

interface PricingProps {
  onGetStarted: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onGetStarted }) => {
  return (
    <section id="pricing" className="relative py-20 md:py-32 bg-background-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="material-symbols-outlined text-primary">payments</span>
            <span className="text-sm text-primary font-medium">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Learning Path
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary-dark max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No credit card required.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              {...plan}
              delay={index * 0.1}
              onGetStarted={onGetStarted}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
