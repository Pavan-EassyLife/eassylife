/**
 * Animation configurations for consistent motion design
 * Respects user's reduced motion preferences
 */

// Easing curves
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  gentle: { type: "spring", stiffness: 100, damping: 20 }
};

// Duration constants
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8
};

// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const slideInUp = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" }
};

export const slideInDown = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" }
};

// Page transition variants
export const pageTransitions = {
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

// Modal/overlay animations
export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  },
  slideUp: {
    initial: { opacity: 0, y: "100%" },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: "100%" }
  }
};

// Button hover animations
export const buttonAnimations = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  disabled: { opacity: 0.6 }
};

// Card animations
export const cardAnimations = {
  hover: {
    y: -4,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    transition: { duration: durations.fast, ease: easings.easeOut }
  },
  tap: { scale: 0.98 }
};

// List item animations
export const listItemAnimations = {
  initial: { opacity: 0, x: -20 },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.1,
      duration: durations.normal,
      ease: easings.easeOut
    }
  }),
  exit: { opacity: 0, x: 20 }
};

// Stagger animations for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Loading animations
export const loadingAnimations = {
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  },
  pulse: {
    animate: { scale: [1, 1.1, 1] },
    transition: { duration: 1, repeat: Infinity, ease: easings.easeInOut }
  },
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.6, repeat: Infinity, ease: easings.easeInOut }
  }
};

// Video player animations
export const videoPlayerAnimations = {
  controls: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.fast }
  },
  progressBar: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: durations.normal, ease: easings.easeOut }
  }
};

// Service selection animations
export const serviceSelectionAnimations = {
  grid: staggerContainer,
  item: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  }
};

// Booking panel animations
export const bookingPanelAnimations = {
  slideIn: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  fieldFocus: {
    scale: 1.02,
    borderColor: "#f97316",
    boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.1)"
  }
};

// Utility function to get animation config based on user preferences
export const getAnimationConfig = (prefersReducedMotion = false) => {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 }
    };
  }
  
  return {
    transition: { duration: durations.normal, ease: easings.easeInOut }
  };
};

// Utility function to create responsive animations
export const createResponsiveAnimation = (mobileVariant, desktopVariant) => {
  return {
    mobile: mobileVariant,
    desktop: desktopVariant
  };
};

export default {
  easings,
  durations,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInUp,
  slideInDown,
  pageTransitions,
  modalAnimations,
  buttonAnimations,
  cardAnimations,
  listItemAnimations,
  staggerContainer,
  loadingAnimations,
  videoPlayerAnimations,
  serviceSelectionAnimations,
  bookingPanelAnimations,
  getAnimationConfig,
  createResponsiveAnimation
};
