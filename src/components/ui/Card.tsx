import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false
}) => {
  const baseClasses = 'rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300';
  const backgroundClasses = gradient 
    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
    : 'bg-white dark:bg-gray-800';
  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:scale-105 hover:border-indigo-300 dark:hover:border-indigo-600'
    : '';
  const shadowClasses = 'shadow-lg';
  
  return (
    <div className={`${baseClasses} ${backgroundClasses} ${shadowClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

