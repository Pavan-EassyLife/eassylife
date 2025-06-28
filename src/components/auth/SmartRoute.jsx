import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAddressContext } from '../../contexts/AddressContext';
import Landing from '../../pages/Landing';
import Home from '../../pages/Home';

/**
 * SmartRoute Component
 * Handles the root "/" route intelligently:
 * - Shows Landing page for unauthenticated users
 * - Shows Home page for authenticated users (with address)
 * - Redirects to address setup for authenticated users without address
 * - Shows loading while checking authentication
 */
const SmartRoute = () => {
  const { isAuthenticated, initialized } = useAuthContext();
  const { hasAddress } = useAddressContext();
  
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
  
  // If user is authenticated
  if (isAuthenticated) {
    // Check if user has address, if not redirect to address setup
    if (!hasAddress) {
      console.log('🏠 SmartRoute: User authenticated but no address, redirecting to address setup');
      return <Navigate to="/address" replace />;
    }
    
    // User is authenticated and has address, show Home page
    console.log('✅ SmartRoute: User authenticated with address, showing Home page');
    return <Home />;
  }
  
  // User is not authenticated, show Landing page
  console.log('🔓 SmartRoute: User not authenticated, showing Landing page');
  return <Landing />;
};

export default SmartRoute;
