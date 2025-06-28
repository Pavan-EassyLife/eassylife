import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, User, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Booking Success Page
 * Matches Flutter booking_successful.dart design and functionality
 * Shows booking confirmation with user details and view booking option
 */
const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract booking data from navigation state
  const bookingData = location.state?.bookingData;

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      console.warn('⚠️ BookingSuccessPage: No booking data found, redirecting to home');
      navigate('/home', { replace: true });
    }
  }, [bookingData, navigate]);

  // Handle view booking navigation (matches Flutter navigation to MyOrdersScreen)
  const handleViewBooking = () => {
    console.log('📋 BookingSuccessPage: Navigating to orders page...');
    navigate('/orders', {
      state: { 
        screenName: 'Order',
        initialIndex: 1 // Matches Flutter initialIndex: 1
      },
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

  // Get user display name (matches Flutter constant.userFirstName + constant.userLastName)
  const getUserDisplayName = () => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        {/* Success Icon - Matches Flutter positioning */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex justify-center mb-8 mt-16"
        >
          <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Booking Successful
          </h1>
          
          {/* Divider - Matches Flutter design */}
          <div className="border-t border-gray-300 mx-8 mb-6" />
          
          {/* User Name - Matches Flutter display */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {getUserDisplayName()}
          </h2>
          
          <p className="text-gray-600 px-4">
            You have successfully scheduled your bookings
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg mx-4 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Details
          </h3>
          
          <div className="space-y-4">
            {/* Booking ID */}
            {bookingData.bookingId && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-semibold text-gray-900">{bookingData.bookingId}</p>
                </div>
              </div>
            )}

            {/* Payment ID */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-mono text-sm text-gray-900 break-all">{bookingData.paymentId}</p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">₹</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-semibold text-gray-900">{formatCurrency(bookingData.totalAmount)}</p>
              </div>
            </div>

            {/* User Details */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center px-8 mb-8"
        >
          <p className="text-gray-600 leading-relaxed">
            Your booking has been confirmed successfully. You will receive a confirmation message shortly with all the details.
          </p>
        </motion.div>
      </div>

      {/* Bottom Button - Matches Flutter design */}
      <div className="p-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-white rounded-t-3xl shadow-2xl p-6"
        >
          <button
            onClick={handleViewBooking}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Eye className="w-5 h-5" />
            <span>View Booking</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
