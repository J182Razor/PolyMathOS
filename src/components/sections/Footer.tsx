import React from 'react';
import { Brain, Twitter, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

export const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#' },
      { name: 'Integrations', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' }
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Webinars', href: '#' },
      { name: 'Research', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' },
      { name: 'Security', href: '#' }
    ]
  };

  return (
    <footer className="bg-dark-base text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 rounded-lg flex items-center justify-center">
                <Icon icon={Brain} size="sm" className="text-silver-light" />
              </div>
              <span className="text-xl font-display font-bold text-shimmer">PolyMathOS</span>
            </div>
            <p className="text-text-secondary mb-6 max-w-md">
              Transforming education through AI-powered personalized learning. 
              Unlock your cognitive potential and accelerate your growth.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="font-display font-semibold text-text-primary mb-3">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-dark-surface border border-silver-dark/30 rounded-lg text-text-primary placeholder-text-tertiary focus-silver"
                />
                <Button variant="primary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-text-tertiary hover:text-silver-light transition-colors">
                <Icon icon={Twitter} size="sm" />
              </a>
              <a href="#" className="text-text-tertiary hover:text-silver-light transition-colors">
                <Icon icon={Facebook} size="sm" />
              </a>
              <a href="#" className="text-text-tertiary hover:text-silver-light transition-colors">
                <Icon icon={Linkedin} size="sm" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-secondary hover:text-silver-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-secondary hover:text-silver-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-secondary hover:text-silver-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-secondary hover:text-silver-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-silver-dark/20 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <Icon icon={Mail} size="sm" className="text-silver-base" />
              <span className="text-text-secondary">hello@polymathos.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Icon icon={Phone} size="sm" className="text-silver-base" />
              <span className="text-text-secondary">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <Icon icon={MapPin} size="sm" className="text-silver-base" />
              <span className="text-text-secondary">San Francisco, CA</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 text-sm text-text-tertiary">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-tertiary">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-tertiary">
              <div className="w-4 h-4 bg-silver-base rounded-full"></div>
              <span>ISO 27001 Certified</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-text-tertiary text-sm">
            <p>&copy; 2025 PolyMathOS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

