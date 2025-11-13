import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  glass = true
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300 transform-gpu relative overflow-hidden';
  
  const backgroundClasses = glass
    ? 'glass'
    : gradient
    ? 'bg-gradient-to-br from-dark-surface to-dark-elevated'
    : 'bg-dark-surface';
  
  const borderClasses = glass
    ? ''
    : 'border border-silver-dark/20';
  
  const hoverClasses = hover 
    ? `
      hover:shadow-silver-lg hover:scale-[1.02]
      hover:border-silver-base/40
      before:absolute before:inset-0 before:bg-shimmer before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none
    `
    : '';
  
  const shadowClasses = glass ? '' : 'shadow-glass';
  
  return (
    <div className={`${baseClasses} ${backgroundClasses} ${borderClasses} ${shadowClasses} ${hoverClasses} ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

