import { useState, useEffect } from 'react';

/**
 * useResponsive - Custom hook for responsive design breakpoints
 * Provides utilities for detecting screen sizes and managing responsive behavior
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  const [breakpoint, setBreakpoint] = useState('desktop');

  // Breakpoint definitions (matching Tailwind CSS defaults)
  const breakpoints = {
    mobile: 0,      // 0px and up
    tablet: 640,    // 640px and up (sm)
    desktop: 768,   // 768px and up (md)
    large: 1024,    // 1024px and up (lg)
    xlarge: 1280,   // 1280px and up (xl)
    xxlarge: 1536   // 1536px and up (2xl)
  };

  // Update screen size and breakpoint
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Determine current breakpoint
      if (width >= breakpoints.xxlarge) {
        setBreakpoint('xxlarge');
      } else if (width >= breakpoints.xlarge) {
        setBreakpoint('xlarge');
      } else if (width >= breakpoints.large) {
        setBreakpoint('large');
      } else if (width >= breakpoints.desktop) {
        setBreakpoint('desktop');
      } else if (width >= breakpoints.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Utility functions
  const isMobile = screenSize.width < breakpoints.desktop; // < 768px
  const isTablet = screenSize.width >= breakpoints.tablet && screenSize.width < breakpoints.desktop; // 640px - 767px
  const isDesktop = screenSize.width >= breakpoints.desktop; // >= 768px
  const isLarge = screenSize.width >= breakpoints.large; // >= 1024px
  const isXLarge = screenSize.width >= breakpoints.xlarge; // >= 1280px

  // Breakpoint checkers
  const isBreakpoint = (bp) => {
    return screenSize.width >= breakpoints[bp];
  };

  const isBetween = (minBp, maxBp) => {
    return screenSize.width >= breakpoints[minBp] && screenSize.width < breakpoints[maxBp];
  };

  // Responsive value selector
  const getResponsiveValue = (values) => {
    if (typeof values === 'object' && values !== null) {
      if (isXLarge && values.xlarge !== undefined) return values.xlarge;
      if (isLarge && values.large !== undefined) return values.large;
      if (isDesktop && values.desktop !== undefined) return values.desktop;
      if (isTablet && values.tablet !== undefined) return values.tablet;
      if (values.mobile !== undefined) return values.mobile;
      
      // Fallback to default if provided
      return values.default || values.mobile || null;
    }
    return values;
  };

  return {
    // Screen dimensions
    screenSize,
    width: screenSize.width,
    height: screenSize.height,
    
    // Current breakpoint
    breakpoint,
    
    // Breakpoint booleans
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isXLarge,
    
    // Utility functions
    isBreakpoint,
    isBetween,
    getResponsiveValue,
    
    // Breakpoint values for reference
    breakpoints
  };
};

/**
 * useMediaQuery - Hook for custom media queries
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Responsive utility functions
 */
export const responsive = {
  // Common breakpoint queries
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 640px) and (max-width: 767px)',
  desktop: '(min-width: 768px)',
  large: '(min-width: 1024px)',
  xlarge: '(min-width: 1280px)',
  
  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Device-specific queries
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  
  // High DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Reduced motion preference
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Dark mode preference
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)'
};

/**
 * CSS-in-JS responsive utilities
 */
export const createResponsiveStyles = (styles) => {
  const { isMobile, isTablet, isDesktop, isLarge, isXLarge } = useResponsive();
  
  let appliedStyles = { ...styles.base };
  
  if (isMobile && styles.mobile) {
    appliedStyles = { ...appliedStyles, ...styles.mobile };
  }
  
  if (isTablet && styles.tablet) {
    appliedStyles = { ...appliedStyles, ...styles.tablet };
  }
  
  if (isDesktop && styles.desktop) {
    appliedStyles = { ...appliedStyles, ...styles.desktop };
  }
  
  if (isLarge && styles.large) {
    appliedStyles = { ...appliedStyles, ...styles.large };
  }
  
  if (isXLarge && styles.xlarge) {
    appliedStyles = { ...appliedStyles, ...styles.xlarge };
  }
  
  return appliedStyles;
};

/**
 * Component wrapper for responsive behavior
 */
export const ResponsiveWrapper = ({ 
  children, 
  mobile, 
  tablet, 
  desktop, 
  large, 
  xlarge,
  fallback = null 
}) => {
  const { isMobile, isTablet, isDesktop, isLarge, isXLarge } = useResponsive();
  
  if (isXLarge && xlarge) return xlarge;
  if (isLarge && large) return large;
  if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  if (isMobile && mobile) return mobile;
  
  return children || fallback;
};

export default useResponsive;
