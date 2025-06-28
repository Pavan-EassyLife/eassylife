import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const FloatingLabelInput = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  className,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && value.length > 0;
  const isDateInput = type === 'date' || type === 'datetime-local' || type === 'time';
  const shouldFloat = isFocused || hasValue || isDateInput;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

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
    return 'text-palette-orange';
  };

  const getBorderColor = () => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:border-palette-orange focus:ring-palette-orange';
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        {/* Input Container with Flexbox */}
        <div className="relative w-full">
          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'w-full bg-white border rounded-lg transition-all duration-300 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:shadow-lg',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
              'peer text-base leading-tight', // For peer selector and better text alignment
              // Responsive height and padding
              'h-12 sm:h-14',
              shouldFloat ? 'pt-5 pb-1 sm:pt-6 sm:pb-2' : 'py-3 sm:py-4',
              Icon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4',
              isPassword ? 'pr-10 sm:pr-12' : error ? 'pr-10 sm:pr-12' : 'pr-3 sm:pr-4',
              // Enhanced focus states
              'hover:border-gray-400 focus:border-palette-orange',
              getBorderColor(),
              // Mobile-specific improvements
              'text-16px', // Prevents zoom on iOS
              'min-h-[48px]' // Minimum touch target size
            )}
            placeholder={isDateInput && !shouldFloat ? "" : ""}
            {...props}
          />

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
            className={cn(
              'absolute pointer-events-none origin-left font-medium transition-all duration-300',
              'text-sm sm:text-base', // Responsive text size
              Icon ? 'left-10 sm:left-12' : 'left-3 sm:left-4',
              shouldFloat ? 'top-1 sm:top-2' : 'top-4 -translate-y-1/2',
              // Better vertical centering
              'flex items-center'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              'absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2',
              'text-gray-500 hover:text-gray-700 transition-colors duration-300',
              'p-1 rounded-md hover:bg-gray-100', // Better touch target
              'min-w-[44px] min-h-[44px] flex items-center justify-center' // Minimum touch target
            )}
          >
            {showPassword ?
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> :
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            }
          </button>
        )}

          {/* Status Icon */}
          {error && !isPassword && (
            <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
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
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };
