import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Coupon Loading State Component
 * Shows loading skeleton while fetching coupons
 */
const CouponLoadingState = ({ onBack }) => {
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
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto" />
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Search Field Skeleton */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Loading Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Loading Skeleton Items */}
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-start gap-4">
              {/* Image Skeleton */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
              
              {/* Content Skeleton */}
              <div className="flex-1 space-y-3">
                {/* Title */}
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                
                {/* Discount Badge */}
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
                
                {/* Apply Button */}
                <div className="flex justify-end">
                  <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-24" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"
            />
            <span className="text-gray-700 font-medium">Loading coupons...</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CouponLoadingState;
