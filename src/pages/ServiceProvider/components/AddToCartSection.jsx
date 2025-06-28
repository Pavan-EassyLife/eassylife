/**
 * AddToCartSection - Fixed bottom section with add to cart functionality
 * 
 * Implements exact Flutter bottom button section:
 * - Fixed bottom container with elevation
 * - Add to cart button (orange, enabled only when provider selected)
 * - Explore other services button (when no providers available)
 * - Loading state during add to cart
 * 
 * Flutter Reference: 
 * - flutterapp/lib/modules/ServiceProvider/view/select_service_provider.dart (buttonWidgetBuilder)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceProvider, ServiceProviderStatus } from '../../../contexts/ServiceProviderContext';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

/**
 * AddToCartSection Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.hasProviders - Whether providers are available
 * @param {Object} props.selectedProvider - Currently selected provider
 * @param {Object} props.bookingData - Booking information
 * @param {Function} props.onExploreOtherServices - Handler for explore other services
 */
const AddToCartSection = ({ 
  hasProviders, 
  selectedProvider, 
  bookingData,
  onExploreOtherServices 
}) => {
  const navigate = useNavigate();
  const { addToCart, status } = useServiceProvider();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isButtonLoading = status === ServiceProviderStatus.BUTTON_LOADING || isAddingToCart;

  /**
   * Handle add to cart button click
   */
  const handleAddToCart = async () => {
    if (!selectedProvider || !bookingData) {
      console.error('❌ Missing required data for add to cart');
      return;
    }

    try {
      setIsAddingToCart(true);

      // Prepare add to cart parameters exactly like Flutter
      const addToCartParams = {
        rateCardId: selectedProvider.id.toString(),
        providerId: selectedProvider.providerId.toString(),
        serviceType: bookingData.categoryId === '' ? 'service' : 'subservice',
        addressId: bookingData.addressValue?.id?.toString() || '',
        bookingDate: bookingData.date,
        bookingTimeFrom: bookingData.timeFrom,
        bookingTimeTo: bookingData.timeTo,
        campaignName: '' // Empty campaign name like Flutter
      };

      console.log('🛒 Adding to cart with params:', addToCartParams);

      const result = await addToCart(addToCartParams);

      if (result.success) {
        // Navigate to cart page like Flutter
        navigate('/cart');
      } else {
        console.error('❌ Add to cart failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  /**
   * Handle explore other services
   */
  const handleExploreOtherServices = () => {
    if (onExploreOtherServices) {
      onExploreOtherServices();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Flutter: Material with elevation and shadow */}
      <div className="bg-white shadow-2xl rounded-t-3xl border-t border-gray-100">
        <div className="px-4 py-5">
          {!hasProviders ? (
            /* No Providers - Explore Other Services Button */
            <button
              onClick={handleExploreOtherServices}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
            >
              Explore Other Service
            </button>
          ) : (
            /* Add to Cart Button */
            <button
              onClick={handleAddToCart}
              disabled={!selectedProvider || isButtonLoading}
              className={`
                w-full py-4 font-semibold text-lg rounded-lg transition-all duration-200
                ${selectedProvider && !isButtonLoading
                  ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isButtonLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Adding to Cart...</span>
                </div>
              ) : (
                'Add to Cart'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToCartSection;
