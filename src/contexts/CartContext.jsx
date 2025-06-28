import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartStatus, PaymentTypes, defaultCartState } from '../types/cart';
import cartService from '../api/services/cartService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

/**
 * Cart Context for managing cart state across components
 * Converts the useCart hook to a context-based solution
 */
const CartContext = createContext();

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Core cart state matching Flutter CartState
  const [cartState, setCartState] = useState(defaultCartState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Individual state properties for working components only
  const {
    cartData,
    cartRawData,
    frequentlyAddedServices,
    noOfServicesItems,
    noOfPackageItems,
    status,
    errorMessage,
    isLoading
  } = cartState;

  // Update cart state helper
  const updateCartState = useCallback((updates) => {
    console.log('🔄 CartContext: updateCartState called with:', {
      keys: Object.keys(updates),
      paymentType: updates.paymentType,
      status: updates.status
    });

    setCartState(prev => {
      const newState = { ...prev, ...updates };

      // Log important state changes
      if (updates.vipPlans) {
        console.log('🔄 CartContext: VIP plans updated:', {
          count: updates.vipPlans.length,
          hasPlans: updates.vipPlans.length > 0
        });
      }
      if (updates.paymentType) {
        console.log('💳 CartContext: Payment type updated:', prev.paymentType, '->', updates.paymentType);
      }
      if (updates.cartData) {
        console.log('📦 CartContext: Cart data updated:', {
          hasData: !!updates.cartData,
          totalPrice: updates.cartData?.totalPrice
        });
      }

      return newState;
    });
  }, []); // Remove problematic dependencies that cause stale closures

  // Set cart status (matches Flutter emit(state.copyWith(status: status)))
  const setCartStatus = useCallback((newStatus) => {
    updateCartState({ status: newStatus });
  }, [updateCartState]);

  // Set error message
  const setErrorMessage = useCallback((message) => {
    updateCartState({ 
      errorMessage: message,
      status: CartStatus.FAILURE 
    });
  }, [updateCartState]);

  // Fetch cart data - simplified version for working components only
  const fetchCartData = useCallback(async () => {
    // Prevent multiple simultaneous calls using a ref instead of state dependency
    console.log('🛒 CartContext: fetchCartData called, current status:', cartState.status);

    try {
      console.log('🛒 CartContext: Starting fetchCartData...');
      setCartStatus(CartStatus.CART_LOADING);
      updateCartState({ errorMessage: null });

      // Use current VIP plan selection for cart data fetch
      const currentPaymentType = cartState.paymentType || 'fullamount';
      const currentVipId = cartState.selectedVipPlan?.id || '';

      console.log('🛒 CartContext: Fetching cart with current VIP selection:', {
        paymentType: currentPaymentType,
        vipId: currentVipId,
        hasSelectedVipPlan: !!cartState.selectedVipPlan
      });

      const response = await cartService.getCartData({
        paymentType: currentPaymentType,
        vipId: currentVipId,
        isWallet: false
      });

      console.log('🛒 CartContext: Cart API response received:', {
        success: response?.success,
        hasData: !!response?.data,
        totalPrice: response?.data?.totalPrice
      });

      if (response.success) {
        // Check if cart is empty (no items found)
        const hasCartItems = response.data?.groupedCart?.categories?.length > 0 ||
                            response.data?.groupedCart?.packages?.length > 0;

        if (!hasCartItems && response.message === 'No items found in the cart.') {
          console.log('🛒 CartContext: Empty cart detected, setting NO_DATA_FOUND status');
          updateCartState({
            cartData: null,
            cartRawData: response.rawData,
            frequentlyAddedServices: [],
            vipPlans: [],
            noOfServicesItems: 0,
            noOfPackageItems: 0,
            status: CartStatus.NO_DATA_FOUND
          });
          setIsInitialized(true);
          return;
        }

        // Fetch frequently added services data
        const frequentlyAddedServicesResponse = await cartService.getFrequentlyAddedServices();
        const frequentlyAddedServicesData = frequentlyAddedServicesResponse?.data || [];
        console.log('🛒 CartContext: Frequently added services fetched:', {
          count: frequentlyAddedServicesData?.length || 0,
          fullResponse: frequentlyAddedServicesResponse
        });

        // Fetch VIP plans data for display
        const vipPlansResponse = await cartService.getVipPlans();
        const vipPlansData = vipPlansResponse?.data || [];
        console.log('🛒 CartContext: VIP plans fetched:', {
          count: vipPlansData?.length || 0,
          hasPlans: vipPlansData?.length > 0,
          fullResponse: vipPlansResponse
        });

        // Update cart state with response data - enhanced version
        const stateUpdate = {
          cartData: response.data,
          cartRawData: response.rawData,
          frequentlyAddedServices: frequentlyAddedServicesData,
          vipPlans: vipPlansData, // Add VIP plans data for display
          noOfServicesItems: response.data.groupedCart?.categories?.length || 0,
          noOfPackageItems: response.data.groupedCart?.packages?.length || 0,
          status: CartStatus.SUCCESS
        };

        console.log('✅ CartContext: Cart data fetch successful, updating state:', {
          hasCartData: !!stateUpdate.cartData,
          servicesCount: stateUpdate.noOfServicesItems,
          packagesCount: stateUpdate.noOfPackageItems,
          vipPlansCount: stateUpdate.vipPlans?.length || 0
        });

        updateCartState(stateUpdate);
        setIsInitialized(true);
      } else {
        throw new Error(response.message || 'Failed to fetch cart data');
      }
    } catch (error) {
      console.error('❌ CartContext: fetchCartData failed:', error);
      setErrorMessage(error.message || 'Failed to fetch cart data');
      setIsInitialized(true); // Still mark as initialized even on error
    }
  }, [cartState.paymentType, cartState.selectedVipPlan, updateCartState, setCartStatus, setErrorMessage]);

  // Select VIP plan (matches Flutter VIP plan selection logic)
  const selectVipPlan = useCallback(async (plan) => {
    console.log('🔄 CartContext: Selecting VIP plan:', {
      planId: plan?.id,
      planName: plan?.plan_name,
      hasCurrentPlan: !!cartState.selectedVipPlan
    });

    try {
      // Set loading state (matches Flutter cartLoading)
      setCartStatus(CartStatus.CART_LOADING);

      // Determine payment type and VIP ID (matches Flutter logic)
      const paymentType = plan ? 'vip' : 'fullamount';
      const vipId = plan ? plan.id : '';

      console.log('🔄 CartContext: Calling cart API with VIP parameters:', {
        paymentType,
        vipId,
        isWallet: false
      });

      // Call cart API with VIP parameters (matches Flutter getCartData call)
      const response = await cartService.getCartData({
        paymentType,
        vipId,
        isWallet: false
      });

      if (response.success) {
        // Check if cart is empty (no items found)
        const hasCartItems = response.data?.groupedCart?.categories?.length > 0 ||
                            response.data?.groupedCart?.packages?.length > 0;

        if (!hasCartItems && response.message === 'No items found in the cart.') {
          console.log('🛒 CartContext: Empty cart detected in VIP selection, setting NO_DATA_FOUND status');
          updateCartState({
            selectedVipPlan: plan,
            paymentType,
            cartData: null,
            cartRawData: response.rawData,
            status: CartStatus.NO_DATA_FOUND
          });
          return;
        }

        // Update cart state with new data and VIP selection
        const updates = {
          selectedVipPlan: plan,
          paymentType,
          cartData: response.data,
          cartRawData: response.rawData,
          status: CartStatus.SUCCESS
        };

        console.log('✅ CartContext: VIP plan selection successful, updating state:', {
          planSelected: !!plan,
          paymentType,
          hasCartData: !!response.data
        });

        updateCartState(updates);
      } else {
        throw new Error('Failed to select VIP plan');
      }
    } catch (error) {
      console.error('❌ CartContext: VIP plan selection failed:', error);
      setErrorMessage(error.message || 'Failed to select VIP plan');
    }
  }, [updateCartState, cartState.selectedVipPlan, setCartStatus, setErrorMessage]);

  // Refresh cart data while maintaining VIP plan selection (matches Flutter refresh logic)
  const refreshCartData = useCallback(async () => {
    console.log('🔄 CartContext: Refreshing cart data with current VIP selection...');

    try {
      setCartStatus(CartStatus.CART_LOADING);

      // Use current VIP plan selection for refresh
      const currentPaymentType = cartState.paymentType || 'fullamount';
      const currentVipId = cartState.selectedVipPlan?.id || '';

      const response = await cartService.getCartData({
        paymentType: currentPaymentType,
        vipId: currentVipId,
        isWallet: false
      });

      if (response.success) {
        // Check if cart is empty (no items found)
        const hasCartItems = response.data?.groupedCart?.categories?.length > 0 ||
                            response.data?.groupedCart?.packages?.length > 0;

        if (!hasCartItems && response.message === 'No items found in the cart.') {
          console.log('🛒 CartContext: Empty cart detected in refresh, setting NO_DATA_FOUND status');
          updateCartState({
            cartData: null,
            cartRawData: response.rawData,
            status: CartStatus.NO_DATA_FOUND
          });
          return;
        }

        // Update cart data while preserving VIP plan selection
        const updates = {
          cartData: response.data,
          cartRawData: response.rawData,
          status: CartStatus.SUCCESS
        };

        console.log('✅ CartContext: Cart refresh successful');
        updateCartState(updates);
      } else {
        throw new Error('Failed to refresh cart data');
      }
    } catch (error) {
      console.error('❌ CartContext: Cart refresh failed:', error);
      setErrorMessage(error.message || 'Failed to refresh cart data');
    }
  }, [cartState.paymentType, cartState.selectedVipPlan, updateCartState, setCartStatus, setErrorMessage]);

  // Select payment type (matches Flutter payment type selection)
  const selectPaymentType = useCallback(async (paymentType) => {
    console.log('🔄 CartContext: Selecting payment type:', paymentType);

    try {
      console.log('🔄 CartContext: Setting cart status to loading...');
      setCartStatus(CartStatus.CART_LOADING);

      const apiParams = {
        paymentType,
        vipId: cartState.selectedVipPlan?.id || '',
        isWallet: false
      };

      console.log('🔄 CartContext: Calling cart API with params:', apiParams);

      // Call cart API with new payment type (matches Flutter logic)
      const response = await cartService.getCartData(apiParams);

      console.log('🔄 CartContext: Cart API response received:', {
        success: response?.success,
        hasData: !!response?.data,
        totalPrice: response?.data?.totalPrice
      });

      if (response.success) {
        // Check if cart is empty (no items found)
        const hasCartItems = response.data?.groupedCart?.categories?.length > 0 ||
                            response.data?.groupedCart?.packages?.length > 0;

        if (!hasCartItems && response.message === 'No items found in the cart.') {
          console.log('🛒 CartContext: Empty cart detected in payment type selection, setting NO_DATA_FOUND status');
          updateCartState({
            paymentType,
            cartData: null,
            cartRawData: response.rawData,
            status: CartStatus.NO_DATA_FOUND
          });
          return;
        }

        // Update cart state with new payment type and data
        const updates = {
          paymentType,
          cartData: response.data,
          cartRawData: response.rawData,
          status: CartStatus.SUCCESS
        };

        console.log('✅ CartContext: Payment type selection successful, updating state:', {
          paymentType,
          hasCartData: !!response.data,
          totalPrice: response.data?.totalPrice
        });

        updateCartState(updates);
      } else {
        throw new Error('Failed to update payment type');
      }
    } catch (error) {
      console.error('❌ CartContext: Payment type selection failed:', error);
      setErrorMessage(error.message || 'Failed to update payment type');
    }
  }, [cartState.selectedVipPlan, updateCartState, setCartStatus, setErrorMessage]);

  // Toggle wallet (matches Flutter SwitchWalletCheckEvent)
  const toggleWallet = useCallback(async () => {
    console.log('🔄 CartContext: toggleWallet called, current state:', cartState.isWalletEnabled);

    try {
      setCartStatus(CartStatus.CART_LOADING);

      const newWalletState = !cartState.isWalletEnabled;

      const apiParams = {
        paymentType: cartState.paymentType || 'fullamount',
        vipId: cartState.selectedVipPlan?.id || '',
        isWallet: newWalletState
      };

      console.log('🔄 CartContext: Calling cart API with wallet toggle:', apiParams);

      // Call cart API with wallet toggle (matches Flutter logic)
      const response = await cartService.getCartData(apiParams);

      if (response.success) {
        // Check if cart is empty (no items found)
        const hasCartItems = response.data?.groupedCart?.categories?.length > 0 ||
                            response.data?.groupedCart?.packages?.length > 0;

        if (!hasCartItems && response.message === 'No items found in the cart.') {
          console.log('🛒 CartContext: Empty cart detected in wallet toggle, setting NO_DATA_FOUND status');
          updateCartState({
            cartData: null,
            cartRawData: response.rawData,
            isWalletEnabled: newWalletState,
            status: CartStatus.NO_DATA_FOUND
          });
          return;
        }

        // Update cart state with new wallet state and data
        const updates = {
          cartData: response.data,
          cartRawData: response.rawData,
          isWalletEnabled: newWalletState,
          status: CartStatus.SUCCESS
        };

        console.log('✅ CartContext: Wallet toggle successful, new state:', newWalletState);
        updateCartState(updates);
      } else {
        throw new Error('Failed to toggle wallet');
      }
    } catch (error) {
      console.error('❌ CartContext: Wallet toggle failed:', error);
      setErrorMessage(error.message || 'Failed to toggle wallet');
    }
  }, [cartState.isWalletEnabled, cartState.paymentType, cartState.selectedVipPlan, setCartStatus, updateCartState, setErrorMessage]);

  /**
   * Apply Coupon
   * Handles coupon application and cart refresh
   */
  const applyCoupon = useCallback(async (couponData) => {
    try {
      console.log('🎫 CartContext: Applying coupon:', couponData);

      // Update cart state with coupon data
      const updates = {
        couponData: couponData,
        isCouponApplied: true
      };

      updateCartState(updates);

      // Refresh cart data to get updated pricing
      await refreshCartData();

      console.log('✅ CartContext: Coupon applied successfully');
    } catch (error) {
      console.error('❌ CartContext: Failed to apply coupon:', error);
      setErrorMessage(error.message || 'Failed to apply coupon');
    }
  }, [updateCartState, refreshCartData, setErrorMessage]);

  /**
   * Remove Coupon
   * Handles coupon removal and cart refresh
   */
  const removeCoupon = useCallback(async () => {
    try {
      console.log('🎫 CartContext: Removing applied coupon');

      // Clear coupon data from cart state
      const updates = {
        couponData: null,
        isCouponApplied: false
      };

      updateCartState(updates);

      // Refresh cart data to get updated pricing
      await refreshCartData();

      console.log('✅ CartContext: Coupon removed successfully');
    } catch (error) {
      console.error('❌ CartContext: Failed to remove coupon:', error);
      setErrorMessage(error.message || 'Failed to remove coupon');
    }
  }, [updateCartState, refreshCartData, setErrorMessage]);

  // Context value
  const value = {
    // State - working components (VIP plans now accessed via cartState props)
    cartState,
    cartData,
    cartRawData,
    frequentlyAddedServices,
    noOfServicesItems,
    noOfPackageItems,
    status,
    errorMessage,
    isLoading: status === CartStatus.CART_LOADING,
    isInitialized,

    // VIP Plans state (needed for components)
    selectedVipPlan: cartState.selectedVipPlan,
    vipPlans: cartState.vipPlans,

    // Actions - working components + VIP plans + Payment options + Coupons
    fetchCartData,
    refreshCartData,
    selectVipPlan, // VIP plan selection
    selectPaymentType, // Payment type selection
    toggleWallet, // Wallet toggle
    applyCoupon, // Coupon application
    removeCoupon, // Coupon removal
    updateCartState,
    setCartStatus,
    setErrorMessage
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
