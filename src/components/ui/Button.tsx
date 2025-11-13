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
      bg-dark-elevated text-silver-light
      border border-silver-base/30
      shadow-silver hover:shadow-silver-lg
      hover:border-silver-light/50
      hover:scale-[1.02] active:scale-[0.98]
      before:absolute before:inset-0 before:bg-shimmer before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
    `,
    secondary: `
      bg-dark-surface/50 text-silver-base
      border border-silver-dark/30
      backdrop-blur-sm
      hover:bg-dark-surface/70 hover:border-silver-base/40
      hover:text-silver-light
      hover:scale-[1.02] active:scale-[0.98]
    `,
    ghost: `
      text-silver-medium
      hover:text-silver-light
      hover:bg-dark-surface/30
      hover:scale-[1.02] active:scale-[0.98]
    `,
    outline: `
      border border-silver-dark/40 text-silver-base
      bg-transparent
      hover:border-silver-base/60 hover:text-silver-light
      hover:bg-dark-surface/20
      hover:scale-[1.02] active:scale-[0.98]
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

