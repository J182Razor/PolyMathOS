import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-semibold rounded-xl',
    'transition-all duration-200 transform-gpu',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-slate-950',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.98]',
    'touch-manipulation'
  );
  
  const variantClasses = {
    primary: cn(
      'text-white bg-gradient-to-r from-blue-500 to-purple-500',
      'shadow-md shadow-blue-500/25',
      'hover:from-blue-600 hover:to-purple-600',
      'hover:shadow-lg hover:shadow-blue-500/30',
      'hover:-translate-y-0.5'
    ),
    secondary: cn(
      'bg-slate-800 text-white',
      'border border-slate-700',
      'hover:bg-slate-700 hover:border-slate-600'
    ),
    ghost: cn(
      'text-slate-300',
      'hover:bg-slate-800/50 hover:text-white'
    ),
    outline: cn(
      'border-2 border-blue-500 text-blue-400',
      'bg-transparent',
      'hover:bg-blue-500/10 hover:text-blue-300'
    ),
    danger: cn(
      'text-white bg-gradient-to-r from-red-500 to-pink-500',
      'shadow-md shadow-red-500/25',
      'hover:from-red-600 hover:to-pink-600',
      'hover:shadow-lg hover:shadow-red-500/30'
    ),
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2',
    icon: 'p-3',
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
