import React from 'react';
import { Check } from 'lucide-react';
import { 
  getProviderFullName, 
  getProviderAvatarFallback, 
  calculateSavings, 
  calculateDiscountPercentage, 
  formatCurrency 
} from '../../types/serviceProvider';

/**
 * ProviderCard - Individual service provider card component
 * 
 * Flutter Reference:
 * - Best Deal Badge: 22x84px, orange background, top corners 12px radius
 * - Card: 16px bottom margin, 9px border radius, white background
 * - Padding: left: 13px, top: 16px, bottom: 16px, right: 18px
 * - Avatar: 90x98px container with 8px padding
 * - Selection indicator: 20x20px tick or 20x28px empty circle
 * - Price: 18sp bold, Strike price: 14sp regular grey with line-through
 * - Savings badge: 4px border radius, light green background
 * - Recommended badge: 4px border radius, orange background with 15% opacity
 * 
 * Mobile: Exact Flutter dimensions and styling
 * Web/Tablet: Enhanced hover effects with maintained proportions
 */
const ProviderCard = ({ 
  provider, 
  isSelected, 
  onSelect, 
  layoutMode 
}) => {
  // Calculate pricing information
  const price = parseFloat(provider.price) || 0;
  const strikePrice = parseFloat(provider.strikePrice) || 0;
  const savings = calculateSavings(strikePrice, price);
  const discountPercentage = calculateDiscountPercentage(strikePrice, price);
  const providerName = getProviderFullName(provider.provider);
  const avatarFallback = getProviderAvatarFallback(provider.provider);

  // Responsive classes based on layout mode
  const cardClasses = layoutMode === 'mobile'
    ? 'service-provider-mobile-card cursor-pointer'
    : layoutMode === 'tablet'
    ? 'service-provider-tablet-card cursor-pointer'
    : 'service-provider-desktop-card cursor-pointer';

  return (
    <div className="relative">
      {/* Best Deal Badge (conditional) - Flutter: if ((provider.bestDeal ?? false) && !(provider.recommended ?? false)) */}
      {provider.bestDeal && !provider.recommended && (
        <div className="flex justify-end">
          <div 
            className="h-5.5 w-21 flex items-center justify-center rounded-t-3"
            style={{
              height: '22px', // Flutter: height: 22.h
              width: '84px',  // Flutter: width: 84.w
              backgroundColor: '#FFA300', // Flutter: AppColor.orange
              borderTopLeftRadius: '12px',  // Flutter: BorderRadius.only(topLeft: Radius.circular(12))
              borderTopRightRadius: '12px'  // Flutter: BorderRadius.only(topRight: Radius.circular(12))
            }}
          >
            <span 
              className="text-xs font-bold text-white"
              style={{ fontSize: '12px' }} // Flutter: AppText.bold12
            >
              Best Deal
            </span>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div 
        className={cardClasses}
        onClick={onSelect}
        style={{
          marginBottom: '16px', // Flutter: EdgeInsets.only(bottom: 16.h)
          padding: '16px 18px 16px 13px', // Flutter: EdgeInsets.only(left: 13.h, top: 16.h, bottom: 16.h, right: 18.w)
          backgroundColor: 'white',
          borderRadius: '9px' // Flutter: BorderRadius.circular(9.h)
        }}
      >
        {/* Provider Information Row */}
        <div className="flex items-center">
          {/* Provider Avatar */}
          <div 
            className="flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg"
            style={{
              height: '90px', // Flutter: height: 90.h
              width: '98px',  // Flutter: width: 98.w
              padding: '8px', // Flutter: EdgeInsets.all(8.h)
              borderRadius: '8px' // Flutter: 8.r
            }}
          >
            {provider.provider?.image ? (
              <img
                src={provider.provider.image}
                alt={providerName}
                className="w-full h-full object-cover rounded-lg"
                style={{ borderRadius: '8px' }}
                onError={(e) => {
                  // Show placeholder on image error (matches cart implementation)
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Placeholder with first letter and orange background (matches cart implementation) */}
            <div
              className={`w-full h-full flex items-center justify-center text-white font-bold text-lg rounded-lg ${provider.provider?.image ? 'hidden' : 'flex'}`}
              style={{
                backgroundColor: '#FFA300', // Flutter: AppColor.orange
                borderRadius: '8px',
                display: provider.provider?.image ? 'none' : 'flex'
              }}
            >
              {avatarFallback}
            </div>
          </div>

          {/* Spacing - Flutter: SizedBox(width: 21.w) */}
          <div className="w-5"></div>

          {/* Provider Details */}
          <div className="flex-1 min-w-0">
            {/* Top spacing - Flutter: SizedBox(height: 4.h) */}
            <div className="h-1"></div>

            {/* Provider Name and Selection Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-bold text-left truncate"
                  style={{ 
                    fontSize: '14px', // Flutter: AppText.bold14
                    color: '#161616'  // Flutter: AppColor.black
                  }}
                >
                  {providerName}
                </h3>
              </div>

              {/* Selection Indicator */}
              <div className="flex-shrink-0 ml-2">
                {isSelected ? (
                  // Selected state - Flutter: Container(height: 20.h, width: 20.h, child: Image.asset(appAssets.tick))
                  <div 
                    className="flex items-center justify-center rounded-full"
                    style={{
                      height: '20px', // Flutter: height: 20.h
                      width: '20px',  // Flutter: width: 20.h
                      backgroundColor: '#FFA300' // Orange background for tick
                    }}
                  >
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  // Unselected state - Flutter: Container(padding: EdgeInsets.all(8.h), height: 20.h, width: 28.w, decoration: BoxDecoration(shape: BoxShape.circle, color: AppColor.lightGrey))
                  <div 
                    className="rounded-full"
                    style={{
                      height: '20px',     // Flutter: height: 20.h
                      width: '28px',      // Flutter: width: 28.w
                      backgroundColor: '#F6F6F6', // Flutter: AppColor.lightGrey
                      padding: '8px'      // Flutter: EdgeInsets.all(8.h)
                    }}
                  ></div>
                )}
              </div>
            </div>

            {/* Spacing - Flutter: SizedBox(height: 4.h) */}
            <div className="h-1"></div>

            {/* Price Information */}
            <div className="flex items-center">
              {/* Current Price - Flutter: AppText.bold18("${CurrencyManager.formatCurrency(price.toString())}*") */}
              <span 
                className="font-bold"
                style={{ 
                  fontSize: '18px', // Flutter: AppText.bold18
                  color: '#161616'  // Flutter: AppColor.black
                }}
              >
                {formatCurrency(price)}*
              </span>

              {/* Strike Price */}
              {strikePrice > price && (
                <div className="flex items-center ml-2">
                  {/* Spacing - Flutter: SizedBox(width: 7.w) */}
                  <span 
                    className="line-through"
                    style={{ 
                      fontSize: '14px', // Flutter: AppText.regular14
                      color: '#888888'  // Flutter: AppColor.grey
                    }}
                  >
                    {formatCurrency(strikePrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Spacing - Flutter: SizedBox(height: 4.h) */}
            <div className="h-1"></div>

            {/* Savings Badge */}
            {savings > 0 && (
              <div 
                className="inline-block"
                style={{
                  padding: '6px 12px', // Flutter: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h)
                  borderRadius: '4px',  // Flutter: BorderRadius.circular(4.h)
                  backgroundColor: 'rgba(82, 180, 107, 0.1)' // Flutter: AppColor.lightGreen
                }}
              >
                <span 
                  className="font-bold text-left text-xs"
                  style={{ 
                    fontSize: '12px', // Flutter: AppText.bold12
                    color: '#52B46B'  // Flutter: AppColor.green
                  }}
                >
                  You Save {formatCurrency(savings)} ({discountPercentage})
                </span>
              </div>
            )}

            {/* Spacing - Flutter: SizedBox(height: 13.h) */}
            <div className="h-3"></div>
          </div>
        </div>

        {/* Separator Line - Flutter: Container(height: 1.h, width: 200.w, color: Colors.grey.shade200) */}
        <div 
          className="my-3"
          style={{
            height: '1px',    // Flutter: height: 1.h
            width: '200px',   // Flutter: width: 200.w
            backgroundColor: '#E5E7EB' // Flutter: Colors.grey.shade200
          }}
        ></div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <div></div> {/* Empty space for alignment */}
          
          {/* Recommended Badge (conditional) - Flutter: if (provider.recommended ?? false) */}
          {provider.recommended && (
            <div 
              className="inline-block"
              style={{
                padding: '6px 12px', // Flutter: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h)
                borderRadius: '4px',  // Flutter: BorderRadius.circular(4.h)
                backgroundColor: 'rgba(255, 163, 0, 0.15)' // Flutter: AppColor.orange.withOpacity(0.15)
              }}
            >
              <span 
                className="font-bold text-center text-xs"
                style={{ 
                  fontSize: '12px', // Flutter: AppText.bold12
                  color: '#FFA300'  // Flutter: AppColor.orange
                }}
              >
                Eassylife Recommended
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
