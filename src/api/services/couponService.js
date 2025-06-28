import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Coupon Service
 * Handles all coupon-related API operations
 * Matches Flutter API patterns and response handling exactly
 */
class CouponService {
  /**
   * Get available coupons list
   * Matches Flutter getAvailableCouponsList implementation
   * @returns {Promise<Object>} Available coupons response
   */
  async getAvailableCoupons() {
    try {
      console.log('🎫 CouponService: Fetching available coupons...');

      const response = await axiosInstance.get(API_ENDPOINTS.AVAILABLE_COUPONS);

      console.log('🎫 CouponService: Available coupons response:', response.data);

      // Match Flutter response handling pattern
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          return {
            success: true,
            data: response.data.data || [],
            message: response.data.message || 'Coupons fetched successfully'
          };
        } else {
          return {
            success: false,
            data: [],
            message: response.data.message || 'No coupons available'
          };
        }
      } else {
        return {
          success: false,
          data: [],
          message: 'Invalid response format'
        };
      }
    } catch (error) {
      console.error('❌ CouponService: Error fetching available coupons:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch available coupons');
    }
  }

  /**
   * Apply coupon code
   * Matches Flutter applyCouponCode implementation exactly
   * @param {string} couponCode - Coupon code to apply
   * @returns {Promise<Object>} Apply coupon response
   */
  async applyCoupon(couponCode) {
    try {
      console.log('🎫 CouponService: Applying coupon...', couponCode);

      // Match Flutter payload structure exactly: {"promocode": code}
      const response = await axiosInstance.post(API_ENDPOINTS.APPLY_COUPON, {
        promocode: couponCode
      });

      console.log('🎫 CouponService: Coupon application response:', response.data);

      // Match Flutter response handling pattern
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          return {
            success: true,
            data: response.data,
            message: response.data.message || 'Coupon applied successfully',
            // Extract coupon response data matching Flutter AvailableCouponsResponseModel
            couponResponse: {
              couponCode: couponCode,
              convinencecharge: response.data.convinencecharge,
              couponValue: response.data.coupon_value,
              remainingConvcience: response.data.remaining_convcience,
              itemDiscountAmount: response.data.item_discount_amount,
              isFree: response.data.is_free,
              rateCardDetails: response.data.rateCardDetails || null
            }
          };
        } else {
          return {
            success: false,
            data: null,
            message: response.data.message || 'Failed to apply coupon'
          };
        }
      } else {
        return {
          success: false,
          data: null,
          message: 'Invalid response format'
        };
      }
    } catch (error) {
      console.error('❌ CouponService: Error applying coupon:', error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to apply coupon';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove applied coupon
   * This would typically call a remove coupon API endpoint
   * For now, we'll handle this through cart refresh
   * @returns {Promise<Object>} Remove coupon response
   */
  async removeCoupon() {
    try {
      console.log('🎫 CouponService: Removing applied coupon...');
      
      // TODO: Implement actual remove coupon API call if backend supports it
      // For now, return success to trigger cart refresh
      return {
        success: true,
        message: 'Coupon removed successfully'
      };
    } catch (error) {
      console.error('❌ CouponService: Error removing coupon:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to remove coupon');
    }
  }
}

// Export singleton instance
const couponService = new CouponService();
export default couponService;
