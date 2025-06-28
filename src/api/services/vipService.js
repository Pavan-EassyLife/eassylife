import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * VIP Service - API integration for VIP plans and subscriptions
 * Provides methods for:
 * - Fetching VIP plans
 * - Purchasing VIP subscriptions
 * - Managing VIP status
 */
class VipService {
  constructor() {
    // No need for constructor since we use axiosInstance
  }

  /**
   * Get all available VIP plans
   * @returns {Promise<Object>} VIP plans response
   */
  async getVipPlans() {
    try {
      console.log('🔥 VipService: Fetching VIP plans');
      
      const response = await axiosInstance.get('vip-plans/');
      
      console.log('✅ VipService: VIP plans fetched successfully', {
        status: response.data?.status,
        plansCount: response.data?.data?.length || 0
      });

      return {
        status: true,
        data: response.data?.data || [],
        message: response.data?.message || 'VIP plans fetched successfully'
      };
    } catch (error) {
      console.error('❌ VipService: Error fetching VIP plans', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        status: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch VIP plans'
      };
    }
  }

  /**
   * Purchase a VIP plan
   * @param {Object} purchaseData - Purchase details
   * @param {string} purchaseData.planId - VIP plan ID
   * @param {string} purchaseData.paymentId - Razorpay payment ID
   * @param {number} purchaseData.amount - Payment amount
   * @returns {Promise<Object>} Purchase response
   */
  async purchaseVipPlan(purchaseData) {
    try {
      console.log('🔥 VipService: Purchasing VIP plan', {
        planId: purchaseData.planId,
        amount: purchaseData.amount
      });

      const response = await axiosInstance.post('vip-plans/purchase/', {
        plan_id: purchaseData.planId,
        payment_id: purchaseData.paymentId,
        amount: purchaseData.amount,
        payment_method: 'razorpay'
      });

      console.log('✅ VipService: VIP plan purchased successfully', {
        status: response.data?.status,
        subscriptionId: response.data?.subscription_id
      });

      return {
        status: true,
        data: response.data?.data || {},
        subscription_id: response.data?.subscription_id,
        message: response.data?.message || 'VIP plan purchased successfully'
      };
    } catch (error) {
      console.error('❌ VipService: Error purchasing VIP plan', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        status: false,
        data: {},
        message: error.response?.data?.message || 'Failed to purchase VIP plan'
      };
    }
  }

  /**
   * Get user's VIP subscription status
   * @returns {Promise<Object>} VIP status response
   */
  async getVipStatus() {
    try {
      console.log('🔥 VipService: Fetching VIP status');
      
      const response = await axiosInstance.get('user/vip-status/');
      
      console.log('✅ VipService: VIP status fetched successfully', {
        isVip: response.data?.is_vip,
        expiryDate: response.data?.expiry_date
      });

      return {
        status: true,
        data: {
          isVip: response.data?.is_vip || false,
          planName: response.data?.plan_name || null,
          expiryDate: response.data?.expiry_date || null,
          subscriptionId: response.data?.subscription_id || null
        },
        message: response.data?.message || 'VIP status fetched successfully'
      };
    } catch (error) {
      console.error('❌ VipService: Error fetching VIP status', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        status: false,
        data: {
          isVip: false,
          planName: null,
          expiryDate: null,
          subscriptionId: null
        },
        message: error.response?.data?.message || 'Failed to fetch VIP status'
      };
    }
  }

  /**
   * Get VIP benefits and features
   * @returns {Promise<Object>} VIP benefits response
   */
  async getVipBenefits() {
    try {
      console.log('🔥 VipService: Fetching VIP benefits');
      
      // For now, return static benefits data
      // This can be replaced with API call when backend endpoint is available
      const benefits = [
        {
          id: 1,
          title: 'Exclusive Offers',
          description: 'Get access to VIP-only deals and discounts',
          icon: 'discount'
        },
        {
          id: 2,
          title: 'Huge Discount on Services',
          description: 'Save up to 30% on all service bookings',
          icon: 'coupon'
        },
        {
          id: 3,
          title: 'No Cancellation Fees',
          description: 'Cancel bookings without any charges',
          icon: 'no-fees'
        },
        {
          id: 4,
          title: 'Priority Booking',
          description: 'Get priority slots for service bookings',
          icon: 'priority'
        },
        {
          id: 5,
          title: 'Free Reschedule',
          description: 'Reschedule your bookings for free',
          icon: 'reschedule'
        }
      ];

      console.log('✅ VipService: VIP benefits fetched successfully');

      return {
        status: true,
        data: benefits,
        message: 'VIP benefits fetched successfully'
      };
    } catch (error) {
      console.error('❌ VipService: Error fetching VIP benefits', {
        message: error.message
      });

      return {
        status: false,
        data: [],
        message: 'Failed to fetch VIP benefits'
      };
    }
  }

  /**
   * Cancel VIP subscription
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelVipSubscription() {
    try {
      console.log('🔥 VipService: Cancelling VIP subscription');
      
      const response = await axiosInstance.post('vip-plans/cancel/');
      
      console.log('✅ VipService: VIP subscription cancelled successfully');

      return {
        status: true,
        data: response.data?.data || {},
        message: response.data?.message || 'VIP subscription cancelled successfully'
      };
    } catch (error) {
      console.error('❌ VipService: Error cancelling VIP subscription', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        status: false,
        data: {},
        message: error.response?.data?.message || 'Failed to cancel VIP subscription'
      };
    }
  }

  /**
   * Validate VIP plan data
   * @param {Object} planData - Plan data to validate
   * @returns {Object} Validation result
   */
  validatePlanData(planData) {
    const errors = [];

    if (!planData.id) {
      errors.push('Plan ID is required');
    }

    if (!planData.plan_name) {
      errors.push('Plan name is required');
    }

    if (!planData.price && !planData.discount_price) {
      errors.push('Plan price is required');
    }

    if (!planData.validity_period) {
      errors.push('Validity period is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format plan data for display
   * @param {Object} planData - Raw plan data from API
   * @returns {Object} Formatted plan data
   */
  formatPlanData(planData) {
    return {
      id: planData.id,
      planName: planData.plan_name,
      price: parseFloat(planData.price || 0),
      discountPrice: parseFloat(planData.discount_price || planData.price || 0),
      discountPercentage: parseFloat(planData.discount_percentage || 0),
      validityPeriod: parseInt(planData.validity_period || 0),
      platformFees: Boolean(planData.platform_fees),
      noOfBookings: parseInt(planData.no_of_bookings || 0),
      description: planData.description || '',
      image: planData.image || null,
      status: Boolean(planData.status)
    };
  }
}

// Create and export singleton instance
export const vipService = new VipService();
export default vipService;
