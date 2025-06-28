import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';

/**
 * Donation Section Component
 * Exactly matches Flutter contributionWidgetBuilder implementation (lines 975-1054)
 * Shows charity donation options with predefined amounts
 */
const DonationSection = ({ cartState }) => {
  const { selectDonationTip } = useCart();

  const {
    donationData,
    selectedDonationTip,
    status
  } = cartState;

  // Donation amounts (matches Flutter donationMoneyList)
  const donationAmounts = ['50', '100', '150', '250', '500'];

  const isLoading = status === 'cartLoading';

  // Don't render if no donation data (matches Flutter condition: if (state.donationData != null))
  if (!donationData) {
    return null;
  }

  // Handle donation selection (matches Flutter SelectDonationTipEvent)
  const handleDonationSelect = async (amount) => {
    if (isLoading) return;

    try {
      const currentDonation = selectedDonationTip || '0';
      const newDonation = currentDonation === amount ? '0' : amount; // Toggle selection
      
      console.log('🔄 DonationSection: Donation selection:', {
        currentDonation,
        selectedAmount: amount,
        newDonation,
        isDeselecting: currentDonation === amount
      });

      await selectDonationTip(newDonation);
    } catch (error) {
      console.error('❌ DonationSection: Failed to select donation:', error);
    }
  };

  // Format currency exactly like Flutter
  const formatCurrency = (amount) => {
    return `₹${Math.round(parseFloat(amount || 0))}`;
  };

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      {/* Top Divider - matches Flutter Container with grey color */}
      <div className="mx-6 h-px bg-gray-400 mb-6" />

      <div className="mx-6">
        {/* Header Section - matches Flutter Row with CrossAxisAlignment.start */}
        <div className="flex items-start space-x-3 mb-4.5">
          {/* Text Content - matches Flutter Expanded Column */}
          <div className="flex-1">
            <h3 className="text-gray-900 font-bold text-lg text-left mb-1">
              {donationData.name || 'Charity Donation'}
            </h3>
            <p className="text-gray-600 text-xs text-left mb-4.5">
              {donationData.description || 'Support a good cause'}
            </p>
            <p className="text-gray-600 text-xs text-left">
              Contribute to bring a change
            </p>
          </div>

          {/* Logo Image - matches Flutter Container with fixed dimensions */}
          <div className="w-28 h-16.5 flex-shrink-0">
            <img
              src={donationData.logoImage || '/images/default-charity-logo.png'}
              alt={donationData.name || 'Charity Logo'}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = '/images/default-charity-logo.png'; // Fallback image
              }}
            />
          </div>
        </div>

        {/* Donation Amount Selection - matches Flutter ListView.builder horizontal */}
        <div className="h-10 mb-2.5">
          <div className="flex space-x-2 overflow-x-auto">
            {donationAmounts.map((amount, index) => {
              const isSelected = selectedDonationTip === amount;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleDonationSelect(amount)}
                  disabled={isLoading}
                  className={`
                    h-9 w-14 flex-shrink-0 rounded-md flex items-center justify-center
                    ${isSelected 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-black'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    transition-all duration-200
                  `}
                  whileHover={!isLoading ? { scale: 1.05 } : {}}
                  whileTap={!isLoading ? { scale: 0.95 } : {}}
                >
                  <span className="font-semibold text-sm">
                    {formatCurrency(amount)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Donation Image - matches Flutter Container with fixed dimensions */}
        <div className="w-full h-36.5 mb-5.75">
          <img
            src={donationData.image || '/images/default-donation-campaign.png'}
            alt="Donation Campaign"
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              e.target.src = '/images/default-donation-campaign.png'; // Fallback image
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DonationSection;
