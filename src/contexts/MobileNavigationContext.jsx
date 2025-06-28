import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * MobileNavigationContext - Manages mobile navigation state
 * Features:
 * - Tracks active tab based on current route
 * - Synchronizes between header and bottom navigation
 * - Provides navigation state for mobile components
 * - Handles route changes and updates active states
 */

// Mobile Navigation Context
const MobileNavigationContext = createContext();

// Mobile Navigation Actions
const MOBILE_NAV_ACTIONS = {
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_IS_MOBILE: 'SET_IS_MOBILE',
  SET_SHOW_MOBILE_COMPONENTS: 'SET_SHOW_MOBILE_COMPONENTS'
};

// Initial State
const initialState = {
  activeTab: 'home',
  isMobile: false,
  showMobileComponents: false
};

// Mobile Navigation Reducer
const mobileNavReducer = (state, action) => {
  switch (action.type) {
    case MOBILE_NAV_ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
    case MOBILE_NAV_ACTIONS.SET_IS_MOBILE:
      return { ...state, isMobile: action.payload };
    
    case MOBILE_NAV_ACTIONS.SET_SHOW_MOBILE_COMPONENTS:
      return { ...state, showMobileComponents: action.payload };
    
    default:
      return state;
  }
};

// Mobile Navigation Provider Component
export const MobileNavigationProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(mobileNavReducer, initialState);

  // Safely get location with error handling
  let location;
  try {
    location = useLocation();
  } catch (error) {
    console.warn('MobileNavigationProvider: useLocation hook failed, using fallback');
    location = { pathname: '/' };
  }

  // Determine active tab based on current route
  const getActiveTabFromRoute = (pathname) => {
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname.startsWith('/orders')) return 'orders';
    if (pathname.startsWith('/cart')) return 'cart';
    if (pathname === '/vip') return 'none'; // VIP page has no bottom nav
    if (pathname === '/landing') return 'none'; // No active tab on landing
    return 'home'; // Default to home
  };

  // Update active tab when route changes
  useEffect(() => {
    try {
      const newActiveTab = getActiveTabFromRoute(location?.pathname || '/');
      dispatch({ type: MOBILE_NAV_ACTIONS.SET_ACTIVE_TAB, payload: newActiveTab });
    } catch (error) {
      console.warn('MobileNavigationProvider: Error updating active tab', error);
    }
  }, [location?.pathname]);

  // Monitor screen size for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      try {
        const isMobile = window.innerWidth < 768;
        dispatch({ type: MOBILE_NAV_ACTIONS.SET_IS_MOBILE, payload: isMobile });

        // Show mobile components only on mobile and not on landing page
        const shouldShow = isMobile && location?.pathname !== '/landing';
        dispatch({ type: MOBILE_NAV_ACTIONS.SET_SHOW_MOBILE_COMPONENTS, payload: shouldShow });
      } catch (error) {
        console.warn('MobileNavigationProvider: Error in checkMobile', error);
      }
    };

    // Initial check
    checkMobile();

    // Add resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);

      // Cleanup
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }
  }, [location?.pathname]);

  // Actions
  const setActiveTab = (tab) => {
    dispatch({ type: MOBILE_NAV_ACTIONS.SET_ACTIVE_TAB, payload: tab });
  };

  // Navigation helpers
  const isTabActive = (tabName) => {
    return state.activeTab === tabName;
  };

  const shouldShowMobileNav = () => {
    return state.isMobile && state.showMobileComponents;
  };

  const shouldHideDesktopHeader = () => {
    return state.isMobile && state.showMobileComponents;
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    setActiveTab,
    
    // Helpers
    isTabActive,
    shouldShowMobileNav,
    shouldHideDesktopHeader,
    getActiveTabFromRoute
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
};

// Custom hook to use mobile navigation context
export const useMobileNavigation = () => {
  const context = useContext(MobileNavigationContext);
  if (!context) {
    console.warn('useMobileNavigation: Context not found, using fallback values');
    // Return fallback values instead of throwing error
    return {
      activeTab: 'home',
      isMobile: false,
      showMobileComponents: false,
      setActiveTab: () => {},
      isTabActive: () => false,
      shouldShowMobileNav: () => false,
      shouldHideDesktopHeader: () => false,
      getActiveTabFromRoute: () => 'home'
    };
  }
  return context;
};

export default MobileNavigationContext;
