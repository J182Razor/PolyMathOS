import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-primary border-t-transparent',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-text-secondary-dark">{text}</p>
      )}
    </div>
  );
};

export const LoadingOverlay: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        {text && (
          <p className="text-text-primary-dark text-lg font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ isLoading, children, className, disabled }) => {
  return (
    <button
      className={className}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

