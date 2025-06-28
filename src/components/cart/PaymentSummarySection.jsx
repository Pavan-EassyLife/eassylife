import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Switch } from '@/components/ui/switch';
import { calculatePaymentAmounts } from '../../utils/paymentCalculations';

/**
 * Payment Summary Section Component
 * Exactly matches Flutter paymentRecieptContainer implementation (lines 1482-1650)
 * Shows wallet toggle, payment breakdown, and grand total
 */
const PaymentSummarySection = ({ cartState }) => {
  const { toggleWallet } = useCart();

  const {
    cartData,
    selectedTip,
    selectedDonationTip,
    donationData,
    paymentType,
    isWalletEnabled,
    isCouponApplied,
    couponData,
    selectedVipPlan,
    noOfServicesItems,
    noOfPackageItems,
    status
  } = cartState;

  // Calculate standardized payment amounts (same as CheckoutButton)
  const standardizedCalculations = calculatePaymentAmounts(cartState);

  const isLoading = status === 'cartLoading';

  // Don't render if no cart data
  if (!cartData) return null;

  // Don't render if cart is empty (no services or packages)
  const hasCartItems = (cartData.groupedCart?.categories?.length || 0) > 0 ||
                      (cartData.groupedCart?.packages?.length || 0) > 0;

  if (!hasCartItems) {
    console.log('🔍 PaymentSummary: Cart is empty, not rendering payment summary');
    return null;
  }

  // Log cart data for debugging (can be removed in production)
  console.log('🔍 PaymentSummary: Cart data available:', Object.keys(cartData));
  console.log('🔍 PaymentSummary: Full cart data:', cartData);
  console.log('🔍 PaymentSummary: Key fields:', {
    totalServiceAmount: cartData.totalServiceAmount,
    itemFullAmount: cartData.itemFullAmount,
    totalTax: cartData.totalTax,
    convinencecharge: cartData.convinencecharge,
    totalPrice: cartData.totalPrice,
    totalDiscount: cartData.totalDiscount,
    paymentType: paymentType
  });

  // Calculate amounts exactly like Flutter (lines 1502-1509)
  const donationPrice = parseFloat(selectedDonationTip || '0');
  const tipPrice = parseFloat(selectedTip || '0');
  const totalPrice = (isCouponApplied === true)  // FIX: Explicit boolean check
    ? parseFloat(couponData?.itemDiscountAmount || '0')
    : parseFloat(cartData.total_price || '0');  // FIX: Use snake_case
  const totalRemainingPrice = parseFloat(cartData.left_balance || '0');  // FIX: Use snake_case

  // DETAILED PAYMENT BREAKDOWN - Matching the provided image exactly
  // Based on backend API fields: convenience_charge_exclude_gst, convenience_charge_gst, total_amount_exclude_gst

  // Item Total (excluding GST) - from API total_amount_exclude_gst or calculated
  const itemTotalExcludingGST = parseFloat(cartData.total_amount_exclude_gst || cartData.total_service_amount || '0');

  // GST on Item Total - calculated from total GST amounts
  const gstOnItemTotal = parseFloat(cartData.total_tax || '0');

  // Convenience Fee (excluding GST) - from API convenience_charge_exclude_gst
  const convenienceFeeExcludingGST = parseFloat(cartData.convenience_charge_exclude_gst || '0');

  // GST on Convenience Fee - from API convenience_charge_gst
  const gstOnConvenienceFee = parseFloat(cartData.convenience_charge_gst || '0');

  // For backward compatibility with Flutter logic (if detailed breakdown not available)
  const serviceItemsTotalAmount = itemTotalExcludingGST || parseFloat(cartData.total_service_amount || '0');
  const taxAndOtherServiceAmount = (isCouponApplied === true)
    ? parseFloat(couponData?.convinencecharge || '0')
    : parseFloat(cartData.convinencecharge || '0');
  const taxAndOtherServiceCustomAmount = (isCouponApplied === true)
    ? parseFloat(couponData?.remainingConvcience || '0')
    : parseFloat(cartData.remaining_convcience || '0');

  // COMPREHENSIVE DEBUGGING - Please provide these console log outputs
  console.log('🚨 DEBUGGING PAYMENT SUMMARY - PLEASE PROVIDE THESE LOGS:');
  console.log('='.repeat(60));
  console.log('1. CART STATE VERIFICATION:');
  console.log('   cartData exists:', !!cartData);
  console.log('   cartData keys:', cartData ? Object.keys(cartData) : 'NO CART DATA');
  console.log('   paymentType:', paymentType);
  console.log('   isWalletEnabled:', isWalletEnabled);
  console.log('   isCouponApplied:', isCouponApplied);
  console.log('   noOfServicesItems:', noOfServicesItems, '(type:', typeof noOfServicesItems, ')');
  console.log('   noOfPackageItems:', noOfPackageItems, '(type:', typeof noOfPackageItems, ')');
  console.log('   categories length:', cartData?.groupedCart?.categories?.length);
  console.log('   packages length:', cartData?.groupedCart?.packages?.length);

  console.log('2. RAW API VALUES (DETAILED BREAKDOWN):');
  console.log('   total_service_amount:', cartData?.total_service_amount, '(type:', typeof cartData?.total_service_amount, ')');
  console.log('   total_amount_exclude_gst:', cartData?.total_amount_exclude_gst, '(type:', typeof cartData?.total_amount_exclude_gst, ')');
  console.log('   total_tax:', cartData?.total_tax, '(type:', typeof cartData?.total_tax, ')');
  console.log('   convenience_charge_exclude_gst:', cartData?.convenience_charge_exclude_gst, '(type:', typeof cartData?.convenience_charge_exclude_gst, ')');
  console.log('   convenience_charge_gst:', cartData?.convenience_charge_gst, '(type:', typeof cartData?.convenience_charge_gst, ')');
  console.log('   convinencecharge:', cartData?.convinencecharge, '(type:', typeof cartData?.convinencecharge, ')');
  console.log('   total_price:', cartData?.total_price, '(type:', typeof cartData?.total_price, ')');

  console.log('3. CALCULATED VALUES (DETAILED BREAKDOWN):');
  console.log('   itemTotalExcludingGST:', itemTotalExcludingGST);
  console.log('   gstOnItemTotal:', gstOnItemTotal);
  console.log('   convenienceFeeExcludingGST:', convenienceFeeExcludingGST);
  console.log('   gstOnConvenienceFee:', gstOnConvenienceFee);
  console.log('   serviceItemsTotalAmount (fallback):', serviceItemsTotalAmount);
  console.log('   taxAndOtherServiceAmount (fallback):', taxAndOtherServiceAmount);
  console.log('   donationPrice:', donationPrice);
  console.log('   tipPrice:', tipPrice);
  console.log('   totalPrice:', totalPrice);

  console.log('4. COUPON DATA (if applied):');
  if (isCouponApplied && couponData) {
    console.log('   couponData:', couponData);
  } else {
    console.log('   No coupon applied');
  }
  console.log('='.repeat(60));

  // Final total calculation - MATCHES FLUTTER LOGIC EXACTLY
  let finalTotalAmount;
  let calculatedTotalFromBreakdown = 0; // Initialize for debugging

  if (paymentType === 'vip') {
    // VIP payment calculation - matches Flutter lines 1508 (vip_full_amount + tips)
    finalTotalAmount = parseFloat(cartData.vip_full_amount || '0') + donationPrice + tipPrice;
  } else if (paymentType === 'partial') {
    // Partial payment calculation - matches Flutter
    finalTotalAmount = parseFloat(cartData.totalPrice || '0');
  } else {
    // Full payment calculation - matches Flutter
    calculatedTotalFromBreakdown = itemTotalExcludingGST + gstOnItemTotal + convenienceFeeExcludingGST + gstOnConvenienceFee;
    finalTotalAmount = calculatedTotalFromBreakdown + donationPrice + tipPrice;
  }

  const finalRemainingAmounts = totalRemainingPrice + donationPrice + tipPrice;

  // FINAL CALCULATION DEBUGGING
  console.log('5. FINAL TOTAL CALCULATION (DETAILED):');
  console.log('   paymentType:', paymentType);
  console.log('   itemTotalExcludingGST:', itemTotalExcludingGST);
  console.log('   + gstOnItemTotal:', gstOnItemTotal);
  console.log('   + convenienceFeeExcludingGST:', convenienceFeeExcludingGST);
  console.log('   + gstOnConvenienceFee:', gstOnConvenienceFee);
  console.log('   = calculatedTotalFromBreakdown:', calculatedTotalFromBreakdown);
  console.log('   + donationPrice:', donationPrice, '+ tipPrice:', tipPrice);
  console.log('   = finalTotalAmount:', finalTotalAmount);
  console.log('   API total_price for verification:', cartData?.total_price);
  console.log('   VIP vip_full_amount:', cartData?.vip_full_amount);

  // Format currency exactly like Flutter
  const formatCurrency = (amount) => {
    return `₹${Math.round(parseFloat(amount || 0))}`;
  };

  // Wallet conditions (matches Flutter conditions: lines 1542-1543)
  // Note: Wallet is NOT shown for VIP payments (discountType == vip)
  const shouldShowWallet =
    !couponData &&
    paymentType === 'fullamount' &&  // Only for full amount, not VIP
    cartData.user_wallet_amount &&
    parseFloat(cartData.user_wallet_amount) > 0;

  // Handle wallet toggle (matches Flutter SwitchWalletCheckEvent)
  const handleWalletToggle = async () => {
    if (isLoading) return;

    try {
      await toggleWallet();
    } catch (error) {
      console.error('Failed to toggle wallet:', error);
    }
  };

  return (
    <motion.div
      className="mx-4 mb-5 mt-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <div className="bg-gray-100 rounded-2xl px-5 py-5">
        {/* Wallet Section - EXACT Flutter Implementation Match */}
        {shouldShowWallet && (
          <motion.div
            className="bg-white rounded-lg mb-5"
            style={{
              padding: '10px 12px 15px 11px', // Exact Flutter padding: top: 10.h, right: 12.w, bottom: 15.h, left: 11.w
              boxShadow: '0 4px 20px rgba(128, 128, 128, 0.4)', // Exact Flutter shadow
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-0">
              {/* Wallet Toggle Row - Exact Flutter Row Layout */}
              <div className="flex items-center">
                {/* Wallet Icon - 24x24 like Flutter */}
                <div className="h-6 w-6 flex-shrink-0">
                  <Wallet className="h-6 w-6 text-black" />
                </div>

                {/* 8px spacing like Flutter SizedBox(width: 8.w) */}
                <div className="w-2" />

                {/* Text - Bold 14px like Flutter AppText.bold14 */}
                <span className="font-bold text-sm text-gray-900">
                  Redeem EassyCash
                </span>

                {/* Expanded space like Flutter Expanded(child: Container()) */}
                <div className="flex-1" />

                {/* Clean Switch without conflicting styles */}
                <div className="flex items-center">
                  <Switch
                    checked={isWalletEnabled}
                    onCheckedChange={handleWalletToggle}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Redeemable Amount - Exact Flutter Padding */}
              <div style={{ paddingLeft: '32px' }}> {/* Exact Flutter: EdgeInsets.only(left: 32.w) */}
                <div className="flex">
                  <span className="text-sm text-gray-600">Redeemable Amount</span>
                  <span className="text-sm text-gray-600"> : </span>
                  <span className="text-sm text-gray-600">{formatCurrency(cartData.user_wallet_amount || '0')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Summary Header */}
        <div className="mb-2.5">
          <h3 className="font-bold text-base text-gray-900">Payment Summary</h3>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300 mb-4" />

        {/* Payment Breakdown */}
        <div className="space-y-4">
          {/* Number of Services - MODIFIED: Show when >= 1 to match order details */}
          {noOfServicesItems >= 1 && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">Number of Services</span>
              <span className="text-base font-bold text-gray-900">{noOfServicesItems}</span>
            </div>
          )}

          {/* Number of Packages - MODIFIED: Show when >= 1 to match order details */}
          {noOfPackageItems >= 1 && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">No. of Package</span>
              <span className="text-base font-bold text-gray-900">{noOfPackageItems}</span>
            </div>
          )}

          {/* DETAILED PAYMENT BREAKDOWN - Matching provided image exactly */}

          {/* 1. Item Total (excluding GST) - matches image "Item Total ₹499" */}
          <div className="flex justify-between">
            <span className="text-base text-gray-900">Item Total</span>
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(itemTotalExcludingGST)}
            </span>
          </div>

          {/* 2. GST on Item Total - matches image "GST on Item Total ₹90" */}
          <div className="flex justify-between">
            <span className="text-base text-gray-900">GST on Item Total</span>
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(gstOnItemTotal)}
            </span>
          </div>

          {/* 3. Convenience Fee - matches Flutter VIP logic (lines 1627-1628) */}
          <div className="flex justify-between">
            <span className="text-base text-gray-900">Convenience Fee</span>
            <span className="text-base font-bold text-gray-900">
              {paymentType === 'vip'
                ? formatCurrency(convenienceFeeExcludingGST)
                : formatCurrency(taxAndOtherServiceAmount)
              }
            </span>
          </div>

          {/* 4. GST on Convenience Fee - matches image "GST on Convenience Fee ₹11" */}
          <div className="flex justify-between">
            <span className="text-base text-gray-900">GST on Convenience Fee</span>
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(gstOnConvenienceFee)}
            </span>
          </div>

          {/* Promo Code Discount - matches Flutter (lines 1608-1610) */}
          {isCouponApplied && (
            <div className="flex justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-base text-gray-900">Discount</span>
                <span className="text-base font-bold text-orange-500">({couponData?.couponCode})</span>
              </div>
              <span className="text-base font-bold text-gray-900">
                - {formatCurrency(couponData?.couponValue || '0')}
              </span>
            </div>
          )}

          {/* VIP Discount - matches Flutter (lines 1612-1614) */}
          {paymentType === 'vip' && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">Subscription Discount</span>
              <span className="text-base font-bold text-gray-900">
                - {formatCurrency(cartData.viplifediscount || cartData.vip_discount_amount || '0')}
              </span>
            </div>
          )}

          {/* VIP Plan Amount - matches Flutter (lines 1616-1618) */}
          {paymentType === 'vip' && selectedVipPlan && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">Subscription Fee</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(cartData.vip_plan || selectedVipPlan?.price || '0')}
              </span>
            </div>
          )}

          {/* Donation - matches Flutter (lines 1632-1634) */}
          {selectedDonationTip !== '0' && donationData && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">{donationData.name}</span>
              <span className="text-base font-bold text-gray-900">
                + {formatCurrency(selectedDonationTip)}
              </span>
            </div>
          )}

          {/* Tip - matches Flutter (lines 1636-1638) */}
          {selectedTip !== '0' && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">Tip your service partner</span>
              <span className="text-base font-bold text-gray-900">
                + {formatCurrency(selectedTip)}
              </span>
            </div>
          )}

          {/* Wallet Deduction - when wallet is enabled (NOT for VIP payments) */}
          {isWalletEnabled && paymentType !== 'vip' && cartData.user_wallet_amount && parseFloat(cartData.user_wallet_amount) > 0 && (
            <div className="flex justify-between">
              <span className="text-base text-gray-900">EassyCash Deduction</span>
              <span className="text-base font-bold text-green-600">
                - {formatCurrency(Math.min(parseFloat(cartData.user_wallet_amount), finalTotalAmount))}
              </span>
            </div>
          )}


        </div>

        {/* Spacing before Grand Total */}
        <div className="my-2.5" />

        {/* Grand Total - uses standardized calculation (same as CheckoutButton "To Pay") */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-base text-gray-900">Grand Total</span>
          <span className="font-bold text-base text-gray-900">
            {formatCurrency(standardizedCalculations.finalTotalAmount)}
          </span>
        </div>

        {/* Savings Banner - matches Flutter implementation exactly */}
        <div className="mt-6">
          <div className="bg-green-100 rounded h-8 flex items-center justify-center">
            <span className="text-sm font-medium text-green-700">
              {(() => {
                // Match Flutter savings message logic exactly (lines 1651-1653)
                if (paymentType === 'partial') {
                  return `Balance payable ${formatCurrency(cartState.remainingPrice || '0')} before service`;
                } else {
                  // Calculate savings amount - matches Flutter finalTotalDiscountAmount
                  const savingsAmount = isCouponApplied
                    ? parseFloat(cartData.total_discount || '0') - parseFloat(couponData?.itemDiscountAmount || '0')
                    : parseFloat(cartData.total_discount || '0') - parseFloat(cartData.total_price || '0');

                  return `Hurray ! You saved ${formatCurrency(Math.abs(savingsAmount))} on final bill`;
                }
              })()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentSummarySection;
