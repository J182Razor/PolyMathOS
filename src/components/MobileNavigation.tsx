"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Brain, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isVisible?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  pages: string[];
}

const navItems: NavItem[] = [
  { 
    id: 'home', 
    label: 'Home', 
    icon: Home,
    pages: ['home', 'signin', 'signup']
  },
  { 
    id: 'learn', 
    label: 'Learn', 
    icon: BookOpen,
    pages: ['learning', 'flashcards', 'memory_palace', 'deep_work', 'mind_map']
  },
  { 
    id: 'progress', 
    label: 'Progress', 
    icon: BarChart3,
    pages: ['dashboard', 'polymath_dashboard', 'assessment']
  },
  { 
    id: 'ai', 
    label: 'AI', 
    icon: Brain,
    pages: ['polymath_ai']
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User,
    pages: ['portfolio', 'reflection']
  },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  currentPage, 
  onNavigate,
  isVisible = true
}) => {
  if (!isVisible) return null;

  const getActiveNavItem = () => {
    for (const item of navItems) {
      if (item.pages.includes(currentPage)) {
        return item.id;
      }
    }
    return 'home';
  };

  const activeItem = getActiveNavItem();

  const handleNavigate = (item: NavItem) => {
    switch (item.id) {
      case 'home':
        onNavigate('home');
        break;
      case 'learn':
        onNavigate('learning');
        break;
      case 'progress':
        onNavigate('dashboard');
        break;
      case 'ai':
        onNavigate('polymath_ai');
        break;
      case 'profile':
        onNavigate('portfolio');
        break;
    }
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-slate-900/95 backdrop-blur-xl",
        "border-t border-slate-800",
        "md:hidden"
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-stretch justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item)}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "py-2 px-4 rounded-xl min-w-[64px]",
                "transition-all duration-200",
                "touch-manipulation active:scale-95",
                isActive 
                  ? "text-blue-400 bg-blue-500/10" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                )} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-blue-400"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};
