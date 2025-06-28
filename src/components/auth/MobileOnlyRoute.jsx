import React from 'react';
import { Navigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * MobileOnlyRoute - Route protection component that only allows access on mobile devices
 * Redirects to settings page if accessed from desktop/webview
 */
const MobileOnlyRoute = ({ children }) => {
  const { isMobile } = useResponsive();

  // If not mobile (i.e., desktop/webview), redirect to settings
  if (!isMobile) {
    return <Navigate to="/settings" replace />;
  }

  // If mobile, render the protected component
  return children;
};

export default MobileOnlyRoute;
