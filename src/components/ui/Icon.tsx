import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  gradient?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  className = '',
  gradient = false
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  const gradientClasses = gradient 
    ? 'text-transparent bg-clip-text bg-silver-gradient'
    : '';
  
  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${gradientClasses} ${className}`}
    />
  );
};

