import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Import coupon components
import CouponHeader from '../../components/coupons/CouponHeader';
import CouponSearchField from '../../components/coupons/CouponSearchField';
import CouponList from '../../components/coupons/CouponList';
import CouponLoadingState from '../../components/coupons/CouponLoadingState';
import CouponEmptyState from '../../components/coupons/CouponEmptyState';

// Import context and types
import { CouponProvider, useCouponContext } from '../../contexts/CouponContext';
import { CouponStatus } from '../../types/coupon';

/**
 * Coupons Page Content Component
 * Exactly matches Flutter AvailableOfferScreen structure and behavior
 */
const CouponsPageContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    availableCouponsList,
    status,
    errorMessage,
    fetchAvailableCoupons,
    refreshAvailableCoupons,
    isCouponAppliedSuccessfully,
    couponResponse
  } = useCouponContext();

  // Get selected coupon from navigation state (passed from cart)
  const selectedCouponResponse = location.state?.selectedCouponResponse || null;

  // Initialize coupon data on mount
  useEffect(() => {
    console.log('🎫 CouponsPage: Component mounted, fetching coupons...');
    fetchAvailableCoupons();
  }, [fetchAvailableCoupons]);

  // Handle successful coupon application - return to cart
  useEffect(() => {
    if (isCouponAppliedSuccessfully && couponResponse) {
      console.log('✅ CouponsPage: Coupon applied successfully, returning to cart with data:', couponResponse);
      
      // Return to cart with coupon data (matches Flutter Navigator.pop(state.couponResponse))
      navigate('/cart', { 
        state: { 
          appliedCoupon: couponResponse,
          returnFromCoupons: true 
        },
        replace: true 
      });
    }
  }, [isCouponAppliedSuccessfully, couponResponse, navigate]);

  // Handle back navigation
  const handleBack = () => {
    console.log('🔙 CouponsPage: Navigating back to cart');
    navigate('/cart');
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    try {
      console.log('🔄 CouponsPage: Refreshing coupons...');
      await refreshAvailableCoupons();
    } catch (error) {
      console.error('❌ CouponsPage: Failed to refresh coupons:', error);
    }
  };

  // Render loading state
  if (status === CouponStatus.INITIAL || status === CouponStatus.AVAILABLE_COUPONS_LOADING) {
    return <CouponLoadingState onBack={handleBack} />;
  }

  // Render empty state
  if (status === CouponStatus.NO_DATA_FOUND) {
    return (
      <CouponEmptyState 
        onBack={handleBack}
        onRefresh={handleRefresh}
        message={errorMessage || 'No coupons available'}
      />
    );
  }

  // Render error state
  if (status === CouponStatus.FAILURE && errorMessage) {
    return (
      <CouponEmptyState 
        onBack={handleBack}
        onRefresh={handleRefresh}
        message={errorMessage}
        isError={true}
      />
    );
  }

  // Debug coupon state
  console.log('🎫 CouponsPage: Rendering with state:', {
    couponsCount: availableCouponsList.length,
    status,
    hasSelectedCoupon: !!selectedCouponResponse
  });

  // Render main coupon content
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Coupon Header */}
      <CouponHeader
        onBack={handleBack}
        couponsCount={availableCouponsList.length}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Search Field */}
            <div className="bg-white px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
              <CouponSearchField />
            </div>

            {/* Coupon List with Pull-to-Refresh */}
            <div className="flex-1 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="pb-6 px-4 sm:px-6 lg:px-8"
              >
                <CouponList
                  coupons={availableCouponsList}
                  selectedCouponResponse={selectedCouponResponse}
                  onRefresh={handleRefresh}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Coupons Page Component
 * Wraps content with CouponProvider (matches Flutter BlocProvider pattern)
 */
const CouponsPage = () => {
  const location = useLocation();
  const selectedCouponResponse = location.state?.selectedCouponResponse || null;

  console.log('🎫 CouponsPage: Initializing with selectedCouponResponse:', selectedCouponResponse);

  return (
    <CouponProvider selectedCouponResponse={selectedCouponResponse}>
      <CouponsPageContent />
    </CouponProvider>
  );
};

export default CouponsPage;
