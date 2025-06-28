import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

class OrderService {
  /**
   * Get orders by status
   * @param {string} status - Order status: 'accepted', 'upcoming', 'completed', 'cancelled'
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Number of items per page (default: 10)
   * @returns {Promise<Object>} API response with orders data
   */
  async getOrdersByStatus(status, page = 1, limit = 10) {
    try {
      console.log('🚀 OrderService - Fetching orders for status:', status, { page, limit });

      const response = await axiosInstance.get(API_ENDPOINTS.GET_ORDERS_BY_STATUS, {
        params: {
          status,
          page,
          limit
        }
      });

      console.log('🔍 OrderService - Raw API response for status:', status, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'NO_DATA'
      });

      // Enhanced data extraction with multiple fallbacks
      let ordersData = [];

      if (response.data) {
        // Try different possible data structures
        ordersData = response.data.bookings ||
                    response.data.data ||
                    response.data.orders ||
                    response.data.items ||
                    (Array.isArray(response.data) ? response.data : []);
      }

      console.log('📊 OrderService - Extracted orders data:', {
        originalDataStructure: response.data ? Object.keys(response.data) : 'NO_DATA',
        extractedOrdersCount: Array.isArray(ordersData) ? ordersData.length : 'NOT_ARRAY',
        extractedOrders: ordersData,
        firstOrder: Array.isArray(ordersData) && ordersData.length > 0 ? ordersData[0] : 'NO_ORDERS'
      });

      // Ensure ordersData is always an array
      if (!Array.isArray(ordersData)) {
        console.warn('⚠️ OrderService - Orders data is not an array, converting:', ordersData);
        ordersData = ordersData ? [ordersData] : [];
      }

      // Handle "No bookings found" as a successful response with empty data
      const isNoBookingsFound = response.data?.status === false &&
                                response.data?.message === "No bookings found.";

      return {
        success: response.data?.status !== false || isNoBookingsFound, // Treat "No bookings found" as success
        message: response.data?.message || 'Orders fetched successfully',
        data: ordersData,
        pagination: {
          page,
          limit,
          total: response.data?.total || response.data?.count || ordersData.length,
          totalPages: response.data?.pages || response.data?.totalPages || Math.ceil(ordersData.length / limit)
        },
        rawResponse: response.data // Include raw response for debugging
      };
    } catch (error) {
      console.error('❌ OrderService - getOrdersByStatus error:', {
        status,
        page,
        limit,
        error: error.message,
        response: error.response?.data,
        statusCode: error.response?.status,
        url: error.config?.url
      });

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }

      // Check if it's a network error
      if (!error.response) {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get detailed information for a specific order
   * @param {string} orderId - The booking ID
   * @param {string} itemId - The booking item ID
   * @returns {Promise<Object>} API response with order details
   */
  async getOrderDetail(orderId, itemId) {
    try {
      const endpoint = API_ENDPOINTS.GET_ORDER_DETAIL(orderId, itemId);
      console.log('🔍 OrderService - getOrderDetail called with:', { orderId, itemId, endpoint });

      const response = await axiosInstance.get(endpoint);

      console.log('✅ OrderService - getOrderDetail response:', response.data);
      return {
        success: response.data.status || true,
        message: response.data.message || 'Order details fetched successfully',
        data: response.data.booking || response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrderService - getOrderDetail error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order details');
    }
  }

  /**
   * Cancel an order
   * @param {string} bookingId - The booking item ID to cancel
   * @param {string} cancelReason - Reason for cancellation
   * @returns {Promise<Object>} API response
   */
  async cancelOrder(bookingId, cancelReason) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CANCEL_ORDER, {
        booking_id: bookingId,
        cancel_reason: cancelReason
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Order cancelled successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - cancelOrder error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to cancel order');
    }
  }

  /**
   * Reschedule an order
   * @param {string} bookingId - The booking item ID to reschedule
   * @param {string} newDate - New booking date
   * @param {string} newTimeFrom - New start time
   * @param {string} newTimeTo - New end time
   * @param {string} rescheduleReason - Reason for rescheduling
   * @returns {Promise<Object>} API response
   */
  async rescheduleOrder(bookingId, newDate, newTimeFrom, newTimeTo, rescheduleReason) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.RESCHEDULE_ORDER, {
        booking_id: bookingId,
        booking_date: newDate,
        booking_time_from: newTimeFrom,
        booking_time_to: newTimeTo,
        reschedule_reason: rescheduleReason
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Order rescheduled successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - rescheduleOrder error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reschedule order');
    }
  }

  /**
   * Get payment details for an order
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} API response with payment details
   */
  async getPaymentDetails(bookingId) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.GET_PAYMENT_DETAILS, {
        booking_id: bookingId
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Payment details fetched successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - getPaymentDetails error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payment details');
    }
  }

  /**
   * Process partial payment for an order (Flutter-aligned)
   * @param {Object} paymentData - Payment data object
   * @param {string} paymentData.itemId - The booking item ID
   * @param {string} paymentData.razorpayOrderId - Razorpay payment ID
   * @param {string} paymentData.paymentStatus - Payment status ('Online')
   * @param {string} paymentData.remainingConvenienceCharge - Remaining convenience charge
   * @returns {Promise<Object>} API response
   */
  async processPartialPayment(paymentData) {
    try {
      console.log('💳 OrderService - Processing partial payment:', paymentData);

      // Prepare payload exactly like Flutter payNowPartialBookingFunction
      const payload = {
        id: paymentData.itemId,
        razorpay_order_id: paymentData.razorpayOrderId,
        payment_status: paymentData.paymentStatus,
      };

      // Add remaining convenience charge only if not empty (matches Flutter logic)
      if (paymentData.remainingConvenienceCharge && paymentData.remainingConvenienceCharge !== '') {
        payload.remaining_convenience_charge = paymentData.remainingConvenienceCharge;
      }

      const response = await axiosInstance.post(API_ENDPOINTS.PARTIAL_PAYMENT, payload);

      console.log('✅ OrderService - Partial payment response:', response.data);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Partial payment processed successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrderService - processPartialPayment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to process partial payment');
    }
  }

  /**
   * Submit feedback/rating for a completed order
   * @param {string} bookingId - The booking item ID
   * @param {number} rating - Rating (1-5)
   * @param {string} comment - Feedback comment
   * @returns {Promise<Object>} API response
   */
  async submitFeedback(bookingId, rating, comment) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.SUBMIT_FEEDBACK, {
        booking_id: bookingId,
        rating,
        comment
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Feedback submitted successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - submitFeedback error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to submit feedback');
    }
  }

  /**
   * Report an issue with an order
   * @param {string} bookingId - The booking item ID
   * @param {string} issue - Issue description
   * @returns {Promise<Object>} API response
   */
  async reportIssue(bookingId, issue) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REPORT_ISSUE, {
        booking_id: bookingId,
        issue
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Issue reported successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - reportIssue error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to report issue');
    }
  }

  /**
   * Get latest completed booking for user
   * @returns {Promise<Object>} API response with latest completed booking
   */
  async getLatestCompletedBooking() {
    try {
      const response = await axiosInstance.get('booking/latest-completed');

      return {
        success: response.data.status || true,
        message: response.data.message || 'Latest completed booking fetched successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - getLatestCompletedBooking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch latest completed booking');
    }
  }

  /**
   * Get latest failed booking for user
   * @returns {Promise<Object>} API response with latest failed booking
   */
  async getLatestFailedBooking() {
    try {
      const response = await axiosInstance.get('booking/latest-failed');

      return {
        success: response.data.status || true,
        message: response.data.message || 'Latest failed booking fetched successfully',
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('OrderService - getLatestFailedBooking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch latest failed booking');
    }
  }

  /**
   * Helper method to format order status for display
   * @param {string} status - Raw status from API
   * @returns {string} Formatted status
   */
  formatOrderStatus(status) {
    const statusMap = {
      'accepted': 'Accepted',
      'running': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'initiated': 'Initiated'
    };

    return statusMap[status] || status;
  }

  /**
   * Helper method to get status color
   * @param {string} status - Order status
   * @returns {string} Color class or hex code
   */
  getStatusColor(status) {
    const colorMap = {
      'accepted': '#10B981', // Green
      'running': '#F59E0B', // Orange
      'completed': '#10B981', // Green
      'cancelled': '#EF4444', // Red
      'initiated': '#6B7280' // Gray
    };

    return colorMap[status] || '#6B7280';
  }

  /**
   * Helper method to determine if order can be cancelled
   * @param {string} status - Order status
   * @returns {boolean} Whether order can be cancelled
   */
  canCancelOrder(status) {
    return ['accepted', 'running'].includes(status);
  }

  /**
   * Helper method to determine if order can be rescheduled
   * @param {string} status - Order status
   * @returns {boolean} Whether order can be rescheduled
   */
  canRescheduleOrder(status) {
    return ['accepted'].includes(status);
  }
}

export default new OrderService();
