"use client";

import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: 'grain',
    title: 'Quantum-Enhanced Algorithms',
    description: 'Advanced algorithms for deeper understanding.',
  },
  {
    icon: 'groups',
    title: 'Multi-Agent AI Tutors',
    description: 'Your personal team of AI experts.',
  },
  {
    icon: 'account_tree',
    title: 'Personalized Learning Paths',
    description: 'Tailored educational journeys just for you.',
  },
];

export const Features: React.FC = () => {
  return (
    <>
      {/* Section Header */}
      <div className="px-4 pb-3 pt-12">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Why PolyMathOS?</h2>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 p-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-1 flex-col gap-3 rounded-xl border border-[#333333] bg-[#1a1a1a] p-4 transition-colors hover:border-primary/50"
          >
            <span className="material-symbols-outlined text-primary">{feature.icon}</span>
            <div className="flex flex-col gap-1">
              <h3 className="text-white text-base font-bold leading-tight">{feature.title}</h3>
              <p className="text-[#B3B3B3] text-sm font-normal leading-normal">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};
