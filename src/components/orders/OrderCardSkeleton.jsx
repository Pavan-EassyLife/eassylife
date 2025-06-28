import React, { memo } from 'react';

/**
 * OrderCardSkeleton Component
 * Provides a skeleton loading state that matches the OrderCard layout
 */
const OrderCardSkeleton = memo(() => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Order number skeleton */}
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            {/* Partial payment badge skeleton */}
            <div className="h-5 bg-gray-200 rounded-full w-6"></div>
          </div>
          {/* Status badge skeleton */}
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        
        {/* Date and Time skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Provider and Service Section */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start space-x-3">
          {/* Avatar skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-2">
                {/* Provider name skeleton */}
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                {/* Service name skeleton */}
                <div className="h-3 bg-gray-200 rounded w-40"></div>
                {/* Package name skeleton */}
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              {/* Phone button skeleton */}
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        </div>

        {/* Address skeleton */}
        <div className="flex items-start space-x-2 mt-3">
          <div className="w-4 h-4 bg-gray-200 rounded mt-0.5 flex-shrink-0"></div>
          <div className="space-y-1 flex-1">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
            {/* Price skeleton */}
            <div className="h-5 bg-gray-200 rounded w-16"></div>
            {/* Partial payment indicator skeleton */}
            <div className="h-4 bg-gray-200 rounded-full w-20"></div>
          </div>
          
          {/* Cancellation info skeleton */}
          <div className="text-right flex-shrink-0 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderCardSkeleton.displayName = 'OrderCardSkeleton';

/**
 * OrderCardSkeletonList Component
 * Renders multiple skeleton cards for loading states
 */
export const OrderCardSkeletonList = memo(({ count = 3 }) => {
  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 max-w-4xl mx-auto">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="animate-in slide-in-from-bottom-4 duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <OrderCardSkeleton />
        </div>
      ))}
    </div>
  );
});

OrderCardSkeletonList.displayName = 'OrderCardSkeletonList';

export default OrderCardSkeleton;
