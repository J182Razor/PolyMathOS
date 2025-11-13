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
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-silver-dark'}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-dark-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mb-4">
            Trusted by Learners Worldwide
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Join thousands of students, professionals, and researchers who have transformed 
            their learning experience with NeuroAscend.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} hover className="p-6 relative">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-20">
                <Icon icon={Quote} size="lg" className="text-silver-base" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Content */}
              <blockquote className="text-text-secondary mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 rounded-full flex items-center justify-center mr-4 silver-glow">
                  <span className="text-silver-light font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-display font-semibold text-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-text-tertiary mb-8">
            Trusted by leading institutions and companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-text-tertiary">Stanford</div>
            <div className="text-2xl font-bold text-text-tertiary">Harvard</div>
            <div className="text-2xl font-bold text-text-tertiary">MIT</div>
            <div className="text-2xl font-bold text-text-tertiary">Google</div>
            <div className="text-2xl font-bold text-text-tertiary">Microsoft</div>
          </div>
        </div>
      </div>
    </section>
  );
};

