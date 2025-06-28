import React from 'react';

/**
 * ServiceNameSection - Service name and time required display
 * 
 * Flutter Reference:
 * - serviceNameAndRatingBuilder method
 * - Top spacing: 30.h (30px)
 * - Horizontal padding: AppSize.margin (24px)
 * - Service name: AppText.bold20 (20sp, bold, black)
 * - Bottom spacing: 10.h (10px)
 * - Time indicator: grey dot (5x5px) + 7px spacing + 12sp grey text
 * - Final bottom spacing: 20.h (20px)
 * 
 * Mobile: Exact Flutter dimensions and typography
 * Web/Tablet: Responsive typography with maintained spacing ratios
 */
const ServiceNameSection = ({ serviceName, timeRequired, layoutMode }) => {
  // Responsive classes based on layout mode
  const containerClasses = layoutMode === 'mobile'
    ? 'service-provider-mobile-service-name'
    : layoutMode === 'tablet'
    ? 'service-provider-tablet-service-name'
    : 'service-provider-desktop-service-name';

  // Typography classes based on layout mode
  const serviceNameClasses = layoutMode === 'mobile'
    ? 'text-xl font-bold text-gray-900' // 20px font size (Flutter: 20sp)
    : 'service-provider-title'; // Responsive title class

  const timeTextClasses = layoutMode === 'mobile'
    ? 'text-xs text-gray-500' // 12px font size (Flutter: 12sp)
    : 'service-provider-caption-text'; // Responsive caption class

  return (
    <div className={containerClasses}>
      <div className="flex flex-col">
        {/* Service Name */}
        <div className="flex items-center justify-between">
          <h1 className={serviceNameClasses}>
            {serviceName || 'Service'}
          </h1>
          
          {/* Optional: Filter icon placeholder (commented out in Flutter) */}
          {/* 
          <button className="p-2">
            <FilterIcon size={24} className="text-gray-600" />
          </button>
          */}
        </div>

        {/* Spacing after service name - Flutter: SizedBox(height: 10.h) */}
        <div className="h-2.5"></div>

        {/* Time Required Section (conditional) */}
        {timeRequired && timeRequired.trim() !== '' && (
          <div className="flex items-center">
            {/* Grey dot indicator - Flutter: Container(height: 5.h, width: 5.h, decoration: BoxDecoration(color: AppColor.grey, shape: BoxShape.circle)) */}
            <div 
              className="w-1.5 h-1.5 rounded-full bg-gray-400"
              style={{ backgroundColor: '#888888' }} // Flutter: AppColor.grey
            ></div>
            
            {/* Spacing - Flutter: SizedBox(width: 7.w) */}
            <div className="w-1.5"></div>
            
            {/* Time text - Flutter: AppText(timeRequired, size: 12.sp, color: AppColor.grey) */}
            <span 
              className={timeTextClasses}
              style={{ color: '#888888' }} // Flutter: AppColor.grey
            >
              {timeRequired}
            </span>
          </div>
        )}

        {/* Bottom spacing - Flutter: SizedBox(height: 20.h) */}
        <div className="h-5"></div>
      </div>
    </div>
  );
};

export default ServiceNameSection;
