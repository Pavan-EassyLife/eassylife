import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ErrorMessage - Reusable error message component
 * Provides consistent error display across the application
 */
const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry = null,
  onDismiss = null,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  retryText = 'Try Again',
  dismissible = false
}) => {
  const variants = {
    default: {
      container: 'bg-red-50 border border-red-200 text-red-800',
      icon: 'text-red-500',
      button: 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300'
    },
    minimal: {
      container: 'bg-transparent border-0 text-red-600',
      icon: 'text-red-500',
      button: 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300'
    },
    card: {
      container: 'bg-white border border-red-200 shadow-sm text-red-800',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 text-white border-red-500'
    }
  };

  const sizes = {
    small: {
      container: 'p-3 rounded-lg',
      text: 'text-sm',
      icon: 'w-4 h-4',
      button: 'px-3 py-1.5 text-xs'
    },
    default: {
      container: 'p-4 rounded-lg',
      text: 'text-sm',
      icon: 'w-5 h-5',
      button: 'px-4 py-2 text-sm'
    },
    large: {
      container: 'p-6 rounded-xl',
      text: 'text-base',
      icon: 'w-6 h-6',
      button: 'px-6 py-3 text-base'
    }
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-start gap-3',
        currentVariant.container,
        currentSize.container,
        className
      )}
    >
      {/* Error Icon */}
      {showIcon && (
        <AlertCircle className={cn(currentVariant.icon, currentSize.icon, 'flex-shrink-0 mt-0.5')} />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(currentSize.text, 'font-medium')}>
          {message}
        </p>

        {/* Action Buttons */}
        {(onRetry || onDismiss) && (
          <div className="flex items-center gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  'inline-flex items-center gap-2 font-medium rounded-md border transition-colors duration-200',
                  currentVariant.button,
                  currentSize.button
                )}
              >
                <RefreshCw className="w-4 h-4" />
                {retryText}
              </button>
            )}

            {(dismissible || onDismiss) && (
              <button
                onClick={onDismiss}
                className={cn(
                  'inline-flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200',
                  currentSize.button
                )}
              >
                <X className="w-4 h-4" />
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dismiss Button (top-right) */}
      {dismissible && !onDismiss && (
        <button
          onClick={() => {}}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

/**
 * InlineError - Minimal inline error for form fields
 */
export const InlineError = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn('flex items-center gap-1 mt-1', className)}
    >
      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
      <span className="text-xs text-red-600">{message}</span>
    </motion.div>
  );
};

/**
 * PageError - Full page error display
 */
export const PageError = ({ 
  title = 'Oops! Something went wrong',
  message = "We're having trouble loading this page. Please check your internet connection and try again.",
  onRetry = null,
  className = ''
}) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}>
      <div className="text-center max-w-md mx-auto px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * SectionError - Error display for page sections
 */
export const SectionError = ({ message, onRetry, className = '' }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
      <ErrorMessage 
        message={message} 
        onRetry={onRetry} 
        variant="minimal" 
        size="default"
      />
    </div>
  );
};

export default ErrorMessage;
