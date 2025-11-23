import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onNext: (data: { userName: string }) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [userName, setUserName] = useState('');

  return (
    <motion.div 
      className="poly-card poly-card-elevated max-w-2xl mx-auto px-6 py-8 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-poly-primary-500 to-poly-secondary-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-display-2 mb-4">Welcome to PolyMathOS</h1>
        <p className="text-body-large text-poly-neutral-600 max-w-lg mx-auto">
          Your intelligent learning companion that discovers, organizes, and personalizes educational content from across the web.
        </p>
      </div>

      <div className="mb-8">
        <label className="block text-body-medium text-poly-neutral-700 mb-2">
          What should we call you?
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="poly-input w-full max-w-md mx-auto block"
          autoFocus
        />
      </div>

      <button
        onClick={() => onNext({ userName })}
        disabled={!userName.trim()}
        className="poly-btn-primary w-full max-w-md mx-auto"
      >
        Continue to Interests
      </button>
    </motion.div>
  );
};

export default WelcomeScreen;

