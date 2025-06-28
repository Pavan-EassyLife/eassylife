import { useEffect, useCallback, useState } from 'react';

/**
 * useAccessibility Hook - Enhance accessibility features
 * 
 * Features:
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * - High contrast mode detection
 * - Reduced motion preferences
 * - ARIA live regions
 */
const useAccessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Detect user preferences
  useEffect(() => {
    // High contrast mode detection
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e) => setIsHighContrast(e.matches);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Reduced motion detection
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e) => setPrefersReducedMotion(e.matches);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Keyboard user detection
    const handleKeyDown = () => setIsKeyboardUser(true);
    const handleMouseDown = () => setIsKeyboardUser(false);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management
  const manageFocus = useCallback((element, options = {}) => {
    if (!element) return;

    const { 
      preventScroll = false, 
      restoreFocus = true,
      announceChange = false 
    } = options;

    // Store current focus for restoration
    const previousFocus = document.activeElement;

    // Focus the element
    element.focus({ preventScroll });

    // Announce focus change to screen readers
    if (announceChange) {
      const elementText = element.textContent || element.getAttribute('aria-label') || 'Element';
      announceToScreenReader(`Focused on ${elementText}`);
    }

    // Return function to restore focus
    return () => {
      if (restoreFocus && previousFocus && previousFocus.focus) {
        previousFocus.focus({ preventScroll });
      }
    };
  }, [announceToScreenReader]);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((event, handlers = {}) => {
    const {
      onEnter,
      onSpace,
      onEscape,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onTab,
      onHome,
      onEnd
    } = handlers;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace(event);
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      case 'Tab':
        if (onTab) {
          onTab(event);
        }
        break;
      case 'Home':
        if (onHome) {
          event.preventDefault();
          onHome(event);
        }
        break;
      case 'End':
        if (onEnd) {
          event.preventDefault();
          onEnd(event);
        }
        break;
    }
  }, []);

  // Generate accessible IDs
  const generateId = useCallback((prefix = 'accessible') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ARIA attributes helpers
  const getAriaAttributes = useCallback((type, options = {}) => {
    const baseAttributes = {};

    switch (type) {
      case 'button':
        return {
          role: 'button',
          tabIndex: options.disabled ? -1 : 0,
          'aria-disabled': options.disabled || false,
          'aria-pressed': options.pressed,
          'aria-expanded': options.expanded,
          'aria-label': options.label,
          'aria-describedby': options.describedBy,
          ...baseAttributes
        };
      
      case 'dialog':
        return {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': options.labelledBy,
          'aria-describedby': options.describedBy,
          ...baseAttributes
        };
      
      case 'listbox':
        return {
          role: 'listbox',
          'aria-label': options.label,
          'aria-multiselectable': options.multiselectable || false,
          'aria-activedescendant': options.activeDescendant,
          ...baseAttributes
        };
      
      case 'option':
        return {
          role: 'option',
          'aria-selected': options.selected || false,
          'aria-disabled': options.disabled || false,
          id: options.id || generateId('option'),
          ...baseAttributes
        };
      
      default:
        return baseAttributes;
    }
  }, [generateId]);

  // Focus trap for modals
  const createFocusTrap = useCallback((container) => {
    if (!container) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    // State
    isHighContrast,
    prefersReducedMotion,
    isKeyboardUser,
    
    // Functions
    announceToScreenReader,
    manageFocus,
    handleKeyboardNavigation,
    generateId,
    getAriaAttributes,
    createFocusTrap
  };
};

export default useAccessibility;
