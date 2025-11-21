import React from 'react';
import { UserPlus, Brain, Rocket } from 'lucide-react';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up & Assess',
      description: 'Complete our 5-minute cognitive assessment to understand your unique learning profile and preferences.',
    },
    {
      icon: Brain,
      title: 'AI Creates Your Path',
      description: 'Our neural engine analyzes your data and creates a personalized learning journey optimized for your brain.',
    },
    {
      icon: Rocket,
      title: 'Learn & Accelerate',
      description: 'Experience exponential growth as you progress through adaptive content that evolves with your abilities.',
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-light-surface dark:bg-dark-base">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-text-primary mb-6">
            How It Works
          </h2>
          <p className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Get started in minutes and begin your transformation journey with our simple three-step process.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop Timeline Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-royal-600 via-purple-600 to-royal-600 transform -translate-y-1/2 opacity-30"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Mobile Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-8 top-20 bottom-0 w-1 bg-gradient-to-b from-royal-600 to-purple-600 opacity-30"></div>
                )}

                <Card hover className="relative p-8 rounded-xl border-2 border-silver-500/20 hover:border-royal-500/40 transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-5 left-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 w-10 h-10 bg-dark-base rounded-full border-4 border-royal-500 flex items-center justify-center shadow-lg shadow-royal-500/30">
                    <span className="text-sm font-bold text-royal-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-18 h-18 bg-gradient-to-br from-royal-600/20 to-purple-600/20 border-2 border-royal-500/30 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-lg shadow-royal-500/10">
                    <Icon icon={step.icon} size="xl" className="text-royal-400" />
                  </div>

                  {/* Content */}
                  <div className="text-center lg:text-left">
                    <h3 className="text-2xl font-display font-semibold text-text-primary mb-4">
                      {step.title}
                    </h3>
                    <p className="text-base text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

