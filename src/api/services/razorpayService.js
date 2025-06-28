/**
 * Razorpay Payment Service
 * Handles Razorpay payment gateway integration for React webapp
 * Matches Flutter RazorpayService functionality with web-specific implementation
 */

class RazorpayService {
  constructor() {
    this.razorpay = null;
    this.isScriptLoaded = false;
    this.scriptLoadPromise = null;
  }

  /**
   * Load Razorpay checkout script dynamically
   * @returns {Promise<boolean>} Script load status
   */
  async loadRazorpayScript() {
    if (this.isScriptLoaded) {
      return true;
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        this.isScriptLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        this.isScriptLoaded = true;
        console.log('💳 Razorpay script loaded successfully');
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  /**
   * Get Razorpay key based on environment
   * Matches Flutter implementation logic
   * @returns {string} Razorpay key
   */
  getRazorpayKey() {
    const isLocal = import.meta.env.VITE_APP_ENV === 'local' || import.meta.env.DEV;
    
    // Keys from Flutter implementation
    const keys = {
      test: 'rzp_test_oMeQeXSMezXF8A', // HARMINDER test key from Flutter
      live: 'rzp_live_tZHTP4IVhOgcVG'  // Live key from Flutter
    };

    return isLocal ? keys.test : keys.live;
  }

  /**
   * Open Razorpay checkout
   * Matches Flutter openCheckout method signature and behavior
   * @param {Object} options - Payment options
   * @param {number} options.total - Total amount in rupees
   * @param {string} options.orderId - Razorpay order ID
   * @param {Function} options.onPaymentSuccess - Success callback
   * @param {Function} options.onPaymentError - Error callback
   * @param {Object} options.userDetails - User details for prefill
   * @returns {Promise<void>}
   */
  async openCheckout({
    total,
    orderId,
    onPaymentSuccess,
    onPaymentError,
    userDetails = {}
  }) {
    try {
      // Ensure Razorpay script is loaded
      await this.loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded');
      }

      // Prepare payment options (matches Flutter implementation)
      const options = {
        key: this.getRazorpayKey(),
        amount: total * 100, // Convert to paisa (matches Flutter: total * 100)
        currency: 'INR',
        name: 'Easylife', // Matches Flutter
        order_id: orderId,
        prefill: {
          contact: userDetails.mobile || '',
          email: userDetails.email || '',
          name: userDetails.name || ''
        },
        theme: {
          color: '#FFA301' // Matches Flutter theme color
        },
        modal: {
          ondismiss: () => {
            console.log('💳 Razorpay checkout dismissed by user');
            if (onPaymentError) {
              onPaymentError('Payment cancelled by user');
            }
          }
        },
        handler: (response) => {
          console.log('💳 Razorpay payment success:', response);
          if (onPaymentSuccess) {
            onPaymentSuccess(response.razorpay_payment_id);
          }
        }
      };

      // Create and open Razorpay instance
      const razorpayInstance = new window.Razorpay(options);
      
      // Handle payment failure
      razorpayInstance.on('payment.failed', (response) => {
        console.error('💳 Razorpay payment failed:', response.error);
        if (onPaymentError) {
          const errorMessage = `${response.error.code} - ${response.error.description}`;
          onPaymentError(errorMessage);
        }
      });

      // Open checkout
      razorpayInstance.open();

    } catch (error) {
      console.error('💳 Error opening Razorpay checkout:', error);
      if (onPaymentError) {
        onPaymentError(error.message || 'Failed to open payment gateway');
      }
    }
  }

  /**
   * Validate payment response
   * @param {Object} paymentData - Payment response data
   * @returns {boolean} Validation status
   */
  validatePaymentResponse(paymentData) {
    return !!(
      paymentData &&
      paymentData.razorpay_payment_id &&
      paymentData.razorpay_order_id
    );
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.razorpay = null;
    // Note: We don't remove the script as it might be used by other components
  }
}

// Export singleton instance
const razorpayService = new RazorpayService();
export default razorpayService;
