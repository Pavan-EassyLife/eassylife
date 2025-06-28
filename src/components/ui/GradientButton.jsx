import React from 'react';
import { cn } from '../../lib/utils';

/**
 * GradientButton Component
 * Provides consistent gradient button styling across the application
 */

const GradientButton = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'default',
  children,
  ...props
}, ref) => {
  
  const baseClasses = 'btn-gradient-primary font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-opacity-50';
  
  const variants = {
    primary: 'btn-gradient-primary',
    outline: 'border-2 border-transparent bg-gradient-to-r from-orange-light to-orange-primary bg-clip-border text-white hover:from-orange-primary hover:to-orange-dark',
    ghost: 'bg-transparent text-orange-primary hover:bg-gradient-orange-subtle',
    subtle: 'bg-gradient-orange-subtle text-orange-dark hover:bg-gradient-orange',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

GradientButton.displayName = 'GradientButton';

export { GradientButton };

/**
 * Usage Examples:
 * 
 * <GradientButton>Primary Button</GradientButton>
 * <GradientButton variant="outline" size="lg">Outline Button</GradientButton>
 * <GradientButton variant="ghost" size="sm">Ghost Button</GradientButton>
 * <GradientButton variant="subtle">Subtle Button</GradientButton>
 */
