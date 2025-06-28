import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects unauthenticated users to landing page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuthContext();
  
  // Show loading while checking authentication
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Animated spinner with EassyLife branding */}
            <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-orange-300 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Loading EassyLife...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we verify your session</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect to root if not authenticated (will show landing page)
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: User not authenticated, redirecting to root');
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated, render the protected content
  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
