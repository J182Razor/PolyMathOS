import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface CTAProps {
  onStartTrial: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onStartTrial }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-8">
          <Icon icon={Sparkles} size="sm" className="mr-2" />
          Limited Time: 50% Off First Month
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Learning?
        </h2>

        <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
          Join thousands of learners who have already unlocked their cognitive potential. 
          Start your journey today and experience the future of education.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="secondary" 
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-gray-50 group"
            onClick={onStartTrial}
          >
            Start Free Trial
            <Icon icon={ArrowRight} size="sm" className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-white border-white hover:bg-white/10"
          >
            Schedule Demo
          </Button>
        </div>

        <p className="text-indigo-200 text-sm mt-6">
          No credit card required • 30-day money-back guarantee
        </p>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-1000"></div>
    </section>
  );
};

