import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { calculatePaymentAmounts, formatCurrency, validateCartForCheckout } from '../../utils/paymentCalculations';
import cartService from '../../api/services/cartService';
import razorpayService from '../../api/services/razorpayService';
import toast from 'react-hot-toast';

/**
 * Checkout Button Component
 * Matches Flutter checkout button with payment amount display
 * Handles checkout validation and payment initiation
 */
const CheckoutButton = ({ cartState }) => {
  console.log('🛒 CheckoutButton: Rendering with cartState:', cartState);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCartStatus, refreshCartData } = useCart();

  const { cartData, status } = cartState;
  const isProcessing = status === 'paymentProcessing' || status === 'cartLoading';

  // Don't render if no cart data
  if (!cartData) return null;

  // Calculate payment amounts
  const calculations = calculatePaymentAmounts(cartState);
  const validation = validateCartForCheckout(cartState);

  // Handle checkout button click - Complete Flutter-matched implementation
  const handleCheckout = async () => {
    if (!validation.isValid) {
      console.error('Cart validation failed:', validation.error);
      toast.error(validation.error);
      return;
    }

    try {
      console.log('🛒 CheckoutButton: Starting checkout process...');
      setCartStatus('cartLoading'); // Matches Flutter CartStatus.cartLoading

      // Step 1: Check cart availability (matches Flutter CheckCartBeforeCheckOutEvent)
      console.log('🛒 CheckoutButton: Checking cart availability...');
      const availabilityResponse = await cartService.checkCartAvailability(calculations.finalTotalAmount);

      if (!availabilityResponse.success || !availabilityResponse.orderOptions?.id) {
        throw new Error(availabilityResponse.message || 'Failed to create payment order');
      }

      const razorpayOrderId = availabilityResponse.orderOptions.id;
      console.log('🛒 CheckoutButton: Razorpay order created:', razorpayOrderId);

      // Step 2: Set status to allow checkout (matches Flutter CartStatus.allowCheckout)
      setCartStatus('allowCheckout');

      // Step 3: Open Razorpay payment gateway (matches Flutter _razorpayService.openCheckout)
      console.log('🛒 CheckoutButton: Opening Razorpay checkout...');

      await razorpayService.openCheckout({
        total: calculations.finalTotalAmount,
        orderId: razorpayOrderId,
        userDetails: {
          mobile: user?.mobile || '',
          email: user?.email || '',
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
        },
        onPaymentSuccess: async (paymentId) => {
          console.log('🛒 CheckoutButton: Payment successful, processing checkout...', paymentId);
          await handlePaymentSuccess(paymentId, razorpayOrderId);
        },
        onPaymentError: async (error) => {
          console.error('🛒 CheckoutButton: Payment failed:', error);
          await handlePaymentError(error, razorpayOrderId);
        }
      });

    } catch (error) {
      console.error('🛒 CheckoutButton: Checkout failed:', error);
      setCartStatus('failure');
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  // Handle payment success (matches Flutter onPaymentSuccess callback)
  const handlePaymentSuccess = async (paymentId, razorpayOrderId) => {
    try {
      setCartStatus('paymentProcessing'); // Matches Flutter CartStatus.paymentProcessing

      // Prepare checkout data (matches Flutter CheckOutEvent parameters)
      const checkoutData = {
        razorpay_order_id: razorpayOrderId,
        transaction_id: paymentId,
        status: 'accepted', // Matches Flutter bookingStatus: 'accepted'
        payment_status: 'paid', // Matches Flutter paymentStatus: 'paid'
        total_amount: calculations.finalTotalAmount.toString(),
        // Add other required fields from cartState
        coupon_name: cartState.appliedCoupon?.couponCode || '',
        tip_price: cartState.selectedTip || '0',
        donation_price: cartState.selectedDonationTip || '0',
        donation_id: cartState.donationData?.id || '',
        donation_name: cartState.donationData?.name || '',
        discount_amount: calculations.totalDiscountAmount?.toString() || '0',
        partial_payment: cartState.partialPayment || '0',
        remaining_payment: calculations.finalRemainingAmounts?.toString() || '0',
        vip_id: cartState.selectedVipPlan?.id || '',
        vip_price: cartState.selectedVipPlan?.price || '0',
        wallet: cartState.isWalletEnabled ? 'true' : 'false',
        notes: cartState.bookingNotes || ''
      };

      console.log('🛒 CheckoutButton: Processing checkout with data:', checkoutData);

      // Call checkout API (matches Flutter checkOutFunction)
      const checkoutResponse = await cartService.processCheckout(checkoutData);

      if (checkoutResponse.success) {
        console.log('🛒 CheckoutButton: Checkout successful, navigating to success page...');
        setCartStatus('paymentSuccessed'); // Matches Flutter CartStatus.paymentSuccessed

        // Navigate to payment success page (matches Flutter navigation)
        navigate('/payment-success', {
          state: {
            bookingData: {
              paymentId,
              orderId: razorpayOrderId,
              totalAmount: calculations.finalTotalAmount,
              bookingId: checkoutResponse.data?.booking_id
            }
          }
        });
      } else {
        throw new Error(checkoutResponse.message || 'Checkout failed');
      }

    } catch (error) {
      console.error('🛒 CheckoutButton: Error processing successful payment:', error);
      setCartStatus('failure');
      toast.error('Payment successful but booking failed. Please contact support.');
    }
  };

  // Handle payment error (matches Flutter onPaymentError callback)
  const handlePaymentError = async (error, razorpayOrderId) => {
    try {
      console.log('🛒 CheckoutButton: Processing payment error...', error);

      // Call checkout API with failed status (matches Flutter error handling)
      const checkoutData = {
        razorpay_order_id: razorpayOrderId,
        transaction_id: '',
        status: 'initiated', // Matches Flutter bookingStatus: 'initiated'
        payment_status: 'failed', // Matches Flutter paymentStatus: 'failed'
        total_amount: calculations.finalTotalAmount.toString(),
        notes: cartState.bookingNotes || ''
      };

      await cartService.processCheckout(checkoutData);

      setCartStatus('failure');
      toast.error('Payment failed. Please try again.');

    } catch (checkoutError) {
      console.error('🛒 CheckoutButton: Error processing failed payment:', checkoutError);
      setCartStatus('failure');
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto">
        {/* Main Payment Row - Matches Flutter Row layout (lines 1770-1815) */}
        <div className="flex items-center justify-between p-4">
          {/* Left Side - "To Pay" Amount (matches Flutter left side) */}
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 font-medium">To Pay</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(calculations.finalTotalAmount)}
            </p>
          </div>

          {/* Right Side - Pay Now Button (matches Flutter AppElevatedButton.appButton) */}
          <motion.button
            onClick={handleCheckout}
            disabled={isProcessing || !validation.isValid}
            className="bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[120px] justify-center"
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span className="text-sm">Processing...</span>
              </>
            ) : (
              <span className="text-sm font-semibold">Pay Now</span>
            )}
          </motion.button>
        </div>

        {/* Security Message - Below the main row */}
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 text-center flex items-center justify-center space-x-1">
            <Lock className="h-3 w-3" />
            <span>Secure payment powered by Razorpay</span>
          </p>

          {/* Validation Error */}
          {!validation.isValid && (
            <p className="text-xs text-red-500 text-center mt-1">
              {validation.error}
            </p>
          )}

          {/* Remaining Amount Info */}
          {calculations.finalRemainingAmounts > 0 && (
            <p className="text-xs text-gray-500 text-center mt-1">
              + {formatCurrency(calculations.finalRemainingAmounts)} remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutButton;
