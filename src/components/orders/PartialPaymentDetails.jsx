import React, { memo, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { useOrderContext } from '../../contexts/OrderContext';
import razorpayService from '../../api/services/razorpayService';
import orderService from '../../api/services/orderService';

const PartialPaymentDetails = memo(({ order, item, orderId, itemId }) => {
  const { fetchOrderDetail } = useOrderContext();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!order || !item || item.is_partial !== 1) {
    return null;
  }

  // Extract payment information - exact Flutter naming conventions
  const partialAmount = parseFloat(order.partial_amount || '0');
  const paymentStatus = order.payment_status || 'partially paid';

  // Calculate remaining amount exactly like Flutter
  // Flutter: totalRemainingAmount = (double.parse(data.items?[0].totalAmount ?? '0') + (data.remainingConvenienceCharge ?? 0)).toString();
  const itemTotalAmount = parseFloat(item.total_amount || '0');
  const remainingConvenienceCharge = parseFloat(order.remaining_convenience_charge || '0');
  const calculatedRemainingAmount = itemTotalAmount + remainingConvenienceCharge;

  // Use API remaining_payment field directly (matches Flutter)
  const remainingPayment = parseFloat(order.remaining_payment || calculatedRemainingAmount);

  // Format currency - matches Flutter CurrencyManager.formatCurrency
  const formatCurrency = (amount) => {
    return `₹${Math.round(Math.abs(amount))}`;
  };

  // Handle payment action - matches Flutter implementation
  const handlePayNow = useCallback(async () => {
    if (isProcessingPayment) return;

    try {
      setIsProcessingPayment(true);
      console.log('🔄 Starting partial payment for remaining amount:', calculatedRemainingAmount);
      console.log('🔍 Payment data:', { itemId, orderId, remainingConvenienceCharge });

      // Use Razorpay service singleton - matches Flutter RazorpayService
      // Open Razorpay checkout - matches Flutter openCheckout call
      console.log('🚀 Opening Razorpay checkout...');
      await razorpayService.openCheckout({
        total: Math.round(remainingPayment), // Convert to integer like Flutter
        orderId: '', // Empty orderId like Flutter for partial payments
        onPaymentSuccess: async (paymentId) => {
          console.log('💳 Partial payment success:', paymentId);

          try {
            // Call partial payment API - matches Flutter payNowPartialBookingFunction
            const response = await orderService.processPartialPayment({
              itemId: itemId,
              razorpayOrderId: paymentId,
              paymentStatus: 'Online',
              remainingConvenienceCharge: remainingConvenienceCharge > 0 ? remainingConvenienceCharge.toString() : ''
            });

            if (response.success) {
              console.log('✅ Partial payment API success');
              // Refresh order details - matches Flutter RefreshOrderDetailEvent
              await fetchOrderDetail(orderId, itemId);
            } else {
              console.error('❌ Partial payment API failed:', response.message);
            }
          } catch (error) {
            console.error('❌ Error calling partial payment API:', error);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onPaymentError: (error) => {
          console.error('❌ Partial payment error:', error);
          setIsProcessingPayment(false);
        }
      });
    } catch (error) {
      console.error('❌ Error initiating partial payment:', error);
      setIsProcessingPayment(false);
    }
  }, [remainingPayment, isProcessingPayment, itemId, orderId, remainingConvenienceCharge, fetchOrderDetail]);

  return (
    <div className="mx-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        {/* Payment Details Header - exact Flutter match */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-gray-600">Payment Details</span>
          <span className="text-sm font-semibold">{paymentStatus}</span>
        </div>

        {/* Paid Amount - exact Flutter match */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-gray-600">Paid</span>
          <span className="text-sm font-semibold">{formatCurrency(partialAmount)}</span>
        </div>

        {/* Balance Payable - exact Flutter match */}
        <div className="flex justify-between items-center mb-5">
          <span className="text-sm text-gray-600">Balance Payable</span>
          <span className="text-sm font-semibold">{formatCurrency(remainingPayment)}</span>
        </div>

        {/* Divider - exact Flutter match */}
        <div className="h-px w-full bg-gray-300 mb-3.5"></div>

        {/* Pay Now Button - exact Flutter positioning (right-aligned with left margin) */}
        <div className="flex justify-end">
          <Button
            onClick={handlePayNow}
            disabled={isProcessingPayment}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-10 px-6 text-sm font-medium"
          >
            {isProcessingPayment ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </div>
    </div>
  );
});

PartialPaymentDetails.displayName = 'PartialPaymentDetails';

export default PartialPaymentDetails;
