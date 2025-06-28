import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * LoadingSpinner - Reusable loading spinner component
 * Provides consistent loading states across the application
 */
const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  className = '',
  showMessage = true,
  variant = 'default'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    default: 'text-orange-500',
    white: 'text-white',
    gray: 'text-gray-500',
    primary: 'text-orange-600'
  };

  if (size === 'large' || size === 'xl') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('flex flex-col items-center justify-center', className)}
      >
        <div className="relative">
          {/* Main spinner */}
          <Loader2 className={cn(sizeClasses[size], variants[variant], 'animate-spin')} />
          
          {/* Secondary spinner for enhanced effect */}
          {(size === 'large' || size === 'xl') && (
            <div className={cn(
              'absolute inset-0 border-4 border-transparent border-r-orange-300 rounded-full animate-spin',
              size === 'xl' ? 'w-16 h-16' : 'w-12 h-12'
            )} 
            style={{ animationDelay: '150ms' }} />
          )}
        </div>
        
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-4"
          >
            <p className="text-gray-600 font-medium">{message}</p>
            {(size === 'large' || size === 'xl') && (
              <p className="text-sm text-gray-500 mt-1">Please wait a moment...</p>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default and small sizes
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn(sizeClasses[size], variants[variant], 'animate-spin')} />
      {showMessage && (
        <span className="ml-2 text-gray-600">{message}</span>
      )}
    </div>
  );
};

/**
 * InlineSpinner - Minimal inline spinner for buttons and small spaces
 */
export const InlineSpinner = ({ className = '', size = 'small' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    small: 'w-4 h-4',
    default: 'w-5 h-5'
  };

  return (
    <Loader2 className={cn(sizeClasses[size], 'animate-spin text-current', className)} />
  );
};

/**
 * PageSpinner - Full page loading spinner
 */
export const PageSpinner = ({ message = 'Loading EassyLife...', className = '' }) => {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-gray-50', className)}>
      <LoadingSpinner size="xl" message={message} />
    </div>
  );
};

/**
 * SectionSpinner - Loading spinner for page sections
 */
export const SectionSpinner = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <LoadingSpinner size="default" message={message} />
    </div>
  );
};

export default LoadingSpinner;
