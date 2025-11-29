"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isVisible?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  pages: string[];
}

const navItems: NavItem[] = [
  { 
    id: 'home', 
    label: 'Home', 
    icon: 'home',
    pages: ['home', 'signin', 'signup', 'dashboard', 'polymath_dashboard']
  },
  { 
    id: 'progress', 
    label: 'Progress', 
    icon: 'bar_chart',
    pages: ['assessment']
  },
  { 
    id: 'search', 
    label: 'Search', 
    icon: 'search',
    pages: ['resource_library']
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: 'settings',
    pages: []
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
        onNavigate('dashboard');
        break;
      case 'progress':
        onNavigate('dashboard');
        break;
      case 'search':
        onNavigate('resource_library');
        break;
      case 'settings':
        // Open settings modal
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
                  ? "text-primary bg-primary/10" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <span className={cn(
                  "material-symbols-outlined text-2xl mb-1",
                  isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                )}>
                  {item.icon}
                </span>
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-full"
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
