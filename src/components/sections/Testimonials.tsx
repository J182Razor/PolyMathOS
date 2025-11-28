"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  delay: number;
}

const TestimonialCard: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  avatar,
  rating,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
  >
    <Card className="relative h-full bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-blue-500/30 transition-all duration-300 overflow-hidden" padding="none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 md:p-8">
        {/* Quote Icon */}
        <Quote className="w-8 h-8 text-blue-500/30 mb-4" />
        
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
              )}
            />
          ))}
        </div>

        {/* Quote */}
        <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
          "{quote}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-white">{author}</p>
            <p className="text-sm text-slate-400">{role}</p>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const testimonials = [
  {
    quote: "PolyMathOS transformed my study habits. I went from struggling to remember basics to acing my exams. The spaced repetition is like magic!",
    author: "Sarah Chen",
    role: "Medical Student",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "As a lifelong learner, I've tried dozens of apps. Nothing comes close to the personalized experience here. My retention has improved by 200%.",
    author: "Marcus Johnson",
    role: "Software Engineer",
    avatar: "MJ",
    rating: 5,
  },
  {
    quote: "The AI tutor feels like having a genius professor available 24/7. It adapts perfectly to my learning pace and style.",
    author: "Elena Rodriguez",
    role: "MBA Candidate",
    avatar: "ER",
    rating: 5,
  },
  {
    quote: "I learned more in 3 months than I did in 3 years of self-study. The cross-domain connections have made me a better problem solver.",
    author: "David Park",
    role: "Entrepreneur",
    avatar: "DP",
    rating: 5,
  },
  {
    quote: "The memory palace feature is incredible. I memorized 500 vocabulary words in Japanese in just 2 weeks. Game changer!",
    author: "Lisa Thompson",
    role: "Language Learner",
    avatar: "LT",
    rating: 5,
  },
  {
    quote: "Finally, a learning platform that understands neuroscience. The dopamine-based reward system keeps me motivated every day.",
    author: "James Wilson",
    role: "Neuroscience PhD",
    avatar: "JW",
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="relative py-20 md:py-32 bg-slate-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
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
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">
              Trusted by 50,000+ Learners
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            What Our{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Community
            </span>{' '}
            Says
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Join thousands of learners who have transformed their learning journey.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              {...testimonial}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
