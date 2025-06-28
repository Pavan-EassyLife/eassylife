import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

/**
 * Tip Selection Section Component
 * Matches Flutter tipContainerBuilder implementation
 * Shows tip selection grid with emoji amounts and selection states
 */
const TipSelectionSection = ({ cartState }) => {
  const { selectTip } = useCart();
  const { selectedTip } = cartState;

  // Tip values with emojis (matches Flutter constant.CART_TIP_VALUES)
  const tipValues = [
    '😊 50',
    '😍 100', 
    '🤩 150',
    '🥰 200',
    '😘 250'
  ];

  // Check if tips should be shown (matches Flutter constant.CART_TIP_VALUES.isEmpty check)
  if (!tipValues || tipValues.length === 0) {
    return null;
  }

  // Handle tip selection (matches Flutter SelectTipEvent)
  const handleTipSelect = async (tipAmount) => {
    try {
      // Parse amount from emoji format "😊 50" -> "50"
      const amount = tipAmount.split(' ')[1];
      const isCurrentlySelected = selectedTip === amount;
      
      if (isCurrentlySelected) {
        // Deselect current tip (set to '0')
        await selectTip('0');
      } else {
        // Select new tip amount
        await selectTip(amount);
      }

      // Analytics tracking (matches Flutter analytics)
      // analytics.track('tip_selected', {
      //   tip_amount: isCurrentlySelected ? '0' : amount,
      //   emoji: tipAmount.split(' ')[0]
      // });
    } catch (error) {
      console.error('Failed to select tip:', error);
    }
  };

  // Format currency (matches Flutter CurrencyManager.formatCurrency)
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  // Get selected tip amount for display
  const selectedTipAmount = selectedTip && selectedTip !== '0' ? selectedTip : '0';

  return (
    <motion.div 
      className="mx-6 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tip Container */}
      <div className="bg-gray-100 rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-semibold text-gray-900">
              Tip your Service Partner
            </h4>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(selectedTipAmount)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          They work tirelessly for our happiness. 100% of your tip will be transferred to them.
        </p>

        {/* Tip Selection Grid */}
        <div className="flex flex-wrap gap-2">
          {tipValues.map((tipValue, index) => {
            const emoji = tipValue.split(' ')[0];
            const amount = tipValue.split(' ')[1];
            const isSelected = selectedTip === amount;

            return (
              <motion.button
                key={tipValue}
                onClick={() => handleTipSelect(tipValue)}
                className={`h-11 px-3 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(amount)}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Tip Indicator */}
        {selectedTip && selectedTip !== '0' && (
          <motion.div 
            className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-orange-700 text-center">
              Thank you for your generosity! Your tip of {formatCurrency(selectedTip)} will be added to your total.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TipSelectionSection;
