import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface HeroProps {
  onStartJourney: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-base pt-24 pb-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192, 192, 208, 0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-base via-dark-surface to-dark-base opacity-50"></div>
      
      {/* Floating Silver Particles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-silver-base/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-silver-light/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-silver-medium/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-5 py-2.5 rounded-full glass border border-royal-500/30 text-text-secondary text-sm font-medium mb-10 backdrop-blur-xl">
            <span className="w-2 h-2 bg-royal-500 rounded-full mr-2 animate-pulse shadow-lg shadow-royal-500/50"></span>
            AI-Powered Learning Revolution
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-text-primary mb-8 leading-tight">
            Transform Your Learning in{' '}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              30 Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-2xl sm:text-3xl text-text-secondary mb-10 leading-relaxed font-medium">
            AI + Neuroscience + AR/VR to Boost Retention by{' '}
            <span className="font-bold bg-royal-gradient bg-clip-text text-transparent">300%</span>
          </p>

          {/* Description */}
          <p className="text-lg sm:text-xl text-text-secondary mb-16 max-w-2xl mx-auto leading-relaxed">
            Experience personalized learning that adapts to your brain patterns, 
            accelerates comprehension, and makes knowledge stick forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="primary" size="lg" className="group" onClick={onStartJourney}>
              Start Your Journey
              <Icon icon={ArrowRight} size="sm" className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button variant="outline" size="lg" className="group">
              <Icon icon={Play} size="sm" className="mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center glass p-8 rounded-xl border-2 border-silver-500/20 hover:border-royal-500/50 transition-all duration-300">
              <div className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-3">300%</div>
              <div className="text-sm font-medium text-text-secondary">Faster Learning</div>
            </div>
            <div className="text-center glass p-8 rounded-xl border-2 border-silver-500/20 hover:border-royal-500/50 transition-all duration-300">
              <div className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-3">95%</div>
              <div className="text-sm font-medium text-text-secondary">Retention Rate</div>
            </div>
            <div className="text-center glass p-8 rounded-xl border-2 border-silver-500/20 hover:border-royal-500/50 transition-all duration-300">
              <div className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent mb-3">50K+</div>
              <div className="text-sm font-medium text-text-secondary">Active Learners</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

