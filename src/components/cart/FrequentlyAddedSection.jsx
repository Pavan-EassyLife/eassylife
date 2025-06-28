import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

/**
 * Frequently Added Section Component
 * Matches Flutter frequentlyAddedListBuilder implementation
 * Shows horizontal scrollable list of frequently added services
 */
const FrequentlyAddedSection = ({ cartState }) => {
  const navigate = useNavigate();
  const { updateCartState } = useCart();
  const [frequentServiceLoading, setFrequentServiceLoading] = useState({});

  const { frequentlyAddedServices } = cartState;

  // Debug logging for frequently added services data
  React.useEffect(() => {
    if (frequentlyAddedServices && frequentlyAddedServices.length > 0) {
      console.log('🔄 FrequentlyAddedSection: Services data:', frequentlyAddedServices);
      console.log('🔄 FrequentlyAddedSection: First service structure:', frequentlyAddedServices[0]);
    }
  }, [frequentlyAddedServices]);

  // Handle adding frequent service to cart (matches Flutter onTap navigation)
  const handleAddFrequentService = async (serviceItem) => {
    try {
      // Set loading state for specific service
      setFrequentServiceLoading(prev => ({
        ...prev,
        [serviceItem.id]: true
      }));

      // Check if service has subcategories (matches Flutter logic)
      if (!serviceItem.subcategories || serviceItem.subcategories.length === 0) {
        // Navigate to service details (direct service)
        navigate(`/service-details/${serviceItem.id}`, {
          state: {
            servicesId: serviceItem.id.toString(),
            subServicesId: '',
            categoryIdValue: serviceItem.id.toString(),
            subCategoryIdValue: '',
            returnTo: '/cart'
          }
        });
      } else {
        // Navigate to service selection (has subcategories)
        navigate(`/select-service/${serviceItem.id}`, {
          state: {
            serviceId: serviceItem.id.toString(),
            returnTo: '/cart'
          }
        });
      }

      // Analytics tracking (matches Flutter analytics)
      // analytics.track('frequent_service_selected', {
      //   service_id: serviceItem.id,
      //   service_name: serviceItem.name,
      //   has_subcategories: serviceItem.subcategories?.length > 0
      // });
    } catch (error) {
      console.error('Failed to navigate to service:', error);
    } finally {
      setFrequentServiceLoading(prev => ({
        ...prev,
        [serviceItem.id]: false
      }));
    }
  };

  // Don't render if no frequently added services
  if (!frequentlyAddedServices || frequentlyAddedServices.length === 0) {
    console.log('🔄 FrequentlyAddedSection: No services data available');
    return null;
  }

  return (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section Title (matches Flutter padding: EdgeInsets.only(left: 20.w, top: 10.h)) */}
      <div className="pl-5 pt-2.5 mb-5">
        <h3 className="text-base font-bold text-gray-900">
          Frequently Added Together
        </h3>
      </div>

      {/* Horizontal Scrollable List (matches Flutter SizedBox height: 130.h) */}
      <div className="h-[130px] w-full">
        <div className="flex space-x-2 px-5 py-2.5 overflow-x-auto modern-scrollbar">
          {/* Modern scrollbar styling (matches Flutter BouncingScrollPhysics) */}
          <style jsx>{`
            .modern-scrollbar {
              /* Hide default scrollbar */
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE and Edge */

              /* Smooth scrolling behavior */
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;

              /* Custom scrollbar for webkit browsers */
              &::-webkit-scrollbar {
                height: 4px;
                width: 4px;
              }

              &::-webkit-scrollbar-track {
                background: transparent;
                border-radius: 100px;
              }

              &::-webkit-scrollbar-thumb {
                background: rgba(251, 146, 60, 0.3); /* Orange with opacity */
                border-radius: 100px;
                transition: all 0.3s ease;
              }

              &::-webkit-scrollbar-thumb:hover {
                background: rgba(251, 146, 60, 0.6); /* Darker orange on hover */
              }

              /* Show scrollbar only on hover/scroll */
              &::-webkit-scrollbar-thumb {
                background: transparent;
              }

              &:hover::-webkit-scrollbar-thumb,
              &:active::-webkit-scrollbar-thumb {
                background: rgba(251, 146, 60, 0.4);
              }
            }

            @media (max-width: 767px) {
              .modern-scrollbar {
                /* Enhanced mobile scrolling */
                -webkit-overflow-scrolling: touch;
                scroll-snap-type: x proximity;

                /* Hide scrollbar completely on mobile */
                &::-webkit-scrollbar {
                  display: none;
                }
              }
            }
          `}</style>
          {frequentlyAddedServices.map((serviceItem, index) => {
            const isLoading = frequentServiceLoading[serviceItem.id] || false;

            return (
              <motion.div
                key={serviceItem.id}
                className="flex-shrink-0 w-[90px] max-md:w-[85px] scroll-snap-align-start" // matches Flutter width: 90.w, scroll snap for mobile
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => handleAddFrequentService(serviceItem)}
                  disabled={isLoading}
                  className="w-full h-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Service Card Container (matches Flutter commonServiceCardWidgetBuilder) */}
                  <div className="w-full h-full bg-gray-100 rounded-xl pt-5 px-1.5 pb-2 flex flex-col items-center justify-between">
                    {isLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
                      </div>
                    ) : (
                      <>
                        {/* Image Container (matches Flutter SizedBox height: 50.h) */}
                        <div className="h-[50px] w-full flex items-center justify-center mb-1.5">
                          {/* FIX: Use correct field mapping - Flutter uses 'image' field, not 'imageUrl' */}
                          {(serviceItem.imageUrl || serviceItem.image) ? (
                            <img
                              src={serviceItem.imageUrl || serviceItem.image}
                              alt={serviceItem.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                // Show placeholder on image error
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {/* Placeholder with first letter and orange background */}
                          <div
                            className={`w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center ${(serviceItem.imageUrl || serviceItem.image) ? 'hidden' : 'flex'}`}
                            style={{ display: (serviceItem.imageUrl || serviceItem.image) ? 'none' : 'flex' }}
                          >
                            <span className="text-orange-600 text-sm font-bold">
                              {(serviceItem.name || 'S').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Service Name (matches Flutter AppText.medium12 with maxline: 2) */}
                        <p className="text-xs text-gray-900 font-medium leading-tight text-center line-clamp-2 px-1">
                          {serviceItem.name}
                        </p>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Spacing (matches Flutter SizedBox(height: 30.h)) */}
      <div className="h-7" />
    </motion.div>
  );
};

export default FrequentlyAddedSection;
