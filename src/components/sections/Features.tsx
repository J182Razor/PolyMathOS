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
    <section id="features" className="py-24 bg-dark-base">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-text-primary mb-6">
            Revolutionary Learning Technology
          </h2>
          <p className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Experience the future of education with our cutting-edge platform that combines 
            artificial intelligence, neuroscience, and immersive technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <Card key={index} hover className="p-8 rounded-xl border-2 border-silver-500/20 hover:border-royal-500/40 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-royal-600/20 to-purple-600/20 border-2 border-royal-500/30 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-royal-500/10">
                  <Icon icon={feature.icon} size="lg" className="text-royal-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary leading-tight">
                  {feature.title}
                </h3>
              </div>
              <p className="text-base text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

