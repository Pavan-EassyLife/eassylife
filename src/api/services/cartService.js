import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Cart Service - Handles all cart-related API operations
 * Based on Flutter cart implementation and backend API endpoints
 */
class CartService {
  /**
   * Get cart data with payment type, VIP plan, and wallet options
   * @param {Object} params - Cart fetch parameters
   * @param {string} params.paymentType - 'vip' or 'fullamount'
   * @param {string} [params.vipId] - VIP plan ID (optional)
   * @param {boolean} params.isWallet - Whether wallet payment is enabled
   * @returns {Promise<Object>} Cart data response
   */
  async getCartData({ paymentType, vipId = '', isWallet = false }) {
    try {
      console.log('🛒 CartService: Fetching cart data...', { paymentType, vipId, isWallet });

      const params = {
        type: paymentType,
        wallet: isWallet
      };

      // Add VIP ID if provided
      if (vipId) {
        params.vip_id = vipId;
      }

      const response = await axiosInstance.get(API_ENDPOINTS.GET_CART, { params });

      console.log('🛒 CartService: Cart data response:', {
        status: response.data.status,
        hasData: !!response.data.data,
        totalPrice: response.data.data?.totalPrice,
        itemCount: response.data.data?.groupedCart?.categories?.length || 0
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Cart data fetched successfully',
        data: response.data.data,
        rawData: response.data
      };
    } catch (error) {
      console.error('❌ CartService: Error fetching cart data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cart data');
    }
  }

  /**
   * Add item to cart
   * @param {Object} item - Item to add to cart
   * @returns {Promise<Object>} Add to cart response
   */
  async addToCart(item) {
    try {
      console.log('🛒 CartService: Adding item to cart...', item);

      const response = await axiosInstance.post(API_ENDPOINTS.ADD_TO_CART, item);

      console.log('🛒 CartService: Item added to cart:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Item added to cart successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error adding item to cart:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add item to cart');
    }
  }

  /**
   * Remove item from cart
   * @param {string} itemId - ID of the item to remove
   * @returns {Promise<Object>} Remove from cart response
   */
  async removeFromCart(itemId) {
    try {
      console.log('🛒 CartService: Removing item from cart...', itemId);

      const response = await axiosInstance.delete(`${API_ENDPOINTS.REMOVE_FROM_CART}/${itemId}`);

      console.log('🛒 CartService: Item removed from cart:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Item removed from cart successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error removing item from cart:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to remove item from cart');
    }
  }

  /**
   * Update cart item date/time
   * @param {string} itemId - ID of the item to update
   * @param {Object} dateTime - New date and time
   * @returns {Promise<Object>} Update response
   */
  async updateCartItemDateTime(itemId, dateTime) {
    try {
      console.log('🛒 CartService: Updating cart item date/time...', { itemId, dateTime });

      const response = await axiosInstance.put(`${API_ENDPOINTS.UPDATE_CART_DATE}/${itemId}`, dateTime);

      console.log('🛒 CartService: Cart item date/time updated:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Date/time updated successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error updating cart item date/time:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update date/time');
    }
  }

  /**
   * Update cart delivery address
   * @param {string} addressId - ID of the new address
   * @returns {Promise<Object>} Update response
   */
  async updateCartAddress(addressId) {
    try {
      console.log('🛒 CartService: Updating cart address...', addressId);

      const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_CART_ADDRESS, {
        address_id: addressId
      });

      console.log('🛒 CartService: Cart address updated:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Address updated successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error updating cart address:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update address');
    }
  }

  /**
   * Apply promo code/coupon to cart
   * @param {string} couponCode - Coupon code to apply
   * @returns {Promise<Object>} Apply coupon response
   */
  async applyCoupon(couponCode) {
    try {
      console.log('🛒 CartService: Applying coupon...', couponCode);

      const response = await axiosInstance.post(API_ENDPOINTS.APPLY_COUPON, {
        coupon_code: couponCode
      });

      console.log('🛒 CartService: Coupon applied:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Coupon applied successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error applying coupon:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to apply coupon');
    }
  }

  /**
   * Check cart availability before checkout
   * @param {number} totalAmount - Total cart amount
   * @returns {Promise<Object>} Availability check response with Razorpay order
   */
  async checkCartAvailability(totalAmount) {
    try {
      console.log('🛒 CartService: Checking cart availability...', totalAmount);

      const response = await axiosInstance.post(API_ENDPOINTS.CHECK_CART_AVAILABILITY, {
        total_amount: totalAmount
      });

      console.log('🛒 CartService: Cart availability checked:', {
        status: response.data.status,
        hasOrderOptions: !!response.data.orderOptions,
        orderId: response.data.orderOptions?.id
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Cart availability checked successfully',
        data: response.data.data,
        orderOptions: response.data.orderOptions
      };
    } catch (error) {
      console.error('❌ CartService: Error checking cart availability:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check cart availability');
    }
  }

  /**
   * Process checkout/payment
   * @param {Object} checkoutData - Checkout data
   * @returns {Promise<Object>} Checkout response
   */
  async processCheckout(checkoutData) {
    try {
      console.log('🛒 CartService: Processing checkout...', checkoutData);

      const response = await axiosInstance.post(API_ENDPOINTS.CHECKOUT, checkoutData);

      console.log('🛒 CartService: Checkout processed:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Checkout processed successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error processing checkout:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to process checkout');
    }
  }

  /**
   * Get VIP plans
   * @returns {Promise<Object>} VIP plans response
   */
  async getVipPlans() {
    try {
      console.log('🛒 CartService: Fetching VIP plans...');

      const response = await axiosInstance.get(API_ENDPOINTS.VIP_PLANS);

      console.log('🛒 CartService: VIP plans fetched:', {
        status: response.data.status,
        planCount: response.data.data?.length || 0,
        fullResponse: response.data,
        firstPlan: response.data.data?.[0],
        allPlans: response.data.data,
        rawResponse: response
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'VIP plans fetched successfully',
        data: response.data.data || []
      };
    } catch (error) {
      console.error('❌ CartService: Error fetching VIP plans:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch VIP plans');
    }
  }

  /**
   * Get donation data
   * @returns {Promise<Object>} Donation data response
   */
  async getDonationData() {
    try {
      console.log('🛒 CartService: Fetching donation data...');

      const response = await axiosInstance.get(API_ENDPOINTS.DONATION_DATA);

      console.log('🛒 CartService: Donation data fetched:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Donation data fetched successfully',
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ CartService: Error fetching donation data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch donation data');
    }
  }

  /**
   * Get frequently added services
   * @returns {Promise<Object>} Frequently added services response
   */
  async getFrequentlyAddedServices() {
    try {
      console.log('🛒 CartService: Fetching frequently added services...');

      const response = await axiosInstance.get(API_ENDPOINTS.FREQUENTLY_ADDED_SERVICES);

      console.log('🛒 CartService: Frequently added services response:', {
        status: response.data.status,
        serviceCount: response.data.data?.length || 0,
        fullResponse: response.data,
        firstService: response.data.data?.[0]
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Frequently added services fetched successfully',
        data: response.data.data || []
      };
    } catch (error) {
      console.error('❌ CartService: Error fetching frequently added services:', error);
      console.error('❌ CartService: Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch frequently added services');
    }
  }
}

// Export singleton instance
const cartService = new CartService();
export default cartService;
