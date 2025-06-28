import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Star, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import cartService from '../../api/services/cartService';
import { formatCurrency } from '../../utils/paymentCalculations';
import { formatDateTime } from '../../utils/dateUtils';
import DateTimeEditModal from './DateTimeEditModal';

/**
 * Selected Services Section Component
 * Matches Flutter selectedServicesListBuilder implementation
 * Shows selected services and packages with edit/delete functionality
 */
const SelectedServicesSection = ({ cartState }) => {
  const { refreshCartData, setCartStatus } = useCart();
  const [selectedService, setSelectedService] = useState(null);
  const [isServiceOptionsOpen, setIsServiceOptionsOpen] = useState(false);
  const [serviceLoadingStates, setServiceLoadingStates] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { cartData, status, couponData } = cartState;

  // Extract services and packages from cart data
  const serviceList = cartData?.groupedCart?.categories || [];
  const packageList = cartData?.groupedCart?.packages || [];
  const freeService = couponData?.isFree ? couponData : null;

  // Handle service options menu (matches Flutter delete confirmation dialog)
  const handleServiceOptions = (service, index) => {
    setSelectedService({ ...service, index });
    setIsDeleteModalOpen(true);
  };

  // Handle service removal (matches Flutter DeleteCartItemEvent exactly)
  const handleRemoveService = async (service, index) => {
    try {
      console.log('🗑️ Removing service:', service.id, 'at index:', index);

      // Set loading state for specific service (matches Flutter deleteLoading with index)
      setServiceLoadingStates(prev => ({
        ...prev,
        [service.id]: true
      }));
      setCartStatus('deleteLoading');

      // Call delete API (matches Flutter apiValue.deleteCartItem)
      const response = await cartService.removeFromCart(service.id);

      if (response.success) {
        console.log('✅ Service removed successfully');

        // Refresh cart data (matches Flutter RefreshCartDataEvent)
        await refreshCartData();

        // Close modal
        setIsDeleteModalOpen(false);
      } else {
        throw new Error(response.message || 'Failed to remove service');
      }

    } catch (error) {
      console.error('❌ Failed to remove service:', error);
      // TODO: Show error toast
    } finally {
      // Reset loading state
      setServiceLoadingStates(prev => ({
        ...prev,
        [service.id]: false
      }));
      setCartStatus('success');
    }
  };

  // Handle edit service (matches Flutter DateAndTimeBottomSheet)
  const handleEditService = (service, index) => {
    setSelectedService({ ...service, index });
    setIsEditModalOpen(true);
  };

  // Calculate discount percentage (matches Flutter getDiscountPercentageFunction)
  const getDiscountPercentage = (discountPrice, originalPrice) => {
    const discount = parseFloat(originalPrice) - parseFloat(discountPrice);
    const percentage = (discount / parseFloat(originalPrice)) * 100;
    return `${Math.round(percentage)}% OFF`;
  };

  // Format provider name (FIX: API uses first_name/last_name not firstName/lastName)
  const formatProviderName = (provider) => {
    if (!provider) return '';
    return `${provider.first_name || ''} ${provider.last_name || ''}`.trim();
  };

  // Helper function to format date (matches Flutter formatDateValue)
  const formatDateValue = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to format time (matches Flutter formatTimeValue)
  const formatTimeValue = (timeString) => {
    if (!timeString) return '';
    try {
      // Handle both time formats
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };



  // Render service item (matches Flutter cartServicesItemBuilder exactly)
  const renderServiceItem = (service, index) => {
    // FIX: Correct API field mapping - use ratecard price fields
    const image = service.ratecard?.provider?.image || '';
    const name = service.ratecard?.subcategory?.name || service.ratecard?.category?.name || '';
    const providerName = `${service.ratecard?.provider?.first_name || ''} ${service.ratecard?.provider?.last_name || ''}`.trim();
    const totalPrice = formatCurrency(service.ratecard?.price || '0');
    const discountPrice = formatCurrency(service.ratecard?.strike_price || '0');
    const isLoading = serviceLoadingStates[service.id] || false;

    // Calculate discount percentage (matches Flutter logic)
    const totalPriceNum = parseFloat(totalPrice);
    const discountPriceNum = parseFloat(discountPrice);
    const discountPercentage = discountPriceNum > 0 && totalPriceNum > 0
      ? Math.round(((discountPriceNum - totalPriceNum) / discountPriceNum) * 100)
      : 0;

    return (
      <motion.div
        key={service.id}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Main Content Row - Exact Flutter Layout */}
        <div className="flex items-start">
          {/* Provider Image - Exact Flutter size: 89x89 */}
          <div className="w-[89px] h-[89px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {image ? (
              <img
                src={image}
                alt={providerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Show placeholder on image error
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Placeholder with first letter and orange background (matches Flutter pattern) */}
            <div
              className={`w-full h-full bg-orange-100 flex items-center justify-center ${image ? 'hidden' : 'flex'}`}
              style={{ display: image ? 'none' : 'flex' }}
            >
              <span className="text-orange-600 text-2xl font-bold">
                {(providerName || name || 'S').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* 16px spacing - matches Flutter SizedBox(width: 16.w) */}
          <div className="w-4"></div>

          {/* Service Details Column */}
          <div className="flex-1 min-w-0">
            {/* Provider Name - Bold 16px (matches AppText.bold16) */}
            <h3 className="text-base font-bold text-gray-900 mb-0.5">
              {providerName || 'Service Provider'}
            </h3>

            {/* Category Name - Regular 12px Dark Grey (matches AppText.regular12) */}
            <p className="text-xs text-gray-700 mb-1.5">
              {name}
            </p>

            {/* Price Row */}
            <div className="flex items-center space-x-2">
              {/* Main Price - Bold 14px (matches AppText.bold14) */}
              <span className="text-sm font-bold text-gray-900">
                {totalPrice}
              </span>

              {/* Strikethrough Price */}
              {discountPrice > 0 && discountPrice !== totalPrice && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    {discountPrice}
                  </span>

                  {/* Discount Badge - matches Flutter green container */}
                  {discountPercentage > 0 && (
                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {Math.abs(discountPercentage)}% OFF
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Delete Button - Top Right (matches Flutter deleteForever icon 25x25) */}
          <div className="flex-shrink-0 ml-4">
            {isLoading ? (
              <div className="w-[25px] h-[25px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : (
              <motion.button
                onClick={() => handleServiceOptions(service, index)}
                className="w-[25px] h-[25px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Delete Forever Icon - matches Flutter appAssets.deleteForever */}
                <svg className="w-[18px] h-[18px] text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        {/* Divider - matches Flutter Container(height: 1.h, color: AppColor.grey) */}
        <div className="h-px w-full bg-gray-300 my-5"></div>

        {/* Date/Time Row - Bottom Section (matches Flutter single row layout) */}
        <div className="flex items-center justify-between">
          {/* Left side - Date and Time in single row (matches Flutter Row layout) */}
          <div className="flex items-center">
            {/* Date with Calendar Icon (matches Flutter calendarMonth 18x18) */}
            <div className="flex items-center">
              {/* Calendar Month Icon - matches Flutter appAssets.calendarMonth */}
              <div className="w-[16px] h-[16px] flex items-center justify-center">
                <svg className="w-[16px] h-[16px] text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-900 ml-[5px]">
                {formatDateValue(service.booking_date)}
              </span>
            </div>

            {/* Spacing between date and time (matches Flutter SizedBox(width: 12.w)) */}
            <div className="w-3"></div>

            {/* Time with Alarm Icon (matches Flutter alarm 18x18) */}
            <div className="flex items-center">
              {/* Alarm Icon - matches Flutter appAssets.alarm */}
              <div className="w-[16px] h-[16px] flex items-center justify-center">
                <svg className="w-[16px] h-[16px] text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-900 ml-[5px]">
                {service.booking_time_from && service.booking_time_to
                  ? `${formatTimeValue(service.booking_time_from)} - ${formatTimeValue(service.booking_time_to)}`
                  : 'Time not set'
                }
              </span>
            </div>
          </div>

          {/* Right side - Edit Button (matches Flutter Icons.edit_outlined, size: 16) */}
          <motion.button
            onClick={() => handleEditService(service, index)}
            className="px-[8px] py-1 hover:bg-gray-100 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Edit Outlined Icon - matches Flutter Icons.edit_outlined */}
            <svg className="w-[16px] h-[16px] text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render free service item (matches Flutter cartFreeServicesItemBuilder)
  const renderFreeServiceItem = () => {
    if (!freeService) return null;

    const image = freeService.rateCardDetails?.subcategory?.image || 
                 freeService.rateCardDetails?.category?.image || '';
    const name = freeService.rateCardDetails?.subcategory?.name || 
                freeService.rateCardDetails?.category?.name || '';
    const providerName = freeService.rateCardDetails?.name || '';
    const price = formatCurrency(freeService.rateCardDetails?.price || '0');

    return (
      <motion.div
        className="bg-white rounded-2xl p-4 shadow-sm border border-green-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-green-600">Free Service</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            FREE
          </span>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Show placeholder on image error
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Placeholder with first letter and orange background */}
            <div
              className={`w-full h-full bg-orange-100 rounded-lg flex items-center justify-center ${image ? 'hidden' : 'flex'}`}
              style={{ display: image ? 'none' : 'flex' }}
            >
              <span className="text-orange-600 text-lg font-bold">
                {(name || 'F').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{name}</h4>
            {providerName && (
              <p className="text-xs text-gray-500 mt-1">{providerName}</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-semibold text-green-600">FREE</span>
              <span className="text-xs text-gray-400 line-through">{price}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Don't render if no cart data
  if (!cartData) return null;

  return (
    <>
      <div className="mx-4 mt-4 space-y-4">
        {/* Selected Services */}
        {serviceList.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3 px-2">
              Selected Services
            </h3>
            <div className="space-y-3">
              {serviceList.map((service, index) => renderServiceItem(service, index))}
            </div>
          </div>
        )}

        {/* Free Service */}
        {freeService && (
          <div>
            {renderFreeServiceItem()}
          </div>
        )}

        {/* Selected Packages */}
        {packageList.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3 px-2">
              Selected Packages
            </h3>
            <div className="space-y-3">
              {packageList.map((packageItem, index) => (
                <motion.div
                  key={packageItem.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {packageItem.packageName}
                    </h4>
                    <motion.button
                      onClick={() => handleServiceOptions(packageItem, index)}
                      className="w-[25px] h-[25px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Delete Forever Icon - matches Flutter appAssets.deleteForever */}
                      <svg className="w-[18px] h-[18px] text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </motion.button>
                  </div>
                  
                  {/* Package Items */}
                  {packageItem.items && packageItem.items.length > 0 && (
                    <div className="space-y-2">
                      {packageItem.items.map((item, itemIndex) => (
                        <div key={item.id} className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>•</span>
                          <span>{item.ratecard?.subcategory?.name || item.ratecard?.category?.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (matches Flutter confirmation dialog) */}
      {isDeleteModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Service
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove "{selectedService.serviceName || selectedService.packageName}" from your cart?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveService(selectedService, selectedService.index)}
                disabled={serviceLoadingStates[selectedService.id]}
                className="flex-1 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {serviceLoadingStates[selectedService.id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Date/Time Edit Modal (matches Flutter DateAndTimeBottomSheet) */}
      <DateTimeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        service={selectedService}
        onSuccess={refreshCartData}
      />
    </>
  );
};

export default SelectedServicesSection;
