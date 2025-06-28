import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';

/**
 * Tip Section Component
 * Matches Flutter tipContainerBuilder implementation with clean text-only design
 * Shows tip selection with predefined values in professional appearance
 */
const TipSection = ({ cartState }) => {
  const { selectTip } = useCart();

  const {
    cartData,
    selectedTip,
    status
  } = cartState;

  // Tip values - clean text-only format for professional appearance
  // Amounts match Flutter constant.CART_TIP_VALUES but without emojis
  const tipValues = [
    "10",
    "20",
    "50",
    "100"
  ];

  const isLoading = status === 'cartLoading';

  // Don't render if no cart data or cart is empty
  if (!cartData) return null;

  const hasCartItems = (cartData.groupedCart?.categories?.length || 0) > 0 ||
                      (cartData.groupedCart?.packages?.length || 0) > 0;

  if (!hasCartItems) {
    console.log('🔍 TipSection: Cart is empty, not rendering tip section');
    return null;
  }

  // Don't render if no tip values available (matches Flutter condition)
  if (!tipValues || tipValues.length === 0) {
    return null;
  }

  // Handle tip selection (matches Flutter SelectTipEvent)
  const handleTipSelect = async (amount) => {
    if (isLoading) return;

    try {
      const currentTip = selectedTip || '0';
      const newTip = currentTip === amount ? '0' : amount; // Toggle selection
      
      console.log('🔄 TipSection: Tip selection:', {
        currentTip,
        selectedAmount: amount,
        newTip,
        isDeselecting: currentTip === amount
      });

      await selectTip(newTip);
    } catch (error) {
      console.error('❌ TipSection: Failed to select tip:', error);
    }
  };

  // Format currency exactly like Flutter
  const formatCurrency = (amount) => {
    const numericAmount = Math.round(parseFloat(amount || 0));
    return `₹${numericAmount}`;
  };

  return (
    <motion.div
      className="mx-4 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <div className="bg-gray-100 rounded-2xl p-6">
        {/* Header Row - matches Flutter Row with MainAxisAlignment.spaceBetween */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Tip your service partner
          </h3>
          <p className="text-base font-semibold text-gray-900">
            ₹{selectedTip || '0'}
          </p>
        </div>

        {/* Description Text - matches Flutter RichText */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed text-left">
            <span>They work tirelessly for our happiness. </span>
            <span>100% of your tip will be transferred to them</span>
          </p>
        </div>

        {/* Tip Options - matches Flutter Wrap with spacing */}
        <div className="flex flex-wrap gap-2">
          {tipValues.map((amount, index) => {
            const isSelected = selectedTip === amount;

            return (
              <motion.button
                key={index}
                onClick={() => handleTipSelect(amount)}
                disabled={isLoading}
                className={`
                  h-11 px-3 rounded-lg flex items-center justify-center min-w-0
                  ${isSelected
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-black border border-gray-200'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  transition-all duration-200
                `}
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
              >
                <span className="font-bold text-sm whitespace-nowrap">
                  ₹{amount}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default TipSection;
