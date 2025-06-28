import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCouponContext } from '../../contexts/CouponContext';

/**
 * Coupon Search Field Component
 * Exactly matches Flutter searchFieldBuilder implementation
 * Allows manual coupon code entry and application
 */
const CouponSearchField = () => {
  const [couponCode, setCouponCode] = useState('');
  const { applyCouponFromTextField, isSearchLoading } = useCouponContext();

  // Handle coupon code input change
  const handleInputChange = (e) => {
    setCouponCode(e.target.value.toUpperCase()); // Convert to uppercase for consistency
  };

  // Handle apply button click
  const handleApply = async () => {
    if (!couponCode.trim()) {
      return;
    }

    try {
      await applyCouponFromTextField(couponCode.trim());
      // Clear input after successful application
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon from search field:', error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSearchLoading) {
      handleApply();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all duration-200">
        {/* Input Field */}
        <div className="flex-1">
          <input
            type="text"
            value={couponCode}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter promo code"
            disabled={isSearchLoading}
            className="w-full px-4 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={20} // Reasonable limit for coupon codes
          />
        </div>

        {/* Apply Button */}
        <motion.button
          whileHover={!isSearchLoading ? { scale: 1.02 } : {}}
          whileTap={!isSearchLoading ? { scale: 0.98 } : {}}
          onClick={handleApply}
          disabled={isSearchLoading || !couponCode.trim()}
          className={`
            px-6 py-3 min-w-[100px] font-semibold text-white rounded-r-xl
            transition-all duration-200 flex items-center justify-center
            ${isSearchLoading || !couponCode.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
            }
          `}
        >
          {isSearchLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            'Apply'
          )}
        </motion.button>
      </div>

      {/* Helper Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-sm text-gray-500 mt-2 px-1"
      >
        Enter your promo code and tap Apply to get instant discounts
      </motion.p>
    </motion.div>
  );
};

export default CouponSearchField;
