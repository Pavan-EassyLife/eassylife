import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceProvider } from '../../contexts/ServiceProviderContext';
import { ServiceProviderStatus } from '../../types/serviceProvider';
import HeaderBanner from '../../components/ServiceProvider/HeaderBanner';
import ServiceNameSection from '../../components/ServiceProvider/ServiceNameSection';
import ProviderList from '../../components/ServiceProvider/ProviderList';
import BottomButtonSection from '../../components/ServiceProvider/BottomButtonSection';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

/**
 * ServiceProviderContent - Main content component for service provider page
 * Handles data fetching, state management, and responsive layout
 * 
 * Flutter Reference:
 * - flutterapp/lib/modules/ServiceProvider/view/select_service_provider.dart (bodyBuilder method)
 */
const ServiceProviderContent = ({ navigationData, layoutMode }) => {
  const navigate = useNavigate();
  const {
    servicesProvider,
    selectedServicesProvider,
    status,
    errorMessage,
    isLoading,
    isButtonLoading,
    isAddToCartConfirmed,
    hasError,
    hasProviders,
    fetchServiceProviderData,
    addToCartButton,
    resetState
  } = useServiceProvider();

  // Fetch service provider data on component mount
  useEffect(() => {
    console.log('🔧 ServiceProviderContent: Fetching service provider data...');
    
    // Build parameters matching Flutter FetchServiceProviderDataEvent
    const params = {
      catId: navigationData.catIdValue,
      subCatId: navigationData.subCatIdValue,
      attributeList: navigationData.filterList,
      segmentId: navigationData.segmentId,
      page: '1',
      size: '10',
      // Add booking parameters to match Flutter backend logs
      bookingDate: navigationData.date,
      bookingTimeFrom: navigationData.timeFrom,
      bookingTimeTo: navigationData.timeTo
    };

    console.log('🔍 ServiceProviderContent: Navigation data analysis:', {
      navigationData,
      segmentId: navigationData.segmentId,
      segmentIdType: typeof navigationData.segmentId,
      segmentIdLength: navigationData.segmentId?.length,
      isSegmentIdEmpty: !navigationData.segmentId,
      bookingParams: {
        date: navigationData.date,
        timeFrom: navigationData.timeFrom,
        timeTo: navigationData.timeTo
      },
      params
    });

    fetchServiceProviderData(params);

    // Cleanup on unmount
    return () => {
      resetState();
    };
  }, [navigationData, fetchServiceProviderData, resetState]);

  // Handle add to cart confirmed state (navigate to cart)
  useEffect(() => {
    if (isAddToCartConfirmed) {
      console.log('🛒 ServiceProviderContent: Add to cart confirmed, navigating to cart...');
      // Navigate to cart page (matches Flutter navigation)
      navigate('/cart');
    }
  }, [isAddToCartConfirmed, navigate]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    console.log('🔙 ServiceProviderContent: Navigating back...');
    navigate(-1);
  }, [navigate]);



  // Handle add to cart button click
  const handleAddToCart = useCallback(async () => {
    console.log('🛒 ServiceProviderContent: Add to cart button clicked...');

    if (!selectedServicesProvider) {
      console.error('❌ ServiceProviderContent: No provider selected');
      return;
    }

    // Build parameters matching Flutter AddToCartButtonEvent
    const params = {
      rateCardId: selectedServicesProvider.id.toString(),
      providerId: selectedServicesProvider.providerId.toString(),
      type: navigationData.catIdValue === '' ? 'service' : 'subservice',
      addressId: navigationData.addressValue?.id?.toString() || '',
      bookingDate: navigationData.date,
      bookingTimeFrom: navigationData.timeFrom,
      bookingTimeTo: navigationData.timeTo,
      campaignName: '' // Optional campaign name
    };

    await addToCartButton(params);
  }, [selectedServicesProvider, navigationData, addToCartButton]);

  // Show loading state (matches Flutter initial/loading states)
  // Only show loading when actually loading, not when status is initial with data
  if (isLoading || (status === ServiceProviderStatus.INITIAL && !hasProviders)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="large" color="orange" />
      </div>
    );
  }

  // Show error state (matches Flutter failure state)
  if (hasError && errorMessage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <ErrorMessage
          message={errorMessage}
        />
      </div>
    );
  }

  // Main content layout (matches Flutter bodyBuilder structure)
  const contentClasses = layoutMode === 'mobile' 
    ? 'min-h-screen bg-white service-provider-mobile-spacing'
    : 'min-h-screen bg-white';

  return (
    <div className={contentClasses}>
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Pull to Refresh Container (mobile only) */}
        <div className="h-full overflow-y-auto">
          {/* Header Banner Section */}
          <HeaderBanner 
            onBack={handleBack}
            layoutMode={layoutMode}
          />

          {/* Service Name and Rating Section */}
          <ServiceNameSection 
            serviceName={navigationData.serviceNameValue}
            timeRequired={navigationData.timeRequired}
            layoutMode={layoutMode}
          />

          {/* Provider List Section */}
          <ProviderList
            providers={servicesProvider}
            selectedProvider={selectedServicesProvider}
            hasProviders={hasProviders}
            layoutMode={layoutMode}
          />

          {/* Bottom spacing for mobile fixed button */}
          {layoutMode === 'mobile' && (
            <div className="h-24"></div>
          )}
        </div>
      </div>

      {/* Bottom Button Section */}
      <BottomButtonSection 
        hasProviders={hasProviders}
        selectedProvider={selectedServicesProvider}
        isButtonLoading={isButtonLoading}
        onAddToCart={handleAddToCart}
        onExploreOther={() => navigate('/home')}
        layoutMode={layoutMode}
      />
    </div>
  );
};

export default ServiceProviderContent;
