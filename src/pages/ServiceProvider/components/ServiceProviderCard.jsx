/**
 * ServiceProviderCard - Individual service provider card component
 * 
 * Implements exact Flutter provider card UI:
 * - Best deal badge (top-right, orange)
 * - Provider image, name, and selection state
 * - Price display with strike-through
 * - Savings badge (green)
 * - Recommended badge (orange, bottom-right)
 * 
 * Flutter Reference: 
 * - flutterapp/lib/modules/ServiceProvider/view/select_service_provider.dart (lines 277-404)
 */

import React from 'react';
import { Check } from 'lucide-react';
import { useServiceProvider } from '../../../contexts/ServiceProviderContext';

/**
 * Format currency exactly like Flutter CurrencyManager.formatCurrency
 * 
 * @param {string|number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${Math.round(numAmount)}`;
};

/**
 * Calculate discount percentage exactly like Flutter
 * 
 * @param {string|number} strikePrice - Original price
 * @param {string|number} currentPrice - Current price
 * @returns {string} Discount percentage string
 */
const getDiscountPercentage = (strikePrice, currentPrice) => {
  const strike = parseFloat(strikePrice) || 0;
  const current = parseFloat(currentPrice) || 0;
  
  if (strike <= current || strike === 0) return '0%';
  
  const discount = ((strike - current) / strike) * 100;
  return `${Math.round(discount)}% off`;
};

/**
 * ServiceProviderCard Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.provider - Service provider data
 * @param {boolean} props.isSelected - Whether this provider is selected
 * @param {Function} props.onSelect - Selection handler
 */
const ServiceProviderCard = ({ provider, isSelected, onSelect }) => {
  const { toggleProvider } = useServiceProvider();

  // Extract provider data
  const {
    id,
    price = '0',
    strikePrice = '0',
    recommended = false,
    bestDeal = false,
    provider: providerInfo = {}
  } = provider;

  const {
    image = '',
    firstName = '',
    lastName = '',
    companyName = ''
  } = providerInfo;

  // Calculate savings
  const currentPrice = parseFloat(price) || 0;
  const originalPrice = parseFloat(strikePrice) || 0;
  const savedAmount = originalPrice > currentPrice ? originalPrice - currentPrice : 0;

  /**
   * Handle provider selection
   */
  const handleSelect = () => {
    toggleProvider(provider);
    if (onSelect) onSelect();
  };

  return (
    <div className="relative">
      {/* Best Deal Badge - Flutter: bestDeal badge at top */}
      {bestDeal && !recommended && (
        <div className="flex justify-end mb-0">
          <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-t-xl rounded-bl-xl">
            Best Deal
          </div>
        </div>
      )}

      {/* Main Card Container - Flutter: GestureDetector with Container */}
      <div
        onClick={handleSelect}
        className={`
          bg-white rounded-lg p-4 cursor-pointer transition-all duration-200
          ${bestDeal && !recommended ? 'rounded-t-none' : ''}
          hover:shadow-md
        `}
      >
        {/* Provider Info Row */}
        <div className="flex items-center space-x-5">
          {/* Provider Image - Flutter: 90h x 98w container */}
          <div className="w-24 h-20 bg-gray-100 rounded-lg p-2 flex-shrink-0">
            {image ? (
              <img
                src={image}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback for missing image (matches cart implementation) */}
            <div
              className={`w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-lg ${image ? 'hidden' : 'flex'}`}
              style={{
                backgroundColor: '#FFA300', // Orange background matching Flutter AppColor.orange
                display: image ? 'none' : 'flex'
              }}
            >
              {firstName ? firstName.charAt(0).toUpperCase() : 'P'}
            </div>
          </div>

          {/* Provider Details */}
          <div className="flex-1 min-w-0">
            {/* Name and Selection Row */}
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-sm text-gray-900 truncate">
                {`${firstName} ${lastName}`.trim() || companyName || 'Service Provider'}
              </h3>
              
              {/* Selection Indicator - Flutter: tick or empty circle */}
              <div className="flex-shrink-0 ml-2">
                {isSelected ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
            </div>

            {/* Price Row - Flutter: price and strikePrice display */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-bold text-lg text-gray-900">
                {formatCurrency(price)}*
              </span>
              {originalPrice > currentPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(strikePrice)}
                </span>
              )}
            </div>

            {/* Savings Badge - Flutter: green container with savings */}
            {savedAmount > 0 && (
              <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded">
                You Save {formatCurrency(savedAmount)} ({getDiscountPercentage(strikePrice, price)})
              </div>
            )}
          </div>
        </div>

        {/* Divider Line - Flutter: grey container */}
        <div className="h-px bg-gray-200 my-3 ml-28"></div>

        {/* Bottom Row - Flutter: rating and recommended badge */}
        <div className="flex justify-between items-center ml-28">
          <div></div> {/* Empty space for rating (not implemented in Flutter) */}
          
          {/* Recommended Badge - Flutter: orange container */}
          {recommended && (
            <div className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded">
              Eassylife Recommended
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderCard;
