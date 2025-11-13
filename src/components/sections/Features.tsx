import React from 'react';
import { Brain, Zap, Target, TrendingUp, Users, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Personalization',
      description: 'Adaptive algorithms that learn your unique cognitive patterns and optimize content delivery for maximum retention.'
    },
    {
      icon: Zap,
      title: 'Neural Learning Engine',
      description: 'Breakthrough neuroscience techniques that accelerate information processing and strengthen memory formation.'
    },
    {
      icon: Target,
      title: 'Precision Analytics',
      description: 'Real-time insights into your learning progress with detailed analytics and personalized recommendations.'
    },
    {
      icon: TrendingUp,
      title: 'Exponential Growth',
      description: 'Compound your knowledge with our proven methodology that builds upon previous learning exponentially.'
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Connect with like-minded learners and benefit from collaborative knowledge sharing and peer support.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your learning data is encrypted and secure. We never share your personal information with third parties.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-dark-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-4">
            Revolutionary Learning Technology
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Experience the future of education with our cutting-edge platform that combines 
            artificial intelligence, neuroscience, and immersive technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 rounded-lg flex items-center justify-center mr-4 silver-glow">
                  <Icon icon={feature.icon} size="lg" className="text-silver-light" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary">
                  {feature.title}
                </h3>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

