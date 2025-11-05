import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Neuroscientist, Stanford University',
      avatar: 'SC',
      rating: 5,
      content: 'NeuroAscend has revolutionized how I approach learning new research methodologies. The AI-powered personalization is incredibly sophisticated and has accelerated my comprehension by at least 200%.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Software Engineer, Google',
      avatar: 'MR',
      rating: 5,
      content: 'As someone who needs to constantly learn new technologies, NeuroAscend has been a game-changer. The neural learning engine adapts to my schedule and learning style perfectly.'
    },
    {
      name: 'Emma Thompson',
      role: 'Medical Student, Harvard',
      avatar: 'ET',
      rating: 5,
      content: 'Studying for medical school has never been easier. The retention techniques and spaced repetition algorithms have helped me master complex concepts in half the time.'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon={Star}
        size="sm"
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Learners Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of students, professionals, and researchers who have transformed 
            their learning experience with NeuroAscend.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 relative">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-20">
                <Icon icon={Quote} size="lg" className="text-indigo-500" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Trusted by leading institutions and companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Stanford</div>
            <div className="text-2xl font-bold text-gray-400">Harvard</div>
            <div className="text-2xl font-bold text-gray-400">MIT</div>
            <div className="text-2xl font-bold text-gray-400">Google</div>
            <div className="text-2xl font-bold text-gray-400">Microsoft</div>
          </div>
        </div>
      </div>
    </section>
  );
};

