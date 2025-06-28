import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * BottomButtonSection - Fixed bottom button for add to cart or explore other services
 * 
 * Flutter Reference:
 * - buttonWidgetBuilder method
 * - Material with elevation: 10, shadowColor: AppColor.black
 * - Background: white, borderRadius: top corners 30px
 * - Padding: top/bottom 20px, horizontal 24px (AppSize.margin)
 * - Button height: 52px, border radius: 10px
 * - Orange background (#FFA300), white text, 16sp bold
 * - Loading state: orange circular progress indicator
 * - Empty state: "Explore Other Service" button
 * 
 * Mobile: Fixed bottom position with exact Flutter styling
 * Web/Tablet: Relative positioning with enhanced styling
 */
const BottomButtonSection = ({ 
  hasProviders, 
  selectedProvider, 
  isButtonLoading, 
  onAddToCart, 
  onExploreOther, 
  layoutMode 
}) => {
  // Responsive classes based on layout mode
  const containerClasses = layoutMode === 'mobile'
    ? 'service-provider-mobile-bottom-button'
    : layoutMode === 'tablet'
    ? 'service-provider-tablet-bottom-button'
    : 'service-provider-desktop-bottom-button';

  // Button classes for responsive styling
  const buttonClasses = layoutMode === 'desktop'
    ? 'service-provider-desktop-add-to-cart-button w-full flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-200'
    : 'w-full flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-200';

  // Button styling
  const buttonStyle = {
    height: '52px',           // Flutter: height: 52.h
    borderRadius: '10px',     // Flutter: BorderRadius.circular(10.r)
    backgroundColor: '#FFA300', // Flutter: AppColor.orange
    color: 'white',           // Flutter: AppColor.white
    fontSize: '16px'          // Flutter: AppText.bold16
  };

  // Disabled button styling
  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#D1D5DB', // Grey background when disabled
    color: '#6B7280',           // Grey text when disabled
    cursor: 'not-allowed'
  };

  // Handle button click
  const handleButtonClick = () => {
    if (hasProviders) {
      if (selectedProvider) {
        onAddToCart();
      } else {
        // Show toast message (would be implemented with toast library)
        console.log('Please select a provider');
      }
    } else {
      onExploreOther();
    }
  };

  // Determine button state and content
  const getButtonContent = () => {
    if (isButtonLoading) {
      // Loading state - Flutter: Center(child: getButtonIndicatorOrangeLoader())
      return (
        <div className="flex items-center space-x-2">
          <Loader2 size={20} className="animate-spin" />
          <span>Adding to Cart...</span>
        </div>
      );
    }

    if (!hasProviders) {
      // No providers state - Flutter: AppButton(appLocalization.exploreOtherService, ...)
      return 'Explore Other Service';
    }

    // Normal state - Flutter: AppElevatedButton.appButton(..., text: appLocalization.addToCart)
    return 'Add to Cart';
  };

  // Determine if button should be disabled
  const isDisabled = isButtonLoading || (hasProviders && !selectedProvider);

  return (
    <div className={containerClasses}>
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={buttonClasses}
        style={isDisabled ? disabledButtonStyle : buttonStyle}
        aria-label={hasProviders ? 'Add to cart' : 'Explore other services'}
      >
        {getButtonContent()}
      </button>

      {/* Helper text for selection requirement */}
      {hasProviders && !selectedProvider && !isButtonLoading && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500">
            Please select a service provider to continue
          </span>
        </div>
      )}
    </div>
  );
};

export default BottomButtonSection;
