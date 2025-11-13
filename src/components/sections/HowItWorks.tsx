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
    <section id="how-it-works" className="py-20 bg-dark-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Get started in minutes and begin your transformation journey with our simple three-step process.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop Timeline Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-silver-dark via-silver-base to-silver-light transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Mobile Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-silver-base to-silver-light"></div>
                )}

                <Card hover className="relative p-6">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 lg:left-1/2 lg:transform lg:-translate-x-1/2 w-8 h-8 bg-dark-base rounded-full border-4 border-silver-base flex items-center justify-center silver-glow">
                    <span className="text-sm font-bold text-shimmer">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 rounded-xl flex items-center justify-center mb-4 mx-auto lg:mx-0 silver-glow">
                    <Icon icon={step.icon} size="xl" className="text-silver-light" />
                  </div>

                  {/* Content */}
                  <div className="text-center lg:text-left">
                    <h3 className="text-xl font-display font-semibold text-text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
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

