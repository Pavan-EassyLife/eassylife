import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Coupon Header Component
 * Exactly matches Flutter commonAppBarWidgetBuilder implementation
 * Shows title with coupon count and back navigation
 */
const CouponHeader = ({ onBack, couponsCount = 0 }) => {
  // Generate title based on coupon count (matches Flutter logic)
  const getTitle = () => {
    if (couponsCount === 0) {
      return 'Coupons & Offers';
    }
    return `Coupons & Offers (${couponsCount})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 min-h-[60px]">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Title */}
          <div className="flex-1 text-center px-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-lg font-semibold text-gray-900 truncate"
            >
              {getTitle()}
            </motion.h1>
          </div>

          {/* Spacer for centering */}
          <div className="w-10" />
        </div>
      </div>
    </motion.div>
  );
};

export default CouponHeader;
