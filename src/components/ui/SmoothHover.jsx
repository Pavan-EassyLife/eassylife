import React from 'react';
import { motion } from 'framer-motion';

/**
 * SmoothHover Component - Provides smooth, jitter-free hover animations
 * 
 * This component solves common hover animation issues like:
 * - Text/content shaking during scale transforms
 * - Jittery animations on hover
 * - Performance issues with hover effects
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.hoverScale - Scale transform on hover (default: 1.02)
 * @param {Object} props.hoverY - Y translation on hover (default: -2)
 * @param {string} props.hoverShadow - Box shadow on hover
 * @param {number} props.duration - Animation duration in seconds (default: 0.3)
 * @param {string} props.easing - Easing function (default: [0.25, 0.46, 0.45, 0.94])
 * @param {string} props.type - Animation type: 'card', 'button', 'subtle' (default: 'card')
 * @param {boolean} props.disabled - Disable hover effects
 * @param {Function} props.onClick - Click handler
 */
const SmoothHover = ({
  children,
  className = '',
  hoverScale,
  hoverY,
  hoverShadow,
  duration = 0.3,
  easing = [0.25, 0.46, 0.45, 0.94],
  type = 'card',
  disabled = false,
  onClick,
  ...props
}) => {
  // Predefined animation types
  const animationTypes = {
    card: {
      scale: 1.02,
      y: -2,
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      duration: 0.3
    },
    button: {
      scale: 1.01,
      y: -1,
      shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      duration: 0.25
    },
    subtle: {
      scale: 1.005,
      y: 0,
      shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      duration: 0.2
    }
  };

  const config = animationTypes[type] || animationTypes.card;

  // Use provided values or fallback to type defaults
  const finalScale = hoverScale !== undefined ? hoverScale : config.scale;
  const finalY = hoverY !== undefined ? hoverY : config.y;
  const finalShadow = hoverShadow || config.shadow;
  const finalDuration = duration || config.duration;

  // Animation variants
  const variants = {
    initial: {
      scale: 1,
      y: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: finalDuration,
        ease: easing
      }
    },
    hover: disabled ? {} : {
      scale: finalScale,
      y: finalY,
      boxShadow: finalShadow,
      transition: {
        duration: finalDuration,
        ease: easing
      }
    }
  };

  return (
    <motion.div
      className={`smooth-hover-container ${className}`}
      variants={variants}
      initial="initial"
      whileHover="hover"
      onClick={onClick}
      style={{
        // Hardware acceleration and anti-shake properties
        willChange: 'transform, box-shadow',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        // Prevent layout shifts
        transformOrigin: 'center center',
        // Enhanced text rendering for crisp text during transforms
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'geometricPrecision',
        // Prevent subpixel rendering issues
        WebkitTransform: 'translateZ(0)',
        MozTransform: 'translateZ(0)',
        msTransform: 'translateZ(0)',
        OTransform: 'translateZ(0)',
        // Force integer pixel positioning
        WebkitBackfaceVisibility: 'hidden',
        MozBackfaceVisibility: 'hidden',
        msBackfaceVisibility: 'hidden',
        // Ensure crisp edges for images
        imageRendering: 'crisp-edges',
        // Prevent text selection during animation
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
      {...props}
    >
      <div
        style={{
          // Apply text-specific anti-distortion properties to all child text
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'geometricPrecision',
          // Ensure text stays crisp during parent transforms
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          // Prevent text from inheriting transform distortions
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

/**
 * SmoothCard - Pre-configured card hover component (Memoized)
 */
export const SmoothCard = React.memo(({ children, className = '', ...props }) => (
  <SmoothHover
    type="card"
    className={`${className}`}
    {...props}
  >
    {children}
  </SmoothHover>
));

/**
 * SmoothButton - Pre-configured button hover component (Memoized)
 */
export const SmoothButton = React.memo(({ children, className = '', ...props }) => (
  <SmoothHover
    type="button"
    className={`${className}`}
    {...props}
  >
    {children}
  </SmoothHover>
));

/**
 * SmoothSubtle - Pre-configured subtle hover component (Memoized)
 */
export const SmoothSubtle = React.memo(({ children, className = '', ...props }) => (
  <SmoothHover
    type="subtle"
    className={`${className}`}
    {...props}
  >
    {children}
  </SmoothHover>
));

// Set display names for debugging
SmoothCard.displayName = 'SmoothCard';
SmoothButton.displayName = 'SmoothButton';
SmoothSubtle.displayName = 'SmoothSubtle';

export default SmoothHover;
