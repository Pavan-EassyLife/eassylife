import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * ToggleSwitch - Reusable toggle switch component
 * Following the design specifications from settings-implementation.md
 * Includes smooth animations and hover effects
 */
const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'default',
  variant = 'default',
  className = '',
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const sizes = {
    small: {
      switch: 'w-10 h-5',
      handle: 'w-4 h-4',
      translate: 'translate-x-5'
    },
    default: {
      switch: 'w-14 h-7',
      handle: 'w-6 h-6',
      translate: 'translate-x-7'
    },
    large: {
      switch: 'w-16 h-8',
      handle: 'w-7 h-7',
      translate: 'translate-x-8'
    }
  };

  const variants = {
    default: {
      bg: 'bg-gray-200',
      bgActive: 'from-orange-400 to-orange-500',
      shadow: 'shadow-orange-200',
      hover: 'hover:shadow-orange-100'
    },
    success: {
      bg: 'bg-gray-200',
      bgActive: 'from-green-400 to-green-500',
      shadow: 'shadow-green-200',
      hover: 'hover:shadow-green-100'
    },
    warning: {
      bg: 'bg-gray-200',
      bgActive: 'from-yellow-400 to-yellow-500',
      shadow: 'shadow-yellow-200',
      hover: 'hover:shadow-yellow-100'
    }
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        currentSize.switch,
        checked 
          ? `bg-gradient-to-r ${currentVariant.bgActive} shadow-lg ${currentVariant.shadow}` 
          : `${currentVariant.bg} shadow-inner`,
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : `cursor-pointer ${currentVariant.hover}`,
        className
      )}
    >
      {/* Toggle Handle */}
      <motion.div
        className={cn(
          'inline-block rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out',
          currentSize.handle,
          disabled ? 'shadow-sm' : 'shadow-md hover:shadow-lg'
        )}
        animate={{
          x: checked ? currentSize.translate.replace('translate-x-', '') : '2px',
          scale: disabled ? 0.95 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
        style={{
          boxShadow: checked 
            ? '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      />

      {/* Focus Ring */}
      <div className="absolute inset-0 rounded-full ring-2 ring-transparent transition-all duration-200 focus-within:ring-orange-500 focus-within:ring-offset-2" />
    </button>
  );
};

/**
 * ToggleWithLabel - Toggle switch with integrated label and description
 */
export const ToggleWithLabel = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'default',
  variant = 'default',
  className = '',
  labelClassName = '',
  descriptionClassName = ''
}) => {
  // Generate a unique ID for the toggle
  const toggleId = React.useMemo(() => {
    if (typeof label === 'string') {
      return `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return `toggle-${Math.random().toString(36).substr(2, 9)}`;
  }, [label]);

  // Extract text content for aria-label if label is JSX
  const getAriaLabel = () => {
    if (typeof label === 'string') {
      return label;
    }
    // For JSX elements, try to extract text content or use fallback
    return 'Toggle setting';
  };

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'block text-sm font-medium text-gray-900 cursor-pointer',
            disabled && 'text-gray-500 cursor-not-allowed',
            labelClassName
          )}
          onClick={() => !disabled && onChange && onChange(!checked)}
        >
          {label}
        </div>
        {description && (
          <p
            id={`${toggleId}-description`}
            className={cn(
              'mt-1 text-sm text-gray-500',
              disabled && 'text-gray-400',
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>

      <ToggleSwitch
        id={toggleId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size={size}
        variant={variant}
        aria-label={getAriaLabel()}
        aria-describedby={description ? `${toggleId}-description` : undefined}
      />
    </div>
  );
};

/**
 * ToggleGroup - Group of related toggle switches
 */
export const ToggleGroup = ({
  title,
  description,
  children,
  className = '',
  titleClassName = '',
  descriptionClassName = ''
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="pb-2 border-b border-gray-200">
          <h3 className={cn('text-lg font-semibold text-gray-900', titleClassName)}>
            {title}
          </h3>
          {description && (
            <p className={cn('mt-1 text-sm text-gray-600', descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default ToggleSwitch;
