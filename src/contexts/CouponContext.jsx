import React, { createContext, useContext, useReducer, useCallback } from 'react';
import couponService from '../api/services/couponService';
import { 
  CouponStatus, 
  CouponState, 
  createAvailableCouponsModelFromJson,
  createAvailableCouponsResponseModel 
} from '../types/coupon';
import toast from 'react-hot-toast';

// Create Coupon Context
const CouponContext = createContext();

/**
 * Coupon Reducer
 * Matches Flutter AvailableCouponsBloc state management pattern
 */
const couponReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    
    case 'SET_LOADING':
      return { ...state, status: CouponStatus.AVAILABLE_COUPONS_LOADING };
    
    case 'SET_SEARCH_LOADING':
      return { ...state, status: CouponStatus.SEARCH_COUPON_APPLY_LOADING };
    
    case 'SET_APPLY_LOADING':
      return { 
        ...state, 
        status: CouponStatus.COUPON_APPLY_LOADING,
        selectedInt: action.payload 
      };
    
    case 'SET_COUPONS_SUCCESS':
      return {
        ...state,
        status: CouponStatus.SUCCESS,
        availableCouponsList: action.payload,
        errorMessage: null
      };
    
    case 'SET_COUPON_APPLIED_SUCCESS':
      return {
        ...state,
        status: CouponStatus.COUPON_APPLIED_SUCCESSFULLY,
        couponResponse: action.payload,
        errorMessage: null
      };
    
    case 'SET_NO_DATA_FOUND':
      return {
        ...state,
        status: CouponStatus.NO_DATA_FOUND,
        availableCouponsList: [],
        errorMessage: action.payload || 'No coupons available'
      };
    
    case 'SET_FAILURE':
      return {
        ...state,
        status: CouponStatus.FAILURE,
        errorMessage: action.payload || 'Something went wrong'
      };
    
    case 'RESET_STATE':
      return { ...CouponState };
    
    default:
      return state;
  }
};

/**
 * Coupon Context Provider
 * Implements Flutter AvailableCouponsBloc functionality
 */
export const CouponProvider = ({ children, selectedCouponResponse = null }) => {
  const [state, dispatch] = useReducer(couponReducer, {
    ...CouponState,
    couponResponse: selectedCouponResponse
  });

  /**
   * Fetch Available Coupons Data
   * Matches Flutter _onFetchAvailableCouponsData
   */
  const fetchAvailableCoupons = useCallback(async () => {
    try {
      console.log('🎫 CouponContext: Fetching available coupons...');
      
      dispatch({ type: 'SET_STATUS', payload: CouponStatus.INITIAL });
      dispatch({ type: 'SET_LOADING' });

      const response = await couponService.getAvailableCoupons();

      if (response.success && response.data) {
        // Convert response data to AvailableCouponsModel format
        const couponList = response.data.map(coupon => 
          createAvailableCouponsModelFromJson(coupon)
        );
        
        console.log('✅ CouponContext: Coupons fetched successfully:', couponList.length);
        dispatch({ type: 'SET_COUPONS_SUCCESS', payload: couponList });
      } else {
        console.log('⚠️ CouponContext: No coupons found');
        dispatch({ type: 'SET_NO_DATA_FOUND', payload: response.message });
      }
    } catch (error) {
      console.error('❌ CouponContext: Error fetching coupons:', error);
      dispatch({ type: 'SET_FAILURE', payload: error.message });
    }
  }, []);

  /**
   * Apply Coupon from Text Field
   * Matches Flutter _onApplyCouponFromTextfield
   */
  const applyCouponFromTextField = useCallback(async (code) => {
    try {
      console.log('🎫 CouponContext: Applying coupon from text field:', code);
      
      if (!code || code.trim().length === 0) {
        toast.error('Please enter a promo code');
        return;
      }

      dispatch({ type: 'SET_SEARCH_LOADING' });

      const response = await couponService.applyCoupon(code);

      if (response.success) {
        const couponData = createAvailableCouponsResponseModel({
          couponCode: code,
          convinencecharge: response.data.convinencecharge,
          couponValue: response.data.coupon_value,
          remainingConvcience: response.data.remaining_convcience,
          itemDiscountAmount: response.data.item_discount_amount,
          isFree: response.data.is_free,
          rateCardDetails: response.data.rateCardDetails
        });

        console.log('✅ CouponContext: Coupon applied from text field successfully');
        dispatch({ type: 'SET_COUPON_APPLIED_SUCCESS', payload: couponData });
        
        // Show success message
        toast.success(response.message || 'Coupon applied successfully');
      } else {
        console.log('⚠️ CouponContext: Failed to apply coupon from text field');
        dispatch({ type: 'SET_FAILURE', payload: response.message });
        toast.error(response.message || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('❌ CouponContext: Error applying coupon from text field:', error);
      dispatch({ type: 'SET_FAILURE', payload: error.message });
      toast.error(error.message || 'Failed to apply coupon');
    }
  }, []);

  /**
   * Apply Coupon from List
   * Matches Flutter _onApplyCoupon
   */
  const applyCoupon = useCallback(async (id, currentIndex, code) => {
    try {
      console.log('🎫 CouponContext: Applying coupon from list:', { id, code, currentIndex });
      
      dispatch({ type: 'SET_APPLY_LOADING', payload: currentIndex });

      const response = await couponService.applyCoupon(code);

      if (response.success) {
        const couponData = createAvailableCouponsResponseModel({
          couponCode: code,
          couponId: id,
          convinencecharge: response.data.convinencecharge,
          couponValue: response.data.coupon_value,
          remainingConvcience: response.data.remaining_convcience,
          itemDiscountAmount: response.data.item_discount_amount,
          isFree: response.data.is_free,
          rateCardDetails: response.data.rateCardDetails
        });

        console.log('✅ CouponContext: Coupon applied from list successfully');
        dispatch({ type: 'SET_COUPON_APPLIED_SUCCESS', payload: couponData });
        
        // Show success message
        toast.success(response.message || 'Coupon applied successfully');
      } else {
        console.log('⚠️ CouponContext: Failed to apply coupon from list');
        dispatch({ type: 'SET_FAILURE', payload: response.message });
        toast.error(response.message || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('❌ CouponContext: Error applying coupon from list:', error);
      dispatch({ type: 'SET_FAILURE', payload: error.message });
      toast.error(error.message || 'Failed to apply coupon');
    }
  }, []);

  /**
   * Refresh Available Coupons
   * Matches Flutter _onRefreshAvailableCouponsData
   */
  const refreshAvailableCoupons = useCallback(async () => {
    console.log('🔄 CouponContext: Refreshing available coupons...');
    await fetchAvailableCoupons();
  }, [fetchAvailableCoupons]);

  /**
   * Reset Coupon State
   */
  const resetCouponState = useCallback(() => {
    console.log('🔄 CouponContext: Resetting coupon state...');
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    isLoading: state.status === CouponStatus.AVAILABLE_COUPONS_LOADING,
    isSearchLoading: state.status === CouponStatus.SEARCH_COUPON_APPLY_LOADING,
    isApplyLoading: state.status === CouponStatus.COUPON_APPLY_LOADING,
    isSuccess: state.status === CouponStatus.SUCCESS,
    isCouponAppliedSuccessfully: state.status === CouponStatus.COUPON_APPLIED_SUCCESSFULLY,
    
    // Actions
    fetchAvailableCoupons,
    applyCouponFromTextField,
    applyCoupon,
    refreshAvailableCoupons,
    resetCouponState
  };

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
};

/**
 * Custom hook to use Coupon Context
 */
export const useCouponContext = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCouponContext must be used within a CouponProvider');
  }
  return context;
};
