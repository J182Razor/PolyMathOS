import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 transform-gpu focus-silver disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  
  const variantClasses = {
    primary: `
      bg-royal-600 dark:bg-royal-600 text-white
      border border-royal-700 dark:border-royal-500
      shadow-lg shadow-royal-500/20 dark:shadow-royal-500/30
      hover:bg-royal-700 dark:hover:bg-royal-500
      hover:shadow-xl hover:shadow-royal-500/30 dark:hover:shadow-royal-500/40
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-300
    `,
    secondary: `
      bg-purple-600 dark:bg-purple-600 text-white
      border border-purple-700 dark:border-purple-500
      shadow-lg shadow-purple-500/20 dark:shadow-purple-500/30
      hover:bg-purple-700 dark:hover:bg-purple-500
      hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/40
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-300
    `,
    ghost: `
      text-royal-600 dark:text-royal-400
      hover:text-royal-700 dark:hover:text-royal-300
      hover:bg-royal-50 dark:hover:bg-royal-950/20
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-300
    `,
    outline: `
      border-2 border-royal-500 dark:border-royal-400 
      text-royal-600 dark:text-royal-400
      bg-transparent
      hover:border-royal-600 dark:hover:border-royal-300
      hover:text-royal-700 dark:hover:text-royal-300
      hover:bg-royal-50 dark:hover:bg-royal-950/10
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-300
    `
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

