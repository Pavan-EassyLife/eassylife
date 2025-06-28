import React, { useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Phone, ShoppingCart, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { useMobileNavigation } from '../../contexts/MobileNavigationContext';

/**
 * BottomNavigation - Fixed bottom navigation matching Flutter app design
 * Features:
 * - 4 tabs: Home, Call Now, Cart, My Orders
 * - Active state highlighting with orange color
 * - Fixed positioning at bottom of screen
 * - Only visible on mobile screens (<768px)
 * - Smooth transitions and proper touch targets
 */
const BottomNavigation = () => {
  const navigate = useNavigate();

  let activeTab, setActiveTab, shouldShowMobileNav;
  try {
    const mobileNav = useMobileNavigation();
    activeTab = mobileNav.activeTab;
    setActiveTab = mobileNav.setActiveTab;
    shouldShowMobileNav = mobileNav.shouldShowMobileNav;
  } catch (error) {
    console.warn('BottomNavigation: Error accessing mobile navigation context', error);
    return null; // Don't render if context is not available
  }

  // Don't render if mobile navigation should not be shown
  if (!shouldShowMobileNav()) {
    return null;
  }

  // Memoized navigation handlers
  const handleHome = useCallback(() => {
    setActiveTab('home');
    navigate('/home');
  }, [setActiveTab, navigate]);

  const handleCallNow = useCallback(() => {
    // Open phone dialer with business number
    const phoneNumber = '+918888888888'; // Replace with actual business number
    window.location.href = `tel:${phoneNumber}`;
  }, []);

  const handleCart = useCallback(() => {
    setActiveTab('cart');
    navigate('/cart');
  }, [setActiveTab, navigate]);

  const handleMyOrders = useCallback(() => {
    setActiveTab('orders');
    navigate('/orders');
  }, [setActiveTab, navigate]);

  // Memoized navigation items configuration
  const navItems = useMemo(() => [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      handler: handleHome,
      isActive: activeTab === 'home'
    },
    {
      id: 'call',
      label: 'Call Now',
      icon: Phone,
      handler: handleCallNow,
      isActive: false // Call doesn't have an active state
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      handler: handleCart,
      isActive: activeTab === 'cart'
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: FileText,
      handler: handleMyOrders,
      isActive: activeTab === 'orders'
    }
  ], [activeTab, handleHome, handleCallNow, handleCart, handleMyOrders]);

  return (
    <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-center h-16 px-1 w-full">
        <div className="flex w-full justify-between items-center px-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.isActive;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={item.handler}
                className={`flex flex-col items-center justify-center py-1.5 px-2 h-auto min-w-0 flex-1 transition-all duration-300 hover:bg-transparent group ${
                  isActive
                    ? 'text-orange-500'
                    : 'text-gray-500 hover:text-orange-500'
                }`}
              >
                {/* Icon with active state styling */}
                <div className={`transition-all duration-300 ${
                  isActive 
                    ? 'transform scale-110' 
                    : 'group-hover:scale-105'
                }`}>
                  <IconComponent
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? 'text-orange-500'
                        : 'text-gray-500 group-hover:text-orange-500'
                    }`}
                  />
                </div>
                
                {/* Label with active state styling */}
                <span className={`text-xs font-medium mt-0.5 transition-all duration-300 leading-tight text-center ${
                  isActive
                    ? 'text-orange-500 font-semibold'
                    : 'text-gray-500 group-hover:text-orange-500'
                }`}>
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(BottomNavigation);
