/**
 * Service Details Components - Index file for easy importing
 * 
 * Exports all dynamic attribute-related components and utilities
 */

// Main Components
export { default as DynamicAttributeSelector } from './DynamicAttributeSelector';
export { default as AttributeErrorBoundary, AttributeErrorFallback, withAttributeErrorBoundary } from './AttributeErrorBoundary';
export { 
  default as AttributeValidationFeedback, 
  AttributeSelectionSummary, 
  AttributeProgressIndicator 
} from './AttributeValidationFeedback';

// Utilities
export * from './attributeUtils';

// Picker Components (still needed)
export { default as DatePickerModal } from './pickers/DatePickerModal';
export { default as TimePickerModal } from './pickers/TimePickerModal';

// Lazy Components (updated)
export { default as LazyComponents } from './LazyComponents';
