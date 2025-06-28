import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

/**
 * Payment Success Page
 * Matches Flutter payment_successful.dart design and functionality
 * Shows payment confirmation and navigates to booking success
 */
const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract booking data from navigation state
  const bookingData = location.state?.bookingData;

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      console.warn('⚠️ PaymentSuccessPage: No booking data found, redirecting to home');
      navigate('/home', { replace: true });
    }
  }, [bookingData, navigate]);

  // Handle proceed to booking success
  const handleProceed = () => {
    console.log('🎉 PaymentSuccessPage: Proceeding to booking success...');
    navigate('/booking-success', {
      state: { bookingData },
      replace: true
    });
  };

  // Don't render if no booking data
  if (!bookingData) {
    return null;
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(parseFloat(amount) || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Spacer */}
      <div className="h-16" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Success Card - Matches Flutter CouponCard design */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Success Icon - Matches Flutter positioning */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          {/* Card Content */}
          <div className="pt-20 pb-8 px-6 text-center">
            {/* Success Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-8">
                Your payment has been processed successfully
              </p>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4 mb-8"
            >
              {/* Payment ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Payment ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {bookingData.paymentId}
                </p>
              </div>

              {/* Order ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {bookingData.orderId}
                </p>
              </div>
            </motion.div>

            {/* Divider - Matches Flutter design */}
            <div className="border-t border-gray-200 my-6" />

            {/* Total Amount - Matches Flutter design */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-lg text-gray-600 mb-2">Total Paid</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(bookingData.totalAmount)}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Button - Matches Flutter design */}
      <div className="p-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-white rounded-t-3xl shadow-2xl p-6"
        >
          <button
            onClick={handleProceed}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>Proceed</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
