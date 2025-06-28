import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Import cart components (to be created)
import CartHeader from '../../components/cart/CartHeader';
import CartContent from '../../components/cart/CartContent';
import CheckoutButton from '../../components/cart/CheckoutButton';
import EmptyCartState from '../../components/cart/EmptyCartState';
import CartLoadingState from '../../components/cart/CartLoadingState';

// Import hooks and utilities
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { CartStatus } from '../../types/cart';

/**
 * Cart Page Component
 * Main cart page following Flutter cart_screen.dart structure
 * Implements exact component hierarchy and behavior from Flutter app
 */
const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const {
    cartState,
    fetchCartData,
    refreshCartData,
    applyCoupon,
    isLoading,
    error,
    isInitialized
  } = useCart();

  // Initialize cart data on component mount (simplified version)
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Only fetch if cart is not already loaded
        if (cartState.status === CartStatus.INITIAL) {
          console.log('🛒 CartPage: Initializing cart data...');
          await fetchCartData();
        }
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      }
    };

    if (isAuthenticated && !isInitialized && cartState.status === CartStatus.INITIAL) {
      initializeCart();
    }
  }, [isAuthenticated, isInitialized, fetchCartData, cartState.status]); // Only run when authentication or initialization status changes

  // Handle coupon application from coupons page
  useEffect(() => {
    if (location.state?.appliedCoupon && location.state?.returnFromCoupons) {
      console.log('🎫 CartPage: Received applied coupon from coupons page:', location.state.appliedCoupon);

      // Apply coupon using cart context
      applyCoupon(location.state.appliedCoupon);

      // Clear location state to prevent re-application
      window.history.replaceState({}, document.title);
    }
  }, [location.state, applyCoupon]);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle pull-to-refresh (matches Flutter RefreshIndicator)
  const handleRefresh = async () => {
    try {
      await refreshCartData();
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  };

  // Render loading state (simplified)
  if (cartState.status === CartStatus.INITIAL ||
      cartState.status === CartStatus.CART_LOADING) {
    return <CartLoadingState />;
  }

  // Render empty cart state
  if (cartState.status === CartStatus.NO_DATA_FOUND) {
    return (
      <EmptyCartState 
        isGuest={!isAuthenticated}
        onLogin={() => navigate('/login')}
        onExplore={() => navigate('/home')}
        onRefresh={handleRefresh}
      />
    );
  }

  // Debug cart state before rendering
  console.log('🛒 CartPage: Rendering with cartState:', {
    hasCartState: !!cartState,
    cartStatus: cartState?.status,
    hasCartData: !!cartState?.cartData,
    cartStateKeys: cartState ? Object.keys(cartState) : null,
    isLoading,
    isInitialized
  });

  // Render main cart content
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col cart-page-mobile-protection">
      {/* Cart Header */}
      <CartHeader onBack={handleBack} />

      {/* SINGLE CartContent with responsive layout - NO DUPLICATION */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile: Single column (existing behavior) */}
        <div className="min-[768px]:hidden">
          <CartContent
            cartState={cartState}
            onRefresh={handleRefresh}
            isRefreshing={isLoading}
            layoutMode="full"
          />
        </div>

        {/* WebView/TabletView: Two-column layout */}
        <div className="hidden min-[768px]:block">
          <div className="cart-desktop-container py-6">
            <div className="cart-desktop-two-column">
              {/* Left Column - Cart Details */}
              <div className="space-y-6">
                <CartContent
                  cartState={cartState}
                  onRefresh={handleRefresh}
                  isRefreshing={isLoading}
                  layoutMode="left-column"
                />
              </div>

              {/* Right Column - Payment Summary */}
              <div className="space-y-6">
                <CartContent
                  cartState={cartState}
                  onRefresh={handleRefresh}
                  isRefreshing={isLoading}
                  layoutMode="right-column"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE CheckoutButton with responsive positioning */}
      <div className="min-[768px]:hidden">
        <CheckoutButton cartState={cartState} />
      </div>
    </div>
  );
};

export default CartPage;
