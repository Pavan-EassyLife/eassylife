import React from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Coupon Empty State Component
 * Shows when no coupons are available or error occurred
 */
const CouponEmptyState = ({ onBack, onRefresh, message = 'No coupons available', isError = false }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 min-h-[60px]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Coupons & Offers
            </h1>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Search Field (disabled) */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200 opacity-50">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter promo code"
              disabled
              className="w-full px-4 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            disabled
            className="px-6 py-3 min-w-[100px] font-semibold text-white bg-gray-400 cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Empty State Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          {/* Icon */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isError ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            {isError ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : (
              <Tag className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {isError ? 'Something went wrong' : 'No Coupons Available'}
          </h2>

          {/* Message */}
          <p className="text-gray-500 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>

            {/* Back to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Cart
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CouponEmptyState;
