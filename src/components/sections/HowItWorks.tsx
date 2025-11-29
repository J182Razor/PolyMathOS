"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface StepProps {
  number: number;
  icon: string;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, icon, title, description, isLast }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay: number * 0.15 }}
    className="relative flex flex-col items-center text-center"
  >
    {/* Connection Line - Desktop */}
    {!isLast && (
      <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50" />
    )}
    
    {/* Step Number */}
    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl mb-6 bg-surface-dark border border-white/10 flex items-center justify-center group hover:border-primary/50 transition-all duration-300">
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-white">
        {number}
      </div>
      <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </span>
    </div>

    {/* Content */}
    <h3 className="text-lg md:text-xl font-display font-semibold text-white mb-2">
      {title}
    </h3>
    <p className="text-sm md:text-base text-text-secondary-dark max-w-xs">
      {description}
    </p>
  </motion.div>
);

const steps = [
  {
    icon: 'person_add',
    title: "Create Your Profile",
    description: "Take our cognitive assessment to understand your learning style and current knowledge level.",
  },
  {
    icon: 'explore',
    title: "Choose Your Path",
    description: "Select your domains of interest and let AI create a personalized learning curriculum.",
  },
  {
    icon: 'rocket_launch',
    title: "Learn & Practice",
    description: "Engage with interactive lessons, flashcards, and deep work sessions optimized for retention.",
  },
  {
    icon: 'emoji_events',
    title: "Track & Achieve",
    description: "Monitor your progress, earn achievements, and watch your expertise grow exponentially.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-20 md:py-32 bg-background-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
            <span className="material-symbols-outlined text-purple-400">explore</span>
            <span className="text-sm text-purple-300 font-medium">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            How{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              PolyMathOS
            </span>{' '}
            Works
          </h2>
          <p className="text-lg md:text-xl text-text-secondary-dark max-w-2xl mx-auto">
            Get started in minutes and transform your learning journey forever.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((step, index) => (
            <Step
              key={step.title}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
