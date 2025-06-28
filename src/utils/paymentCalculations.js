import { PaymentTypes } from '../types/cart';

/**
 * Payment Calculation Engine
 * Matches Flutter payment calculation logic exactly
 * Handles all payment scenarios: VIP, partial, full, wallet, coupons
 */

/**
 * Calculate final payment amounts based on cart state
 * Matches Flutter paymentRecieptContainer calculation logic
 */
export const calculatePaymentAmounts = (cartState) => {
  const {
    cartData,
    paymentType,
    selectedTip,
    selectedDonationTip,
    selectedVipPlan,
    isWalletEnabled,
    couponData,
    isCouponApplied
  } = cartState;

  if (!cartData) {
    return {
      donationPrice: 0,
      tipPrice: 0,
      totalPrice: 0,
      totalRemainingPrice: 0,
      availableWalletAmount: 0,
      serviceItemsTotalAmount: 0,
      vipPlanDiscountAmount: 0,
      vipPlanAmount: 0,
      taxAndOtherServiceCustomAmount: 0,
      taxAndOtherServiceAmount: 0,
      finalTotalAmount: 0,
      finalTotalDiscountAmount: 0,
      finalRemainingAmounts: 0,
      walletDeductionAmount: 0
    };
  }

  // Base amounts (matches Flutter variable declarations)
  const donationPrice = parseFloat(selectedDonationTip || '0');
  const tipPrice = parseFloat(selectedTip || '0');
  
  // Cart data amounts - using correct API field names
  const availableWalletAmount = parseFloat(cartData.user_wallet_amount || '0');
  const serviceItemsTotalAmount = parseFloat(cartData.total_service_amount || '0');
  const vipPlanAmount = parseFloat(cartData.vip_full_amount || '0');
  const taxAndOtherServiceAmount = parseFloat(cartData.convinencecharge || '0');
  const taxAndOtherServiceCustomAmount = parseFloat(cartData.remaining_convcience || '0');

  // VIP discount from API (matches Flutter viplifediscount field)
  const vipPlanDiscountAmount = parseFloat(cartData.viplifediscount || '0');
  
  // Initialize final amounts
  let finalTotalAmount = 0;
  let finalTotalDiscountAmount = 0;
  let finalRemainingAmounts = 0;
  let walletDeductionAmount = 0;

  // Calculate based on payment type (matches Flutter switch logic)
  if (paymentType === PaymentTypes.VIP && selectedVipPlan && selectedVipPlan.id) {
    // VIP payment calculation - matches Flutter lines 1508
    // Uses vip_full_amount directly from API + tips/donations
    finalTotalAmount = vipPlanAmount + tipPrice + donationPrice;
    finalTotalDiscountAmount = vipPlanDiscountAmount;
  } else if (paymentType === PaymentTypes.PARTIAL) {
    // Partial payment calculation
    const partialAmount = parseFloat(cartData.partialPayment || '0');
    finalTotalAmount = partialAmount + tipPrice + donationPrice;
    finalRemainingAmounts = parseFloat(cartData.leftBalance || '0');
  } else {
    // Full payment calculation
    if (isCouponApplied && couponData) {
      // With coupon applied
      finalTotalAmount = parseFloat(couponData.itemDiscountAmount || '0') + tipPrice + donationPrice;
      finalTotalDiscountAmount = parseFloat(couponData.couponValue || '0');
    } else {
      // Without coupon
      finalTotalAmount = serviceItemsTotalAmount + tipPrice + donationPrice;
    }
  }

  // Apply wallet deduction if enabled (matches Flutter wallet logic)
  // Note: Wallet is NOT applied for VIP payments (matches Flutter discountType == vip logic)
  if (isWalletEnabled && availableWalletAmount > 0 && paymentType !== PaymentTypes.VIP) {
    walletDeductionAmount = Math.min(availableWalletAmount, finalTotalAmount);
    finalTotalAmount = Math.max(0, finalTotalAmount - walletDeductionAmount);
  }

  return {
    donationPrice,
    tipPrice,
    totalPrice: finalTotalAmount,
    totalRemainingPrice: finalRemainingAmounts,
    availableWalletAmount,
    serviceItemsTotalAmount,
    vipPlanDiscountAmount,
    vipPlanAmount,
    taxAndOtherServiceCustomAmount,
    taxAndOtherServiceAmount,
    finalTotalAmount,
    finalTotalDiscountAmount,
    finalRemainingAmounts,
    walletDeductionAmount
  };
};

/**
 * Calculate discount percentage
 * Matches Flutter getDiscountPercentageFunction
 */
export const calculateDiscountPercentage = (discountPrice, originalPrice) => {
  const discount = parseFloat(originalPrice) - parseFloat(discountPrice);
  const percentage = (discount / parseFloat(originalPrice)) * 100;
  return Math.round(percentage);
};

/**
 * Format currency amount
 * Matches Flutter CurrencyManager.formatCurrency
 */
export const formatCurrency = (amount) => {
  return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
};

/**
 * Calculate total cart value for analytics
 * Matches Flutter analytics calculation
 */
export const calculateCartValue = (cartData) => {
  if (!cartData) return '0';
  return (parseFloat(cartData.itemFullAmount || '0')).toString();
};

/**
 * Check if partial payment is available
 * Matches Flutter partial payment conditions
 */
export const isPartialPaymentAvailable = (cartState) => {
  const { selectedVipPlan, noOfPackageItems } = cartState;
  
  return (
    (!selectedVipPlan || !selectedVipPlan.id) && 
    process.env.REACT_APP_IS_PARTIAL_ACTIVE === 'true' && 
    noOfPackageItems === 0
  );
};

/**
 * Check if coupons are applicable
 * Matches Flutter coupon applicability conditions
 */
export const areCouponsApplicable = (cartState) => {
  const { 
    isWalletEnabled, 
    paymentType, 
    selectedVipPlan, 
    noOfPackageItems 
  } = cartState;
  
  return (
    !isWalletEnabled && 
    paymentType === PaymentTypes.FULL_AMOUNT && 
    !selectedVipPlan && 
    noOfPackageItems === 0
  );
};

/**
 * Calculate VIP plan savings
 * Matches Flutter VIP savings calculation
 */
export const calculateVipSavings = (cartData, vipPlan) => {
  if (!cartData || !vipPlan) return 0;

  // Use correct API field names
  const fullAmount = parseFloat(cartData.item_full_amount || '0');
  const vipAmount = parseFloat(cartData.vip_full_amount || '0');

  return Math.max(0, fullAmount - vipAmount);
};

/**
 * Calculate total order value including all additions
 * Matches Flutter total calculation with tips and donations
 */
export const calculateTotalOrderValue = (cartState) => {
  const calculations = calculatePaymentAmounts(cartState);
  return calculations.finalTotalAmount + calculations.finalRemainingAmounts;
};

/**
 * Get payment method display text
 * Matches Flutter payment method descriptions
 */
export const getPaymentMethodText = (cartState) => {
  const { paymentType, isWalletEnabled, selectedVipPlan } = cartState;
  
  let text = '';
  
  if (paymentType === PaymentTypes.VIP && selectedVipPlan) {
    text = `VIP Payment with ${selectedVipPlan.planName}`;
  } else if (paymentType === PaymentTypes.PARTIAL) {
    text = 'Partial Payment';
  } else {
    text = 'Full Payment';
  }
  
  if (isWalletEnabled) {
    text += ' + EassyCash';
  }
  
  return text;
};

/**
 * Validate cart before checkout
 * Matches Flutter cart validation logic
 */
export const validateCartForCheckout = (cartState) => {
  const { cartData, paymentType } = cartState;
  
  if (!cartData) {
    return { isValid: false, error: 'Cart data not available' };
  }
  
  const calculations = calculatePaymentAmounts(cartState);
  
  if (calculations.finalTotalAmount < 0) {
    return { isValid: false, error: 'Invalid payment amount' };
  }
  
  if (paymentType === PaymentTypes.PARTIAL && calculations.finalRemainingAmounts <= 0) {
    return { isValid: false, error: 'Invalid partial payment configuration' };
  }
  
  return { isValid: true, error: null };
};
