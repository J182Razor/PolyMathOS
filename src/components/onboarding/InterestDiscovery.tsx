import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InterestDiscoveryProps {
  userData: any;
  onNext: (data: any) => void;
  onBack?: () => void;
}

const InterestDiscovery: React.FC<InterestDiscoveryProps> = ({ userData, onNext, onBack }) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [customDomains, setCustomDomains] = useState<string[]>([]);

  const predefinedDomains = [
    { id: 'mathematics', name: 'Mathematics', icon: '∑', color: 'from-poly-primary-500 to-poly-primary-600' },
    { id: 'physics', name: 'Physics', icon: '⚛', color: 'from-poly-secondary-500 to-poly-secondary-600' },
    { id: 'computer-science', name: 'Computer Science', icon: '</>', color: 'from-poly-accent-500 to-poly-accent-600' },
    { id: 'biology', name: 'Biology', icon: '🧬', color: 'from-yellow-400 to-yellow-500' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'from-purple-400 to-purple-500' },
    { id: 'engineering', name: 'Engineering', icon: '⚙', color: 'from-poly-neutral-500 to-poly-neutral-600' },
    { id: 'data-science', name: 'Data Science', icon: '📊', color: 'from-blue-400 to-blue-500' },
    { id: 'philosophy', name: 'Philosophy', icon: '💭', color: 'from-green-400 to-green-500' }
  ];

  const toggleDomain = (domainId: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const addCustomDomain = (domainName: string) => {
    if (domainName.trim() && !customDomains.includes(domainName.trim())) {
      setCustomDomains([...customDomains, domainName.trim()]);
    }
  };

  return (
    <motion.div 
      className="poly-card poly-card-elevated max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-display-3 mb-3">What fascinates you?</h2>
        <p className="text-body-large text-poly-neutral-600">
          Select domains that interest you. We'll discover learning resources and create a personalized path.
        </p>
      </div>

      {/* Predefined Domains Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {predefinedDomains.map((domain) => (
          <motion.button
            key={domain.id}
            onClick={() => toggleDomain(domain.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedDomains.includes(domain.id)
                ? 'border-poly-primary-500 bg-poly-primary-50'
                : 'border-poly-neutral-200 hover:border-poly-neutral-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${domain.color} mx-auto mb-3 flex items-center justify-center text-white text-xl`}>
              {domain.icon}
            </div>
            <h3 className="text-body-medium font-semibold text-poly-neutral-900">
              {domain.name}
            </h3>
          </motion.button>
        ))}
      </div>

      {/* Custom Domains Input */}
      <div className="mb-8">
        <label className="block text-body-medium text-poly-neutral-700 mb-3">
          Add your own interests
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="e.g., Quantum Computing, Neuroscience, Economics..."
            className="poly-input flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCustomDomain(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button 
            className="poly-btn-secondary"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input) {
                addCustomDomain(input.value);
                input.value = '';
              }
            }}
          >
            Add
          </button>
        </div>
        
        {/* Display custom domains */}
        {customDomains.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customDomains.map((domain, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-poly-secondary-100 text-poly-secondary-800"
              >
                {domain}
                <button 
                  onClick={() => setCustomDomains(customDomains.filter(d => d !== domain))}
                  className="ml-2 text-poly-secondary-500 hover:text-poly-secondary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="poly-btn-secondary flex-1"
          >
            Back
          </button>
        )}
        <button
          onClick={() => onNext({ ...userData, domains: [...selectedDomains, ...customDomains] })}
          disabled={selectedDomains.length === 0 && customDomains.length === 0}
          className={`poly-btn-primary ${onBack ? 'flex-1' : 'w-full'}`}
        >
          Discover Learning Resources
        </button>
      </div>
    </motion.div>
  );
};

export default InterestDiscovery;

