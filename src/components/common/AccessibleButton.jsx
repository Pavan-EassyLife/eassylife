import React, { forwardRef } from 'react';
import useAccessibility from '../../hooks/useAccessibility';

/**
 * AccessibleButton Component - WCAG compliant button
 * 
 * Features:
 * - Proper ARIA attributes
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * - High contrast support
 * - Loading and disabled states
 */
const AccessibleButton = forwardRef(({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ariaExpanded,
  className = '',
  loadingText = 'Loading...',
  ...props
}, ref) => {
  const {
    isHighContrast,
    prefersReducedMotion,
    announceToScreenReader,
    handleKeyboardNavigation,
    getAriaAttributes
  } = useAccessibility();

  // Handle click with accessibility features
  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }

    // Announce action to screen readers
    if (ariaLabel) {
      announceToScreenReader(`${ariaLabel} activated`);
    }

    if (onClick) {
      onClick(event);
    }
  };

  // Handle keyboard interactions
  const handleKeyDown = (event) => {
    handleKeyboardNavigation(event, {
      onEnter: handleClick,
      onSpace: handleClick
    });
  };

  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: `
        bg-gradient-to-r from-orange-500 to-orange-600 text-white
        hover:from-orange-600 hover:to-orange-700
        focus:ring-orange-500
        disabled:from-gray-300 disabled:to-gray-400
        ${isHighContrast ? 'border-2 border-orange-700' : ''}
      `,
      secondary: `
        bg-white text-orange-600 border-2 border-orange-500
        hover:bg-orange-50
        focus:ring-orange-500
        disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
        ${isHighContrast ? 'border-3' : ''}
      `,
      outline: `
        bg-transparent text-gray-700 border-2 border-gray-300
        hover:bg-gray-50 hover:border-gray-400
        focus:ring-gray-500
        disabled:text-gray-400 disabled:border-gray-200
        ${isHighContrast ? 'border-3 border-gray-600' : ''}
      `,
      ghost: `
        bg-transparent text-gray-600
        hover:bg-gray-100
        focus:ring-gray-500
        disabled:text-gray-400
        ${isHighContrast ? 'border-2 border-gray-400' : ''}
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white
        hover:from-red-600 hover:to-red-700
        focus:ring-red-500
        disabled:from-gray-300 disabled:to-gray-400
        ${isHighContrast ? 'border-2 border-red-700' : ''}
      `
    };

    return `${baseStyles} ${variants[variant] || variants.primary}`;
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    return sizes[size] || sizes.medium;
  };

  // Get ARIA attributes
  const ariaAttributes = getAriaAttributes('button', {
    disabled: disabled || loading,
    pressed: ariaPressed,
    expanded: ariaExpanded,
    label: ariaLabel,
    describedBy: ariaDescribedBy
  });

  // Animation styles based on user preferences
  const animationStyles = prefersReducedMotion 
    ? 'transition-none' 
    : 'transition-all duration-200 hover:scale-105 active:scale-95';

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${animationStyles}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      {...ariaAttributes}
      {...props}
    >
      {/* Loading state */}
      {loading && (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">{loadingText}</span>
          {loadingText}
        </span>
      )}

      {/* Normal content */}
      {!loading && children}

      {/* Screen reader only text for complex buttons */}
      {ariaLabel && !children && (
        <span className="sr-only">{ariaLabel}</span>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
