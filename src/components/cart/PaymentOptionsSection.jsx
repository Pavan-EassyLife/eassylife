import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { PaymentTypes } from '../../types/cart';
import { CouponValidation } from '../../types/coupon';
import CancellationPolicySection from './CancellationPolicySection';

/**
 * Payment Options Section Component
 * Exactly matches Flutter paymentOptionsBuilder implementation
 * Shows Coupons button, Amount Payable banner, and payment options with radio buttons
 */
const PaymentOptionsSection = ({ cartState: propCartState }) => {
  console.log('🚀 PaymentOptionsSection: Component started rendering');

  const navigate = useNavigate();
  const { cartState: hookCartState, selectPaymentType } = useCart();
  console.log('🚀 PaymentOptionsSection: useCart hook called successfully');

  // Use hook state if available, fallback to prop state
  const cartState = hookCartState || propCartState;

  const {
    cartData,
    paymentType,
    selectedVipPlan,
    vipPlans,
    noOfPackageItems,
    selectedTip,
    selectedDonationTip,
    isCouponApplied,
    couponData,
    isWalletEnabled,
    status
  } = cartState || {};

  // Check if coupons are applicable (matches Flutter conditions exactly)
  const areCouponsApplicable = CouponValidation.areCouponsApplicable({
    isWalletEnabled: isWalletEnabled || false,
    paymentType: paymentType || 'fullamount',
    selectedVipPlan: selectedVipPlan || null,
    noOfPackageItems: noOfPackageItems || 0
  });

  // Track re-renders
  useEffect(() => {
    console.log('🔄 PaymentOptionsSection: Component re-rendered with cartData:', !!cartState?.cartData);
  });

  console.log('💳 PaymentOptionsSection: Using cart data:', {
    hasCartData: !!cartData,
    paymentType,
    status
  });

  console.log('🔄 PaymentOptionsSection: Current state:', {
    paymentType,
    status,
    hasCartData: !!cartData,
    vipPlansCount: vipPlans?.length || 0,
    fullCartState: cartState
  });

  // Debug when paymentType changes
  useEffect(() => {
    console.log('🔄 PaymentOptionsSection: paymentType changed to:', paymentType);
  }, [paymentType]);

  const isPaymentLoading = status === 'cartLoading';

  // Don't render if no cart data
  if (!cartData) {
    return null;
  }

  // Calculate amounts exactly like Flutter (matches API response structure)
  const partialAmount = parseFloat(cartData.partial_payment || '0');
  const vipAmount = parseFloat(cartData.vip_full_amount || '0');
  const fullAmount = parseFloat(cartData.item_full_amount || '0');
  const totalPrice = parseFloat(cartData.total_price || '0');
  const leftBalance = parseFloat(cartData.left_balance || '0');

  // Check conditions exactly like Flutter
  const isPartialAvailable =
    import.meta.env.VITE_IS_PARTIAL_ACTIVE === 'true' &&
    noOfPackageItems === 0 &&
    (!selectedVipPlan || !selectedVipPlan.id); // Hide partial when VIP is selected

  const isVipAvailable = vipPlans && vipPlans.length > 0; // Show when VIP plans exist (matches Flutter: state.vipPlans.isNotEmpty)
  const isVipSelected = selectedVipPlan && selectedVipPlan.id;
  const isFullAvailable = (!selectedVipPlan || !selectedVipPlan.id); // Hide full when VIP is selected (matches Flutter condition)

  // Debug cart data structure (development only)
  if (process.env.NODE_ENV === 'development' && cartData) {
    console.log('💰 PaymentOptionsSection: Cart data debug:', {
      cartData,
      paymentType,
      selectedVipPlan,
      vipPlans,
      vipPlansCount: vipPlans?.length || 0,
      isVipAvailable,
      isVipSelected,
      partial_payment: cartData?.partial_payment,
      item_full_amount: cartData?.item_full_amount,
      vip_full_amount: cartData?.vip_full_amount,
      left_balance: cartData?.left_balance,
      total_price: cartData?.total_price,
      isPartialAvailable,
      isFullAvailable
    });
  }

  // Handle payment type selection
  const handlePaymentTypeSelect = async (type) => {
    console.log('🔘 PaymentOptionsSection: Radio button clicked:', {
      clickedType: type,
      currentPaymentType: paymentType,
      isPaymentLoading,
      willProceed: paymentType !== type && !isPaymentLoading
    });

    if (paymentType !== type && !isPaymentLoading) {
      try {
        console.log('🔄 PaymentOptionsSection: Calling selectPaymentType with:', type);
        await selectPaymentType(type);
        console.log('✅ PaymentOptionsSection: Payment type selection completed');
      } catch (error) {
        console.error('❌ PaymentOptionsSection: Failed to select payment type:', error);
      }
    } else {
      console.log('⚠️ PaymentOptionsSection: Payment type selection skipped:', {
        reason: paymentType === type ? 'Same type already selected' : 'Payment loading in progress'
      });
    }
  };

  // Handle coupons navigation
  const handleCouponsClick = () => {
    console.log('🎫 PaymentOptionsSection: Navigating to coupons page with selected coupon:', couponData);

    // Navigate to coupons page with current coupon data (matches Flutter navigation)
    navigate('/coupons', {
      state: {
        selectedCouponResponse: couponData || null
      }
    });
  };

  // Format currency exactly like Flutter
  const formatCurrency = (amount) => {
    return `₹${Math.round(parseFloat(amount || 0))}`;
  };

  // Radio button component matching Flutter style
  const RadioButton = ({ selected, onPress, label }) => (
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
        selected ? 'border-orange-500 bg-orange-500' : 'border-gray-400 bg-white'
      }`}
      onClick={(e) => {
        console.log('🔘 RadioButton clicked:', { label, selected, event: e });
        if (onPress) {
          onPress();
        } else {
          console.warn('⚠️ RadioButton: onPress is undefined');
        }
      }}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  );

  return (
    <div className="mx-6 space-y-3">
      {/* Coupons & Offers Applicable Button - Matches Flutter conditions */}
      {areCouponsApplicable && (
        <motion.button
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium text-sm"
          onClick={handleCouponsClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Coupons & Offers Applicable
        </motion.button>
      )}

      {/* Amount Payable Banner - Matches Flutter */}
      <motion.div
        className="w-full bg-yellow-100 border border-yellow-200 py-3 px-4 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="text-orange-600 font-medium text-center">
          Amount Payable : {formatCurrency(totalPrice)}
        </p>
      </motion.div>

      {/* Payment Options - Exactly matching Flutter layout */}
      <div className="space-y-2">
        {/* Partial Payment Option - Always show when available */}
        {isPartialAvailable && (
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RadioButton
                  selected={paymentType === PaymentTypes.PARTIAL}
                  onPress={() => handlePaymentTypeSelect(PaymentTypes.PARTIAL)}
                  label="PARTIAL"
                />
                <div>
                  <p className="text-gray-900 font-medium text-sm">
                    Pay just {formatCurrency(partialAmount)} to Book Now !
                  </p>
                  <p className="text-gray-500 text-xs">
                    Inc GST and other charges
                  </p>
                  <p className="text-gray-900 text-xs font-medium">
                    Saving ₹1
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-bold text-lg">
                  {formatCurrency(partialAmount)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIP Payment Option - Show when VIP plans are available (matches Flutter: state.vipPlans.isNotEmpty) */}
        {isVipAvailable && (
          <motion.div
            className={`bg-white border rounded-lg p-4 ${
              paymentType === PaymentTypes.VIP || (isVipSelected && paymentType !== PaymentTypes.PARTIAL && paymentType !== PaymentTypes.FULL_AMOUNT)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RadioButton
                  selected={paymentType === PaymentTypes.VIP || (isVipSelected && paymentType !== PaymentTypes.PARTIAL && paymentType !== PaymentTypes.FULL_AMOUNT)}
                  onPress={() => handlePaymentTypeSelect(PaymentTypes.VIP)}
                  label="VIP"
                />
                <div>
                  <p className="text-gray-900 font-medium text-sm">
                    Amount payable for VIP's {formatCurrency(vipAmount)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Inc GST and other charges
                  </p>
                  <p className="text-gray-900 text-xs font-medium">
                    Saving ₹70
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900 font-bold text-lg">
                    {formatCurrency(vipAmount)}
                  </p>
                  <p className="text-gray-500 text-sm line-through">
                    ₹957
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Payment Option - Show when VIP is not selected (matches Flutter condition) */}
        {isFullAvailable && (
          <motion.div
          className={`bg-white border rounded-lg p-4 ${
            paymentType === PaymentTypes.FULL_AMOUNT
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200'
          }`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RadioButton
                selected={paymentType === PaymentTypes.FULL_AMOUNT}
                onPress={() => handlePaymentTypeSelect(PaymentTypes.FULL_AMOUNT)}
                label="FULL_AMOUNT"
              />
              <div>
                <p className="text-gray-900 font-medium text-sm">
                  Pay full amount now {formatCurrency(fullAmount)}
                </p>
                <p className="text-gray-500 text-xs">
                  Inc GST and other charges
                </p>
                <p className="text-gray-900 text-xs font-medium">
                  Saving ₹1
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 font-bold text-lg">
                  {formatCurrency(fullAmount)}
                </p>
                <p className="text-gray-500 text-sm line-through">
                  ₹659
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </div>

      {/* Cancellation Policy Section - Matches Flutter implementation */}
      <CancellationPolicySection />

      {/* Reduced spacing after cancellation policy for better visual hierarchy */}
      <div className="h-4"></div>
    </div>
  );
};

export default PaymentOptionsSection;
