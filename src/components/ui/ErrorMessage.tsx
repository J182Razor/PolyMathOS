import React from 'react';
import { ApiError } from '../../utils/apiErrorHandler';
import { cn } from '../../lib/utils';

interface ErrorMessageProps {
  error: ApiError | string | null;
  onDismiss?: () => void;
  className?: string;
  retryable?: boolean;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
  className,
  retryable = false,
  onRetry,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'string' ? undefined : error.code;

  return (
    <div
      className={cn(
        'rounded-lg border border-red-500/50 bg-red-500/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-red-400 text-xl">
          error
        </span>
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-1">Error</h3>
          <p className="text-text-primary-dark text-sm">{errorMessage}</p>
          {errorCode && (
            <p className="text-text-secondary-dark text-xs mt-1">
              Error code: {errorCode}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-secondary-dark hover:text-text-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>
      {retryable && onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-primary hover:text-primary/80 font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export const SuccessMessage: React.FC<{
  message: string;
  onDismiss?: () => void;
  className?: string;
}> = ({ message, onDismiss, className }) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-green-500/50 bg-green-500/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-green-400 text-xl">
          check_circle
        </span>
        <div className="flex-1">
          <p className="text-text-primary-dark text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-secondary-dark hover:text-text-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

