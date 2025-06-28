import toast from 'react-hot-toast';

/**
 * Error handling utilities for profile operations
 * Provides consistent error handling and user feedback
 */

// Error types
export const ErrorTypes = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  AUTH: 'auth',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  FILE_UPLOAD: 'file_upload',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Parse error from different sources and normalize it
 */
export const parseError = (error) => {
  // Handle different error formats
  if (typeof error === 'string') {
    return {
      type: ErrorTypes.UNKNOWN,
      message: error,
      severity: ErrorSeverity.MEDIUM,
      code: null,
      details: null
    };
  }

  if (error?.response) {
    // Axios error
    const { status, data } = error.response;
    
    return {
      type: getErrorTypeFromStatus(status),
      message: data?.message || getDefaultMessageForStatus(status),
      severity: getSeverityFromStatus(status),
      code: status,
      details: data
    };
  }

  if (error?.message) {
    // Standard Error object
    return {
      type: getErrorTypeFromMessage(error.message),
      message: error.message,
      severity: ErrorSeverity.MEDIUM,
      code: error.code || null,
      details: error
    };
  }

  // Fallback
  return {
    type: ErrorTypes.UNKNOWN,
    message: 'An unexpected error occurred',
    severity: ErrorSeverity.MEDIUM,
    code: null,
    details: error
  };
};

/**
 * Get error type from HTTP status code
 */
const getErrorTypeFromStatus = (status) => {
  switch (status) {
    case 400:
      return ErrorTypes.VALIDATION;
    case 401:
      return ErrorTypes.AUTH;
    case 403:
      return ErrorTypes.PERMISSION;
    case 404:
      return ErrorTypes.NOT_FOUND;
    case 429:
      return ErrorTypes.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorTypes.SERVER;
    default:
      return ErrorTypes.UNKNOWN;
  }
};

/**
 * Get error severity from HTTP status code
 */
const getSeverityFromStatus = (status) => {
  if (status >= 500) return ErrorSeverity.HIGH;
  if (status >= 400) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
};

/**
 * Get default error message for HTTP status code
 */
const getDefaultMessageForStatus = (status) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable.';
    case 503:
      return 'Service temporarily unavailable.';
    case 504:
      return 'Request timeout. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

/**
 * Get error type from error message
 */
const getErrorTypeFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return ErrorTypes.NETWORK;
  }
  
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorTypes.VALIDATION;
  }
  
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) {
    return ErrorTypes.AUTH;
  }
  
  if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) {
    return ErrorTypes.PERMISSION;
  }
  
  if (lowerMessage.includes('not found')) {
    return ErrorTypes.NOT_FOUND;
  }
  
  if (lowerMessage.includes('file') || lowerMessage.includes('upload')) {
    return ErrorTypes.FILE_UPLOAD;
  }
  
  return ErrorTypes.UNKNOWN;
};

/**
 * Handle error with appropriate user feedback
 */
export const handleError = (error, options = {}) => {
  const {
    showToast = true,
    logError = true,
    context = 'Unknown',
    fallbackMessage = 'Something went wrong. Please try again.'
  } = options;

  const parsedError = parseError(error);

  // Log error for debugging
  if (logError) {
    console.error(`[${context}] Error:`, {
      type: parsedError.type,
      message: parsedError.message,
      code: parsedError.code,
      severity: parsedError.severity,
      details: parsedError.details,
      originalError: error
    });
  }

  // Show user-friendly toast notification
  if (showToast) {
    const toastMessage = getUserFriendlyMessage(parsedError, fallbackMessage);
    
    switch (parsedError.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(toastMessage, {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(toastMessage, {
          duration: 4000,
        });
        break;
      case ErrorSeverity.LOW:
        toast(toastMessage, {
          duration: 3000,
          style: {
            background: '#f59e0b',
            color: '#fff',
          },
        });
        break;
    }
  }

  return parsedError;
};

/**
 * Get user-friendly error message
 */
const getUserFriendlyMessage = (parsedError, fallbackMessage) => {
  // Use custom message if it's user-friendly
  if (isUserFriendlyMessage(parsedError.message)) {
    return parsedError.message;
  }

  // Return type-specific user-friendly messages
  switch (parsedError.type) {
    case ErrorTypes.NETWORK:
      return 'Network error. Please check your internet connection and try again.';
    case ErrorTypes.AUTH:
      return 'Please log in again to continue.';
    case ErrorTypes.PERMISSION:
      return 'You do not have permission to perform this action.';
    case ErrorTypes.NOT_FOUND:
      return 'The requested information could not be found.';
    case ErrorTypes.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorTypes.FILE_UPLOAD:
      return 'File upload failed. Please check the file and try again.';
    case ErrorTypes.SERVER:
      return 'Server error. Please try again in a few moments.';
    case ErrorTypes.VALIDATION:
      return parsedError.message; // Validation messages are usually user-friendly
    default:
      return fallbackMessage;
  }
};

/**
 * Check if error message is user-friendly
 */
const isUserFriendlyMessage = (message) => {
  const technicalTerms = [
    'axios',
    'fetch',
    'xhr',
    'cors',
    'json',
    'parse',
    'undefined',
    'null',
    'object',
    'function',
    'stack trace',
    'internal server error'
  ];

  const lowerMessage = message.toLowerCase();
  return !technicalTerms.some(term => lowerMessage.includes(term));
};

/**
 * Profile-specific error handlers
 */
export const profileErrorHandlers = {
  updateProfile: (error) => handleError(error, {
    context: 'Profile Update',
    fallbackMessage: 'Failed to update profile. Please try again.'
  }),

  uploadImage: (error) => handleError(error, {
    context: 'Image Upload',
    fallbackMessage: 'Failed to upload image. Please try again.'
  }),

  updateNotifications: (error) => handleError(error, {
    context: 'Notification Preferences',
    fallbackMessage: 'Failed to update notification preferences. Please try again.'
  }),

  fetchProfile: (error) => handleError(error, {
    context: 'Fetch Profile',
    fallbackMessage: 'Failed to load profile data. Please refresh the page.',
    showToast: false // Usually handled silently
  }),

  walletOperation: (error) => handleError(error, {
    context: 'Wallet Operation',
    fallbackMessage: 'Wallet operation failed. Please try again.'
  }),

  settings: (error) => handleError(error, {
    context: 'Settings',
    fallbackMessage: 'Settings operation failed. Please try again.'
  })
};

/**
 * Success message handler
 */
export const handleSuccess = (message, options = {}) => {
  const {
    duration = 3000,
    showToast = true
  } = options;

  if (showToast) {
    toast.success(message, {
      duration,
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  }
};

/**
 * Loading state handler
 */
export const handleLoading = (message = 'Loading...', options = {}) => {
  const {
    duration = 0, // 0 means manual dismiss
    showToast = true
  } = options;

  if (showToast) {
    return toast.loading(message, {
      duration,
    });
  }
};

/**
 * Dismiss toast
 */
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};
