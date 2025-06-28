import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CouponValidation } from '../../types/coupon';

/**
 * Coupons Section Component
 * Matches Flutter coupon implementation with application/removal functionality
 * Shows coupon button and applied coupon display
 */
const CouponsSection = ({ cartState }) => {
  const navigate = useNavigate();
  const { removeCoupon } = useCart();
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);

  const { 
    couponData, 
    isCouponApplied, 
    paymentType, 
    isWalletEnabled, 
    noOfPackageItems,
    selectedVipPlan 
  } = cartState;

  // Check if coupons are applicable (matches Flutter conditions exactly)
  const areCouponsApplicable = CouponValidation.areCouponsApplicable({
    isWalletEnabled: isWalletEnabled || false,
    paymentType: paymentType || 'fullamount',
    selectedVipPlan: selectedVipPlan || null,
    noOfPackageItems: noOfPackageItems || 0
  });

  // Handle navigate to coupons page (matches Flutter navigation exactly)
  const handleNavigateToCoupons = () => {
    console.log('🎫 CouponsSection: Navigating to coupons page with selected coupon:', couponData);

    navigate('/coupons', {
      state: {
        selectedCouponResponse: couponData || null
      }
    });
  };

  // Handle coupon removal (matches Flutter coupon removal)
  const handleRemoveCoupon = async () => {
    try {
      setIsRemovingCoupon(true);

      // Use the removeCoupon method from useCart hook
      await removeCoupon();

      // Analytics tracking
      // analytics.track('coupon_removed', {
      //   coupon_code: couponData?.couponCode,
      //   coupon_value: couponData?.couponValue
      // });
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    } finally {
      setIsRemovingCoupon(false);
    }
  };

  return (
    <motion.div 
      className="mx-4 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Applied Coupon Display */}
      {isCouponApplied && couponData && (
        <motion.div 
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Tag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-green-800">
                  {couponData.couponCode}
                </h4>
                <p className="text-xs text-green-600">
                  You saved ₹{couponData.couponValue || 0}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={handleRemoveCoupon}
              disabled={isRemovingCoupon}
              className="p-1 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRemovingCoupon ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
              ) : (
                <X className="h-4 w-4 text-green-600" />
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Coupons Button (only show if coupons are applicable) */}
      {areCouponsApplicable && (
        <motion.button
          onClick={handleNavigateToCoupons}
          className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors duration-200"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Tag className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium text-orange-800">
                  Coupons & Offers Applicable
                </h4>
                <p className="text-xs text-orange-600">
                  {isCouponApplied ? 'Change coupon' : 'Apply coupon to save more'}
                </p>
              </div>
            </div>
            
            <ChevronRight className="h-4 w-4 text-orange-600" />
          </div>
        </motion.button>
      )}

      {/* Info message when coupons are not applicable */}
      {!areCouponsApplicable && !isCouponApplied && (
        <motion.div 
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Coupons not applicable
              </h4>
              <p className="text-xs text-gray-500">
                {isWalletEnabled && 'Remove wallet payment to apply coupons'}
                {paymentType === 'vip' && 'Coupons cannot be used with VIP plans'}
                {selectedVipPlan && 'Coupons cannot be used with VIP plans'}
                {noOfPackageItems > 0 && 'Coupons cannot be used with packages'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CouponsSection;
