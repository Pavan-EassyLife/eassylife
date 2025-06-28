import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

const FloatingLabelSelect = forwardRef(({
  label,
  value,
  onChange,
  onBlur,
  error,
  success,
  icon: Icon,
  className,
  required = false,
  disabled = false,
  options = [],
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const shouldFloat = isFocused || hasValue;

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (success) return 'text-green-500';
    return 'text-palette-orange';
  };

  const getBorderColor = () => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:border-palette-orange focus:ring-palette-orange';
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        {/* Select Container with Flexbox */}
        <div className="relative w-full">
          {/* Select */}
          <select
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'w-full bg-white border rounded-lg transition-all duration-300 ease-in-out appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:shadow-lg',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
              'text-base leading-tight', // Better text alignment
              // Responsive height and padding
              'h-12 sm:h-14',
              shouldFloat ? 'pt-5 pb-1 sm:pt-6 sm:pb-2' : 'py-3 sm:py-4',
              Icon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4',
              'pr-10 sm:pr-12', // Always leave space for chevron and status icons
              // Enhanced focus states
              'hover:border-gray-400 focus:border-palette-orange',
              getBorderColor(),
              // Mobile-specific improvements
              'text-16px', // Prevents zoom on iOS
              'min-h-[48px]' // Minimum touch target size
            )}
            {...props}
          >
            <option value="" disabled hidden>
              {/* Empty option to prevent default text */}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Icon */}
          {Icon && (
            <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300', getStatusColor())} />
            </div>
          )}

          {/* Floating Label */}
          <motion.label
            animate={{
              y: shouldFloat ? -6 : 0,
              scale: shouldFloat ? 0.8 : 1,
              color: error ? '#ef4444' : isFocused ? '#FFA301' : '#6b7280'
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute pointer-events-none origin-left font-medium transition-all duration-300 text-sm sm:text-base left-10 sm:left-12 top-4 -translate-y-1/2 flex items-center"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>

          {/* Chevron Down Icon */}
          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className={cn('w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300', getStatusColor())} />
          </div>

          {/* Status Icon */}
          {error && (
            <div className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-red-500',
            'px-1 leading-tight' // Better spacing on mobile
          )}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
});

FloatingLabelSelect.displayName = 'FloatingLabelSelect';

export { FloatingLabelSelect };
