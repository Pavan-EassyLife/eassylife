import React, { lazy, Suspense } from 'react';

/**
 * LazyMobileComponents - Lazy loading wrapper for mobile components
 * Features:
 * - Code splitting for mobile components
 * - Reduces initial bundle size
 * - Only loads mobile components when needed
 * - Provides loading fallbacks
 */

// Lazy load mobile components
const MobileAppBar = lazy(() => import('./MobileAppBar'));
const BottomNavigation = lazy(() => import('./BottomNavigation'));
const BottomSearchBar = lazy(() => import('./BottomSearchBar'));

// Loading fallback components
const AppBarSkeleton = () => (
  <div className="mobile-app-bar md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
    <div className="flex items-center justify-between px-4 py-3 h-16">
      <div className="flex-1 min-w-0 mr-3">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="w-10 h-8 bg-gray-100 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const BottomNavSkeleton = () => (
  <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
    <div className="flex items-center justify-center h-20 px-2">
      <div className="flex w-full max-w-md justify-around">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center py-2 px-3 flex-1">
            <div className="w-6 h-6 bg-gray-100 rounded animate-pulse mb-1"></div>
            <div className="w-12 h-3 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SearchBarSkeleton = () => (
  <div className="mobile-search-bar md:hidden fixed bottom-20 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
    <div className="px-6 py-4" style={{ borderRadius: '24px 24px 0 0' }}>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Lazy mobile app bar with fallback
export const LazyMobileAppBar = () => (
  <Suspense fallback={<AppBarSkeleton />}>
    <MobileAppBar />
  </Suspense>
);

// Lazy bottom navigation with fallback
export const LazyBottomNavigation = () => (
  <Suspense fallback={<BottomNavSkeleton />}>
    <BottomNavigation />
  </Suspense>
);

// Lazy bottom search bar with fallback
export const LazyBottomSearchBar = () => (
  <Suspense fallback={<SearchBarSkeleton />}>
    <BottomSearchBar />
  </Suspense>
);

// Combined lazy mobile layout
export const LazyMobileLayout = ({ children }) => {
  return (
    <>
      <LazyMobileAppBar />
      <div className="mobile-content-wrapper">
        {children}
      </div>
      <LazyBottomSearchBar />
      <LazyBottomNavigation />
    </>
  );
};

export default LazyMobileLayout;
