import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileAppBar from './MobileAppBar';
import BottomNavigation from './BottomNavigation';
import BottomSearchBar from './BottomSearchBar';
import ErrorBoundary from '../ErrorBoundary';
import { useMobileNavigation } from '../../contexts/MobileNavigationContext';
import { useMobilePerformance } from '../../hooks/useMobilePerformance';

/**
 * MobileLayout - Responsive wrapper for mobile-specific components
 * Features:
 * - Conditionally renders mobile components based on screen size
 * - Handles proper mounting/unmounting for performance
 * - Provides mobile-specific layout structure
 * - Only affects mobile screens (<768px)
 * - Preserves desktop/tablet layouts completely
 */
const MobileLayout = ({ children }) => {
  const location = useLocation();
  let shouldShowMobileNav, optimizeForMobile;

  try {
    const mobileNav = useMobileNavigation();
    shouldShowMobileNav = mobileNav.shouldShowMobileNav;
    const perf = useMobilePerformance('MobileLayout');
    optimizeForMobile = perf.optimizeForMobile;
  } catch (error) {
    console.warn('MobileLayout: Error accessing hooks, using fallbacks', error);
    shouldShowMobileNav = () => false;
    optimizeForMobile = () => ({ shouldReduceAnimations: false });
  }

  // Don't render anything if mobile navigation should not be shown
  if (!shouldShowMobileNav()) {
    return null;
  }

  // Get mobile optimization settings
  const mobileOptimizations = optimizeForMobile();

  // Only show search bar on home page
  const shouldShowSearchBar = location.pathname === '/home' || location.pathname === '/';

  return (
    <ErrorBoundary>
      {/* Mobile App Bar - replaces desktop header on mobile */}
      <ErrorBoundary>
        <MobileAppBar />
      </ErrorBoundary>

      {/* Mobile-specific content wrapper */}
      <div className="mobile-content-wrapper w-full max-w-full">
        {children}
      </div>

      {/* Bottom Search Bar - positioned above bottom navigation (only on home page) */}
      {shouldShowSearchBar && (
        <ErrorBoundary>
          <BottomSearchBar />
        </ErrorBoundary>
      )}

      {/* Bottom Navigation - fixed at bottom */}
      <ErrorBoundary>
        <BottomNavigation />
      </ErrorBoundary>
    </ErrorBoundary>
  );
};

// Simplified mobile layout without error boundaries for better performance
export const SimpleMobileLayout = ({ children }) => {
  const location = useLocation();
  const { shouldShowMobileNav } = useMobileNavigation();

  if (!shouldShowMobileNav()) {
    return null;
  }

  // Only show search bar on home page
  const shouldShowSearchBar = location.pathname === '/home' || location.pathname === '/';

  return (
    <>
      <MobileAppBar />
      <div className="mobile-content-wrapper w-full max-w-full">
        {children}
      </div>
      {shouldShowSearchBar && <BottomSearchBar />}
      <BottomNavigation />

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-content-wrapper {
          /* Add bottom padding to account for fixed bottom components */
          padding-bottom: 120px; /* 64px for bottom nav + 56px for search bar */
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        
        /* Ensure mobile components are properly layered */
        .mobile-app-bar {
          z-index: 40;
        }
        
        .mobile-search-bar {
          z-index: 40;
        }
        
        .mobile-bottom-nav {
          z-index: 50;
        }
        
        /* Hide desktop header on mobile when mobile layout is active */
        @media (max-width: 767px) {
          .mobile-layout-active header {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

/**
 * useMobileLayout - Hook to determine if mobile layout is active
 * Useful for components that need to adjust their behavior on mobile
 */
export const useMobileLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isClient]);

  return { isMobile, isClient };
};

export default MobileLayout;
