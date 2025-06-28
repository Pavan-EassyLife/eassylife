/**
 * LoadingSpinner - Reusable loading spinner component
 * 
 * Provides consistent loading indicators across the app
 * with different sizes and colors
 */

import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.color - Color variant: 'orange', 'white', 'gray'
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'orange', 
  className = '' 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Color classes
  const colorClasses = {
    orange: 'text-orange-500',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
