import React from 'react';
import { motion } from 'framer-motion';
import CouponItem from './CouponItem';
import { CouponValidation } from '../../types/coupon';

/**
 * Coupon List Component
 * Exactly matches Flutter coupon list implementation with pull-to-refresh
 * Displays list of available coupons with individual apply buttons
 */
const CouponList = ({ coupons = [], selectedCouponResponse = null, onRefresh }) => {
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Animation variants for list items
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pull-to-refresh area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {/* Refresh indicator area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-2"
          >
            <p className="text-sm text-gray-500">Pull down to refresh</p>
          </motion.div>

          {/* Coupons List */}
          {coupons.length > 0 ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {coupons.map((coupon, index) => {
                // Check if this coupon is currently selected
                const isSelected = CouponValidation.isCouponSelected(coupon, selectedCouponResponse);

                return (
                  <motion.div
                    key={coupon.id || index}
                    variants={itemVariants}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CouponItem
                      coupon={coupon}
                      index={index}
                      isSelected={isSelected}
                      isActive={coupon.isValid !== false} // Default to true if not specified
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Coupons Available
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                There are no active coupons available at the moment. Check back later for exciting offers!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                Refresh
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponList;
