import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAccessibility from '../../hooks/useAccessibility';
import { getAnimationConfig } from '../../utils/animations';

/**
 * AnimatedWrapper Component - Consistent animations with accessibility
 * 
 * Features:
 * - Respects reduced motion preferences
 * - Consistent animation timing
 * - Accessibility-friendly animations
 * - Performance optimized
 */
const AnimatedWrapper = ({
  children,
  variant = 'fadeInUp',
  duration = 0.3,
  delay = 0,
  stagger = false,
  staggerDelay = 0.1,
  className = '',
  as = 'div',
  ...props
}) => {
  const { prefersReducedMotion } = useAccessibility();

  // Animation variants
  const variants = {
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    fadeInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    },
    slideInUp: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" }
    },
    slideInDown: {
      initial: { y: "-100%" },
      animate: { y: 0 },
      exit: { y: "-100%" }
    },
    none: {
      initial: {},
      animate: {},
      exit: {}
    }
  };

  // Get animation configuration
  const animationConfig = getAnimationConfig(prefersReducedMotion);
  const selectedVariant = prefersReducedMotion ? variants.none : variants[variant];

  // Stagger container configuration
  const staggerContainer = stagger ? {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  } : {};

  // Motion component props
  const motionProps = {
    variants: stagger ? staggerContainer : selectedVariant,
    initial: "initial",
    animate: "animate",
    exit: "exit",
    transition: {
      duration: prefersReducedMotion ? 0 : duration,
      delay: stagger ? 0 : delay,
      ease: [0.4, 0, 0.2, 1]
    },
    className,
    ...props
  };

  // Create motion component based on 'as' prop
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent {...motionProps}>
      {children}
    </MotionComponent>
  );
};

/**
 * AnimatedList Component - For animating lists with stagger
 */
export const AnimatedList = ({
  children,
  className = '',
  staggerDelay = 0.1,
  ...props
}) => {
  const { prefersReducedMotion } = useAccessibility();

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={prefersReducedMotion ? {} : itemVariants}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * AnimatedPresence wrapper for conditional rendering
 */
export const AnimatedConditional = ({
  show,
  children,
  variant = 'fadeInUp',
  ...props
}) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <AnimatedWrapper variant={variant} {...props}>
          {children}
        </AnimatedWrapper>
      )}
    </AnimatePresence>
  );
};

/**
 * Page transition wrapper
 */
export const PageTransition = ({
  children,
  variant = 'slideLeft',
  className = ''
}) => {
  const { prefersReducedMotion } = useAccessibility();

  const pageVariants = {
    slideLeft: {
      initial: { x: "100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "-100%", opacity: 0 }
    },
    slideRight: {
      initial: { x: "-100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    }
  };

  const selectedVariant = prefersReducedMotion ? pageVariants.fade : pageVariants[variant];

  return (
    <motion.div
      variants={selectedVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;
