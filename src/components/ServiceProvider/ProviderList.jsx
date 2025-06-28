import React from 'react';
import ProviderCard from './ProviderCard';
import { useServiceProvider } from '../../contexts/ServiceProviderContext';

/**
 * ProviderList - Container for service provider cards with pull-to-refresh
 * 
 * Flutter Reference:
 * - providerListBuilder method
 * - Container with lightGrey background (#F6F6F6)
 * - Margin: horizontal 24px (AppSize.margin)
 * - Padding: horizontal 16px (AppSize.padding)
 * - Border radius: 16px
 * - Section header: "Select Service Provider" with 24px top spacing, 18px bottom spacing
 * - ListView.builder with shrinkWrap: true, physics: ScrollPhysics()
 * - Bottom padding: 24px
 * 
 * Mobile: Exact Flutter layout and dimensions
 * Web/Tablet: Enhanced spacing and hover effects
 */
const ProviderList = ({
  providers,
  selectedProvider,
  hasProviders,
  layoutMode
}) => {
  const { toggleProvider } = useServiceProvider();

  // Handle provider selection
  const handleProviderSelect = (provider) => {
    console.log('🔄 ProviderList: Provider selected:', provider.id);
    
    // Call context method to toggle provider selection
    // This matches Flutter ToggleProviderEvent
    toggleProvider(
      provider,
      '', // serviceName - would be passed from parent in real implementation
      '', // subServiceName - would be passed from parent in real implementation
      []  // filterList - would be passed from parent in real implementation
    );
  };



  // Responsive classes based on layout mode
  const containerClasses = layoutMode === 'mobile'
    ? 'service-provider-mobile-list-container'
    : layoutMode === 'tablet'
    ? 'service-provider-tablet-list-container'
    : 'service-provider-desktop-list-container';

  // Show empty state if no providers
  if (!hasProviders) {
    return (
      <div className={containerClasses}>
        {/* Section Header */}
        <div 
          className="flex flex-col"
          style={{ paddingTop: '24px' }} // Flutter: SizedBox(height: 24.h)
        >
          <h2 
            className="font-bold"
            style={{ 
              fontSize: '16px', // Flutter: AppText.bold16
              color: '#161616'  // Flutter: AppColor.black
            }}
          >
            Select Service Provider
          </h2>
          
          {/* Spacing - Flutter: SizedBox(height: 18.h) */}
          <div className="h-4"></div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12">
            {/* Sad emoji icon - Flutter: Container(height: 50.h, width: 50.h, child: Image.asset(appAssets.sadSmily)) */}
            <div className="w-12 h-12 mb-5 text-4xl">😔</div>
            
            {/* Sorry message */}
            <div className="text-center px-4">
              <p 
                className="text-lg"
                style={{ 
                  fontSize: '18px', // Flutter: AppTextStyle.medium18()
                  color: '#161616'  // Flutter: AppColor.black
                }}
              >
                Sorry, no service provider available for this service in your selected location.
              </p>
            </div>

            {/* Note: Refresh functionality would be handled by parent component */}
          </div>

          {/* Bottom spacing - Flutter: SizedBox(height: 40.h) */}
          <div className="h-10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Section Header */}
      <div 
        className="flex flex-col"
        style={{ paddingTop: '24px' }} // Flutter: SizedBox(height: 24.h)
      >
        <h2
          className="font-bold"
          style={{
            fontSize: '16px', // Flutter: AppText.bold16
            color: '#161616'  // Flutter: AppColor.black
          }}
        >
          Select Service Provider
        </h2>
        
        {/* Spacing - Flutter: SizedBox(height: 18.h) */}
        <div className="h-4"></div>

        {/* Provider Cards List */}
        <div 
          className="space-y-0"
          style={{ paddingBottom: '24px' }} // Flutter: padding: EdgeInsets.only(bottom: 24.h)
        >
          {providers.map((provider, index) => (
            <ProviderCard
              key={provider.id || index}
              provider={provider}
              isSelected={provider === selectedProvider}
              onSelect={() => handleProviderSelect(provider)}
              layoutMode={layoutMode}
            />
          ))}
        </div>
      </div>

      {/* Note: Pull-to-refresh would be handled by parent component */}
    </div>
  );
};

export default ProviderList;
