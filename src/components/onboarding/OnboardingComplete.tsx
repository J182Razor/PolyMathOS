import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingCompleteProps {
  program: any;
  onStartLearning: (program: any) => void;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ program, onStartLearning }) => {
  return (
    <motion.div 
      className="poly-card poly-card-elevated max-w-2xl mx-auto text-center px-6 py-8 md:p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-poly-success to-poly-accent-500 rounded-2xl mx-auto mb-6 sm:mb-8 flex items-center justify-center">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h2 className="text-2xl sm:text-display-2 mb-3 sm:mb-4 text-poly-text-primary">Ready to Learn!</h2>
      
      <p className="text-sm sm:text-body-large text-poly-text-secondary mb-2">
        Congratulations, {program.name ? program.name.split("'")[0] : 'Learner'}! Your personalized learning program is ready.
      </p>
      
      <p className="text-sm sm:text-body-medium text-poly-text-secondary mb-6 sm:mb-8">
        We've discovered {program.paths?.[0]?.resources || 0} resources and created a {program.paths?.[0]?.duration || 8}-week learning path in {program.paths?.[0]?.domain || 'your selected domains'}.
      </p>
      
      <div className="bg-poly-primary-50 dark:bg-poly-primary-900/20 border border-poly-primary-200 dark:border-poly-primary-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-heading-3 text-poly-primary-800 dark:text-poly-primary-200 mb-3">Your First Steps</h3>
        <ul className="text-left space-y-2 text-sm sm:text-body-medium text-poly-primary-700 dark:text-poly-primary-300">
          <li className="flex items-start">
            <div className="w-5 h-5 rounded-full bg-poly-primary-500 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Week 1: Foundations of {program.paths?.[0]?.domain || 'your subject'}
          </li>
          <li className="flex items-start">
            <div className="w-5 h-5 rounded-full bg-poly-primary-500 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Access curated resources and interactive exercises
          </li>
          <li className="flex items-start">
            <div className="w-5 h-5 rounded-full bg-poly-primary-500 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Track your progress with our AI-powered insights
          </li>
        </ul>
      </div>
      
      <button
        onClick={() => onStartLearning(program)}
        className="poly-btn-primary w-full mb-4"
      >
        Begin Learning Journey
      </button>
      
      <button className="poly-btn-secondary w-full">
        Explore More Paths
      </button>
    </motion.div>
  );
};

export default OnboardingComplete;

