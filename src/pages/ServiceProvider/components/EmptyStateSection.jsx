/**
 * EmptyStateSection - Empty state when no service providers are available
 * 
 * Implements exact Flutter empty state UI:
 * - Sad emoji icon
 * - Sorry message with service name
 * - Location-specific text
 * 
 * Flutter Reference: 
 * - flutterapp/lib/modules/ServiceProvider/view/select_service_provider.dart (sorryContainer)
 */

import React from 'react';

/**
 * EmptyStateSection Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.serviceNameValue - Name of the service
 * @param {Function} props.onExploreOtherServices - Handler for explore other services
 */
const EmptyStateSection = ({ serviceNameValue, onExploreOtherServices }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 mx-4 my-8">
      <div className="flex flex-col items-center justify-center py-10">
        {/* Sad Emoji Icon - Flutter: Image.asset(appAssets.sadSmily) */}
        <div className="w-12 h-12 mb-5">
          <div className="text-4xl">😔</div>
        </div>

        {/* Sorry Message - Flutter: RichText with multiple TextSpans */}
        <div className="text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            <span className="font-medium">Sorry! No service provider available for </span>
            <span className="font-bold">{serviceNameValue}</span>
            <span className="font-normal"> in your selected location.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateSection;
