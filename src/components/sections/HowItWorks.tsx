import React from 'react';
import { UserPlus, Brain, Rocket } from 'lucide-react';
import { Icon } from '../ui/Icon';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up & Assess',
      description: 'Complete our 5-minute cognitive assessment to understand your unique learning profile and preferences.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Brain,
      title: 'AI Creates Your Path',
      description: 'Our neural engine analyzes your data and creates a personalized learning journey optimized for your brain.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Rocket,
      title: 'Learn & Accelerate',
      description: 'Experience exponential growth as you progress through adaptive content that evolves with your abilities.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get started in minutes and begin your transformation journey with our simple three-step process.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop Timeline Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Mobile Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                )}

                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 lg:left-1/2 lg:transform lg:-translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full border-4 border-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center mb-4 mx-auto lg:mx-0`}>
                    <Icon icon={step.icon} size="xl" className="text-white" />
                  </div>

                  {/* Content */}
                  <div className="text-center lg:text-left">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

