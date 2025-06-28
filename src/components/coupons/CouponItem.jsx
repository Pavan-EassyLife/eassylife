import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Gift } from 'lucide-react';
import { useCouponContext } from '../../contexts/CouponContext';

/**
 * Coupon Item Component
 * Exactly matches Flutter couponItemBuilder implementation
 * Shows individual coupon with image, details, and apply button
 */
const CouponItem = ({ coupon, index, isSelected = false, isActive = true }) => {
  const { applyCoupon, isApplyLoading, selectedInt } = useCouponContext();

  // Check if this specific coupon is currently loading
  const isCurrentlyLoading = isApplyLoading && selectedInt === index;

  // Handle apply button click
  const handleApply = async () => {
    if (!isActive || isCurrentlyLoading) {
      return;
    }

    try {
      await applyCoupon(coupon.id, index, coupon.code);
    } catch (error) {
      console.error('Error applying coupon:', error);
    }
  };

  // Format discount value for display
  const formatDiscountValue = (value) => {
    if (!value) return '';
    return value.includes('%') ? value : `₹${value}`;
  };

  // Format minimum order value
  const formatMinOrderValue = (value) => {
    if (!value || value === '0') return '';
    return `Min order ₹${value}`;
  };

  return (
    <motion.div
      whileHover={isActive ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        relative bg-white rounded-xl border-2 overflow-hidden shadow-sm
        ${isSelected 
          ? 'border-orange-500 bg-orange-50' 
          : isActive 
            ? 'border-gray-200 hover:border-orange-300' 
            : 'border-gray-200 opacity-60'
        }
        ${isActive ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center z-10"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Coupon Image */}
          <div className="flex-shrink-0">
            {coupon.image ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={coupon.image}
                alt={coupon.code || 'Coupon'}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback icon */}
            <div 
              className={`w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${coupon.image ? 'hidden' : 'flex'}`}
            >
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Coupon Details */}
          <div className="flex-1 min-w-0">
            {/* Coupon Code */}
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="font-bold text-gray-900 text-lg truncate">
                {coupon.code || 'COUPON'}
              </span>
            </div>

            {/* Discount Value */}
            {coupon.discountValue && (
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  {formatDiscountValue(coupon.discountValue)} OFF
                </span>
              </div>
            )}

            {/* Description */}
            {coupon.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {coupon.description}
              </p>
            )}

            {/* Minimum Order Value */}
            {coupon.minOrderValue && (
              <p className="text-gray-500 text-xs mb-3">
                {formatMinOrderValue(coupon.minOrderValue)}
              </p>
            )}

            {/* Amount Required (if any) */}
            {coupon.leftamount && coupon.leftamount > 0 && (
              <p className="text-orange-600 text-xs mb-3">
                Add ₹{coupon.leftamount} more to use this coupon
              </p>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={isActive && !isCurrentlyLoading ? { scale: 1.05 } : {}}
            whileTap={isActive && !isCurrentlyLoading ? { scale: 0.95 } : {}}
            onClick={handleApply}
            disabled={!isActive || isCurrentlyLoading}
            className={`
              px-6 py-2 rounded-lg font-semibold text-sm min-w-[100px] flex items-center justify-center
              transition-all duration-200
              ${!isActive
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isSelected
                  ? 'bg-green-500 text-white'
                  : isCurrentlyLoading
                    ? 'bg-orange-400 text-white cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700'
              }
            `}
          >
            {isCurrentlyLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : isSelected ? (
              'Applied'
            ) : (
              'Apply'
            )}
          </motion.button>
        </div>
      </div>

      {/* Inactive overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
          <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Inactive
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default CouponItem;
