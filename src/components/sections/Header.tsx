import React, { useState } from 'react';
import { Menu, X, Moon, Sun, Brain } from 'lucide-react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSignIn: () => void;
  onGetStarted: () => void;
  user: User | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  toggleDarkMode, 
  onSignIn, 
  onGetStarted, 
  user, 
  onSignOut 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-silver-dark/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 flex items-center justify-center overflow-hidden group-hover:border-silver-light/50 transition-all duration-300">
              <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Icon icon={Brain} size="sm" className="text-silver-light relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-xl font-display font-bold text-shimmer">
              NeuroAscend
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-silver-medium hover:text-silver-light transition-all duration-200 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-silver-base group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-silver-medium hover:text-silver-light hover:bg-dark-surface/30 rounded-lg transition-all duration-200 focus-silver"
              aria-label="Toggle dark mode"
            >
              <Icon icon={darkMode ? Sun : Moon} size="sm" />
            </button>
            
            {user ? (
              <>
                <span className="text-sm text-silver-base">
                  Welcome, <span className="text-silver-light">{user.firstName}</span>!
                </span>
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onSignIn}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={onGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-silver-medium hover:text-silver-light rounded-lg transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              <Icon icon={darkMode ? Sun : Moon} size="sm" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-silver-medium hover:text-silver-light rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <Icon icon={mobileMenuOpen ? X : Menu} size="sm" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-silver-dark/20">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-silver-medium hover:text-silver-light transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <>
                    <span className="text-sm text-silver-base mb-2">
                      Welcome, <span className="text-silver-light">{user.firstName}</span>!
                    </span>
                    <Button variant="ghost" size="sm" onClick={onSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={onSignIn}>
                      Sign In
                    </Button>
                    <Button variant="primary" size="sm" onClick={onGetStarted}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

