import { lazy, Suspense } from 'react';

/**
 * Lazy-loaded components for better performance
 * Implements code splitting for service details components
 */

// Picker Components - Only components still in use
export const DatePickerModal = lazy(() => import('./pickers/DatePickerModal'));
export const TimePickerModal = lazy(() => import('./pickers/TimePickerModal'));

// Dynamic Attribute Components - New implementation
export const DynamicAttributeSelector = lazy(() => import('./DynamicAttributeSelector'));
export const AttributeErrorBoundary = lazy(() => import('./AttributeErrorBoundary'));
export const AttributeValidationFeedback = lazy(() => import('./AttributeValidationFeedback'));

// Loading fallback component
export const ComponentLoader = ({ className = "" }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
);

// Error boundary for lazy components
export const LazyComponentErrorBoundary = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <ComponentLoader />}>
      {children}
    </Suspense>
  );
};
