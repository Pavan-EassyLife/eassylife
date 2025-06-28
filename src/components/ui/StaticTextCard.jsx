import React from 'react';
import { motion } from 'framer-motion';

/**
 * StaticTextCard - Hover animation with completely static text
 * 
 * This approach separates the animated background from the text content,
 * ensuring text never experiences any transform distortion.
 * 
 * The card has two layers:
 * 1. Animated background layer (transforms on hover)
 * 2. Static text layer (never transforms)
 */

const StaticTextCard = ({
  children,
  className = '',
  hoverScale = 1.02,
  hoverY = -2,
  duration = 0.3,
  disabled = false,
  onClick,
  type = 'card',
  ...props
}) => {
  // Animation configurations
  const configs = {
    card: { scale: 1.02, y: -2, shadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
    button: { scale: 1.01, y: -1, shadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
    subtle: { scale: 1.005, y: 0, shadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }
  };

  const config = configs[type] || configs.card;
  const finalScale = hoverScale || config.scale;
  const finalY = hoverY !== undefined ? hoverY : config.y;

  // Background animation variants (only the background transforms)
  const backgroundVariants = {
    initial: {
      scale: 1,
      y: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: disabled ? {} : {
      scale: finalScale,
      y: finalY,
      boxShadow: config.shadow,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div 
      className={`static-text-card-container ${className}`}
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer'
      }}
      {...props}
    >
      {/* Animated Background Layer */}
      <motion.div
        className="static-text-card-background"
        variants={backgroundVariants}
        initial="initial"
        whileHover="hover"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          // Hardware acceleration for background only
          willChange: 'transform, box-shadow',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transformOrigin: 'center center',
          // Background styling
          backgroundColor: 'inherit',
          border: 'inherit',
          zIndex: 1
        }}
      />

      {/* Static Content Layer (never transforms) */}
      <div
        className="static-text-card-content"
        style={{
          position: 'relative',
          zIndex: 2,
          // Ensure text never transforms
          transform: 'none !important',
          // Optimal text rendering
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'geometricPrecision',
          // Force text to stay crisp
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          // Prevent any inherited transforms
          willChange: 'auto',
          // Ensure pixel-perfect text
          fontKerning: 'normal',
          textSizeAdjust: '100%',
          WebkitTextSizeAdjust: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Pre-configured variants (Memoized to prevent re-renders)
 */
export const StaticCard = React.memo(({ children, className = '', ...props }) => (
  <StaticTextCard
    type="card"
    className={`bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </StaticTextCard>
));

export const StaticButton = React.memo(({ children, className = '', ...props }) => (
  <StaticTextCard
    type="button"
    className={`${className}`}
    {...props}
  >
    {children}
  </StaticTextCard>
));

export const StaticSubtle = React.memo(({ children, className = '', ...props }) => (
  <StaticTextCard
    type="subtle"
    className={`${className}`}
    {...props}
  >
    {children}
  </StaticTextCard>
));

// Set display names for debugging
StaticCard.displayName = 'StaticCard';
StaticButton.displayName = 'StaticButton';
StaticSubtle.displayName = 'StaticSubtle';

/**
 * Alternative approach using CSS-only transforms
 * This version uses pure CSS without Framer Motion
 */
export const CSSStaticCard = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`css-static-card ${className}`}
      onClick={onClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        // Container doesn't transform
        transform: 'none'
      }}
      {...props}
    >
      {/* CSS-animated background */}
      <div
        className="css-static-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          backgroundColor: 'inherit',
          border: 'inherit',
          zIndex: 1,
          // CSS-only hover animation
          transition: 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform, box-shadow',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* Static content */}
      <div
        className="css-static-content"
        style={{
          position: 'relative',
          zIndex: 2,
          transform: 'none !important',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'geometricPrecision'
        }}
      >
        {children}
      </div>

      <style>{`
        .css-static-card:hover .css-static-background {
          transform: translate3d(0, -2px, 0) scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default StaticTextCard;
