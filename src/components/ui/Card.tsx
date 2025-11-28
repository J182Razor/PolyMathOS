import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  glass = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        // Background
        glass
          ? 'bg-slate-900/80 backdrop-blur-xl border border-slate-800'
          : gradient
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700'
            : 'bg-slate-900/50 backdrop-blur-xl border border-slate-800',
        // Hover effects
        hover && [
          'hover:shadow-lg hover:-translate-y-1',
          'hover:border-blue-500/50',
        ],
        // Padding
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Card subcomponents
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}> = ({ 
  children, 
  className,
  as: Component = 'h3'
}) => (
  <Component className={cn('font-display font-semibold text-white', className)}>
    {children}
  </Component>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <p className={cn('text-sm text-slate-400 mt-1', className)}>{children}</p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('mt-4 pt-4 border-t border-slate-800', className)}>{children}</div>
);
