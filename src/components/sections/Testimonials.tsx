"use client";

import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "PolyMathOS has fundamentally changed my approach to complex problem-solving. The AI tutors are unparalleled.",
    author: "Dr. Anya Sharma",
    role: "Quantum Physics PhD",
  },
  {
    quote: "The personalized learning paths are incredibly adaptive. It's like having a curriculum designed just for your brain.",
    author: "Ben Carter",
    role: "Lead AI Researcher",
  },
  {
    quote: "A revolutionary tool for lifelong learners. It pushes the boundaries of what digital education can be.",
    author: "Javier Rojas",
    role: "EdTech Innovator",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <>
      {/* Section Header */}
      <div className="px-4 pb-3 pt-12">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Trusted by Tomorrow's Leaders</h2>
      </div>

      {/* Testimonials Carousel */}
      <div className="flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex w-full shrink-0 snap-center flex-col gap-4 rounded-xl border border-[#333333] bg-[#1a1a1a] p-6 sm:w-4/5 md:w-2/3"
          >
            <p className="text-white italic">"{testimonial.quote}"</p>
            <div className="flex flex-col">
              <p className="text-white font-bold">{testimonial.author}</p>
              <p className="text-[#B3B3B3] text-sm">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};
