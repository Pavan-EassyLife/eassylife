import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import useAccessibility from '../../hooks/useAccessibility';
import AccessibleButton from './AccessibleButton';

/**
 * AccessibleModal Component - WCAG compliant modal dialog
 * 
 * Features:
 * - Focus trap and management
 * - Keyboard navigation (ESC to close)
 * - Screen reader announcements
 * - Proper ARIA attributes
 * - Click outside to close
 * - Backdrop scroll prevention
 */
const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  titleId,
  descriptionId,
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  const {
    announceToScreenReader,
    handleKeyboardNavigation,
    createFocusTrap,
    generateId,
    getAriaAttributes
  } = useAccessibility();

  // Generate IDs if not provided
  const modalTitleId = titleId || generateId('modal-title');
  const modalDescriptionId = descriptionId || generateId('modal-description');

  // Handle modal open/close effects
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Announce modal opening
      announceToScreenReader(`Dialog opened: ${title || 'Modal dialog'}`, 'assertive');
      
      // Set up focus trap
      const cleanup = createFocusTrap(modalRef.current);
      
      return () => {
        cleanup();
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Restore focus
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
        
        // Announce modal closing
        announceToScreenReader('Dialog closed');
      };
    }
  }, [isOpen, title, announceToScreenReader, createFocusTrap]);

  // Handle keyboard events
  const handleKeyDown = (event) => {
    if (!isOpen) return;

    handleKeyboardNavigation(event, {
      onEscape: closeOnEscape ? onClose : undefined
    });
  };

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: 'max-w-sm',
      medium: 'max-w-md',
      large: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      full: 'max-w-full mx-4'
    };

    return sizes[size] || sizes.medium;
  };

  // Get ARIA attributes
  const ariaAttributes = getAriaAttributes('dialog', {
    labelledBy: modalTitleId,
    describedBy: modalDescriptionId
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`
            relative bg-white rounded-lg shadow-xl transform transition-all
            w-full ${getSizeStyles()} ${className}
          `}
          {...ariaAttributes}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2
                  id={modalTitleId}
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}
              
              {showCloseButton && (
                <AccessibleButton
                  variant="ghost"
                  size="small"
                  onClick={onClose}
                  ariaLabel="Close dialog"
                  className="ml-auto p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </AccessibleButton>
              )}
            </div>
          )}

          {/* Content */}
          <div
            id={modalDescriptionId}
            className="p-6"
          >
            {children}
          </div>
        </div>
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Press Escape to close this dialog. Use Tab to navigate between interactive elements.
      </div>
    </div>
  );
};

export default AccessibleModal;
