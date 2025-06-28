import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * HeaderBanner - Service provider page header with banner image and back button
 * 
 * Flutter Reference:
 * - Container with AppColor.lightOrange1 background (#FCDFAD)
 * - Height: 220.h (220px)
 * - Back button: 30x30px, positioned at top: 10px, left: 15px
 * - Border radius: 12px, white background with shadow
 * - Banner image: spPageBannerImage with BoxFit.cover
 * 
 * Mobile: Exact Flutter dimensions and positioning
 * Web/Tablet: Responsive height and enhanced styling
 */
const HeaderBanner = ({ onBack, layoutMode }) => {
  // Responsive classes based on layout mode
  const containerClasses = layoutMode === 'mobile'
    ? 'service-provider-mobile-banner relative w-full flex items-center justify-center overflow-hidden'
    : layoutMode === 'tablet'
    ? 'service-provider-tablet-banner relative w-full flex items-center justify-center overflow-hidden'
    : 'service-provider-desktop-banner relative w-full flex items-center justify-center overflow-hidden';

  const backButtonClasses = layoutMode === 'mobile'
    ? 'service-provider-mobile-back-button flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200'
    : layoutMode === 'tablet'
    ? 'service-provider-tablet-back-button flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200'
    : 'service-provider-desktop-back-button flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200';

  const iconSize = layoutMode === 'mobile' ? 18 : layoutMode === 'tablet' ? 20 : 24;

  return (
    <div className={containerClasses}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/images/spPageBanner.jpg')`,
          backgroundColor: '#FCDFAD' // Fallback color matching Flutter AppColor.lightOrange1
        }}
      >
        {/* Overlay for better contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className={backButtonClasses}
        aria-label="Go back"
      >
        <ArrowLeft 
          size={iconSize} 
          className="text-gray-800" 
          strokeWidth={2}
        />
      </button>

      {/* Optional: Service provider page indicator or breadcrumb */}
      {layoutMode !== 'mobile' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-gray-800">
              Select Service Provider
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderBanner;
