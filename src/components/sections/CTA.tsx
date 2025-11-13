import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface CTAProps {
  onStartTrial: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onStartTrial }) => {
  return (
    <section className="py-20 bg-dark-base relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192, 192, 208, 0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Silver Shimmer Overlay */}
      <div className="absolute inset-0 bg-shimmer opacity-30"></div>

      {/* Floating Silver Particles */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-silver-base/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-silver-light/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-silver-medium/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-silver-base/20 text-silver-light text-sm font-medium mb-8">
          <Icon icon={Sparkles} size="sm" className="mr-2" />
          Limited Time: 50% Off First Month
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-shimmer mb-6">
          Ready to Transform Your Learning?
        </h2>

        <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Join thousands of learners who have already unlocked their cognitive potential. 
          Start your journey today and experience the future of education.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="group"
            onClick={onStartTrial}
          >
            Start Free Trial
            <Icon icon={ArrowRight} size="sm" className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-silver-base/50 text-silver-light hover:border-silver-light"
          >
            Schedule Demo
          </Button>
        </div>

        <p className="text-text-tertiary text-sm mt-6">
          No credit card required • 30-day money-back guarantee
        </p>
      </div>
    </section>
  );
};

