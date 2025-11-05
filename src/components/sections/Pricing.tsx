import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface PricingProps {
  onGetStarted: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onGetStarted }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Basic AI personalization',
        '5 learning sessions per month',
        'Progress tracking',
        'Community access',
        'Mobile app access'
      ],
      popular: false,
      cta: 'Get Started Free'
    },
    {
      name: 'Basic',
      description: 'For serious learners',
      monthlyPrice: 29,
      annualPrice: 24,
      features: [
        'Advanced AI personalization',
        'Unlimited learning sessions',
        'Advanced analytics',
        'Priority support',
        'Offline mode',
        'Custom learning paths',
        'AR/VR experiences'
      ],
      popular: true,
      cta: 'Start Learning'
    },
    {
      name: 'Premium',
      description: 'For professionals & teams',
      monthlyPrice: 79,
      annualPrice: 64,
      features: [
        'Everything in Basic',
        'Team collaboration tools',
        'Advanced reporting',
        'API access',
        'White-label options',
        'Dedicated account manager',
        'Custom integrations',
        'Enterprise security'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your learning goals. All plans include our core AI-powered features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                plan.popular
                  ? 'border-2 border-indigo-500 dark:border-indigo-400 shadow-xl scale-105'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-500 text-white text-sm font-medium">
                    <Icon icon={Star} size="xs" className="mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    /{isAnnual ? 'month' : 'month'}
                  </span>
                </div>
                {isAnnual && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-gray-500">
                    Billed annually (${(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12})
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Icon icon={Check} size="sm" className="text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                className="w-full"
                onClick={onGetStarted}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400">
            30-day money-back guarantee • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

