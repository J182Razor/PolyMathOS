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
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-silver-500/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-royal-600/20 to-purple-600/20 border border-royal-500/30 flex items-center justify-center overflow-hidden group-hover:border-royal-400/50 transition-all duration-300">
              <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain w-4 h-4 text-royal-400 relative z-10 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
                <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
                <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
                <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
                <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
                <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
                <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
              </svg>
            </div>
            <span className="text-xl font-display font-bold bg-brand-gradient bg-clip-text text-transparent">
              PolyMathOS
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-text-secondary hover:text-text-primary transition-all duration-200 relative group font-medium"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-royal-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-dark-surface/30 rounded-lg transition-all duration-200 focus-silver"
              aria-label="Toggle dark mode"
            >
              <Icon icon={darkMode ? Sun : Moon} size="sm" />
            </button>
            
            {user ? (
              <>
                <span className="text-sm text-text-secondary">
                  Welcome, <span className="text-text-primary font-medium">{user.firstName}</span>!
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
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              <Icon icon={darkMode ? Sun : Moon} size="sm" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <Icon icon={mobileMenuOpen ? X : Menu} size="sm" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-silver-500/20">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <>
                    <span className="text-sm text-text-secondary mb-2">
                      Welcome, <span className="text-text-primary font-medium">{user.firstName}</span>!
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

