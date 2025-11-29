/**
 * API Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiErrorHandler {
  /**
   * Handle API errors and return user-friendly messages
   */
  static handleError(error: any): ApiError {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }

    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return {
            message: data?.message || 'Invalid request. Please check your input.',
            code: 'BAD_REQUEST',
            status: 400,
            details: data,
          };
        case 401:
          return {
            message: 'You are not authorized. Please sign in again.',
            code: 'UNAUTHORIZED',
            status: 401,
          };
        case 403:
          return {
            message: 'You do not have permission to perform this action.',
            code: 'FORBIDDEN',
            status: 403,
          };
        case 404:
          return {
            message: 'The requested resource was not found.',
            code: 'NOT_FOUND',
            status: 404,
          };
        case 429:
          return {
            message: 'Too many requests. Please wait a moment and try again.',
            code: 'RATE_LIMIT',
            status: 429,
          };
        case 500:
          return {
            message: 'Server error. Please try again later.',
            code: 'SERVER_ERROR',
            status: 500,
            details: data,
          };
        case 503:
          return {
            message: 'Service temporarily unavailable. Please try again later.',
            code: 'SERVICE_UNAVAILABLE',
            status: 503,
          };
        default:
          return {
            message: data?.message || `An error occurred (${status}). Please try again.`,
            code: 'HTTP_ERROR',
            status,
            details: data,
          };
      }
    }

    // Error objects with message
    if (error.message) {
      return {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        details: error,
      };
    }

    // String errors
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'UNKNOWN_ERROR',
      };
    }

    // Default fallback
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: ApiError): boolean {
    const retryableCodes = ['NETWORK_ERROR', 'RATE_LIMIT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'];
    return retryableCodes.includes(error.code || '');
  }

  /**
   * Get retry delay in milliseconds
   */
  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

/**
 * Retry wrapper for API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  onRetry?: (attempt: number, error: ApiError) => void
): Promise<T> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = ApiErrorHandler.handleError(error);

      if (attempt < maxRetries && ApiErrorHandler.isRetryable(lastError)) {
        const delay = ApiErrorHandler.getRetryDelay(attempt);
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || { message: 'Max retries exceeded', code: 'MAX_RETRIES' };
}

