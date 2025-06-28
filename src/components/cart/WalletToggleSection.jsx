import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

/**
 * Wallet Toggle Section Component
 * Matches Flutter wallet toggle implementation
 * Shows wallet toggle with balance display and state management
 */
const WalletToggleSection = ({ cartState }) => {
  const { toggleWallet } = useCart();

  const { 
    cartData, 
    isWalletEnabled, 
    status,
    couponData,
    paymentType 
  } = cartState;

  const isWalletLoading = status === 'cartLoading';

  // Don't render if no cart data
  if (!cartData) return null;

  // Get available wallet amount (matches Flutter availableWalletAmount calculation)
  const availableWalletAmount = cartData.userWalletAmount || '0';
  const formattedWalletAmount = `₹${parseFloat(availableWalletAmount).toLocaleString('en-IN')}`;

  // Check if wallet should be shown (matches Flutter conditions)
  const shouldShowWallet = 
    !couponData && 
    paymentType === 'fullamount' && 
    formattedWalletAmount !== '₹0';

  // Handle wallet toggle (matches Flutter SwitchWalletCheckEvent)
  const handleWalletToggle = async () => {
    if (isWalletLoading) return;

    try {
      await toggleWallet();

      // Analytics tracking (matches Flutter AppEventsHelper.onWalletSelectionInCartEvent)
      // analytics.track('wallet_selection_in_cart', {
      //   total_price: cartState.totalPrice || '0',
      //   wallet_amount: availableWalletAmount,
      //   enabled: !isWalletEnabled
      // });
    } catch (error) {
      console.error('Failed to toggle wallet:', error);
    }
  };

  // Don't render if wallet shouldn't be shown
  if (!shouldShowWallet) {
    return null;
  }

  return (
    <motion.div 
      className="mx-6 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Wallet Toggle Container */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="space-y-3">
          {/* Wallet Toggle Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-gray-700" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">
                Redeem EassyCash
              </h4>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center">
              {isWalletLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
              ) : (
                <motion.button
                  onClick={handleWalletToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    isWalletEnabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isWalletEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    layout
                  />
                </motion.button>
              )}
            </div>
          </div>

          {/* Wallet Balance Display */}
          <div className="pl-8">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Redeemable Amount</span>
              <span className="text-sm text-gray-600">:</span>
              <span className="text-sm font-medium text-gray-900">
                {formattedWalletAmount}
              </span>
            </div>
          </div>

          {/* Wallet Status Message */}
          {isWalletEnabled && (
            <motion.div 
              className="pl-8 pt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs text-green-600">
                ✓ Wallet payment enabled. Your EassyCash will be applied to this order.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WalletToggleSection;
