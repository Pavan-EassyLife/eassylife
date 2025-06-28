import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * SettingItem - Reusable setting item component
 * Following the design specifications from settings-implementation.md
 * Provides consistent layout for all setting items
 */
const SettingItem = ({
  icon: Icon,
  label,
  description,
  children,
  onClick,
  disabled = false,
  className = '',
  contentClassName = '',
  controlClassName = '',
  variant = 'default'
}) => {
  const variants = {
    default: {
      container: 'hover:bg-orange-50/30',
      icon: 'text-gray-600',
      label: 'text-gray-900',
      description: 'text-gray-600'
    },
    destructive: {
      container: 'hover:bg-red-50/30',
      icon: 'text-red-500',
      label: 'text-red-700',
      description: 'text-red-600'
    },
    success: {
      container: 'hover:bg-green-50/30',
      icon: 'text-green-500',
      label: 'text-green-700',
      description: 'text-green-600'
    }
  };

  const currentVariant = variants[variant];

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      className={cn(
        'flex items-start justify-between py-4 px-0 transition-all duration-200 border-b border-gray-100 last:border-b-0',
        onClick && !disabled && `cursor-pointer ${currentVariant.container}`,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick && !disabled ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      whileHover={onClick && !disabled ? { x: 2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Content Section */}
      <div className={cn('flex-1 min-w-0 pr-4', contentClassName)}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          {Icon && (
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={cn('w-5 h-5', currentVariant.icon)} />
            </div>
          )}
          
          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                'text-sm font-medium leading-5',
                currentVariant.label,
                disabled && 'text-gray-400'
              )}>
                {label}
              </h4>
            </div>
            
            {description && (
              <p className={cn(
                'text-sm leading-5 mt-1',
                currentVariant.description,
                disabled && 'text-gray-400'
              )}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Control Section */}
      {children && (
        <div className={cn('flex-shrink-0 flex items-center', controlClassName)}>
          {children}
        </div>
      )}
    </motion.div>
  );
};

/**
 * SettingItemWithToggle - Setting item with integrated toggle switch
 */
export const SettingItemWithToggle = ({
  icon,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  variant = 'default',
  toggleSize = 'default',
  className = ''
}) => {
  return (
    <SettingItem
      icon={icon}
      label={label}
      description={description}
      disabled={disabled}
      variant={variant}
      className={className}
    >
      <ToggleSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size={toggleSize}
        variant={variant}
        aria-label={`Toggle ${label}`}
      />
    </SettingItem>
  );
};

/**
 * SettingItemWithButton - Setting item with action button
 */
export const SettingItemWithButton = ({
  icon,
  label,
  description,
  buttonText = 'Action',
  onButtonClick,
  disabled = false,
  variant = 'default',
  buttonVariant = 'default',
  className = ''
}) => {
  const buttonVariants = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300',
    primary: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300',
    destructive: 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300'
  };

  return (
    <SettingItem
      icon={icon}
      label={label}
      description={description}
      disabled={disabled}
      variant={variant}
      className={className}
    >
      <button
        onClick={onButtonClick}
        disabled={disabled}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          buttonVariants[buttonVariant],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {buttonText}
      </button>
    </SettingItem>
  );
};

/**
 * SettingItemWithSelect - Setting item with dropdown select
 */
export const SettingItemWithSelect = ({
  icon,
  label,
  description,
  value,
  options = [],
  onChange,
  disabled = false,
  variant = 'default',
  placeholder = 'Select option',
  className = ''
}) => {
  return (
    <SettingItem
      icon={icon}
      label={label}
      description={description}
      disabled={disabled}
      variant={variant}
      className={className}
    >
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </SettingItem>
  );
};

// Import ToggleSwitch for the integrated components
import ToggleSwitch from './ToggleSwitch';

export default SettingItem;
