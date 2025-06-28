import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServiceDetails, useBookingState } from '../../hooks/useServiceDetails';
import { useDynamicAttributes } from '../../hooks/useDynamicAttributes';
import { useServiceDetailsContext } from '../../contexts/ServiceDetailsContext';
import { useAddressContext } from '../../contexts/AddressContext';
import DynamicAttributeSelector from '../../components/serviceDetails/DynamicAttributeSelector';
import AttributeErrorBoundary from '../../components/serviceDetails/AttributeErrorBoundary';
import AttributeValidationFeedback from '../../components/serviceDetails/AttributeValidationFeedback';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart
} from 'lucide-react';

/**
 * ServiceDetailsContent - Flutter-exact UI implementation
 */
const ServiceDetailsContent = () => {
  const { serviceId, subServiceId } = useParams();
  const navigate = useNavigate();

  const serviceName = new URLSearchParams(window.location.search).get('serviceName');
  const subServiceName = new URLSearchParams(window.location.search).get('subServiceName');

  const {
    serviceDetails = null,
    isLoading = false,
    error = null,
    fetchServiceDetails
  } = useServiceDetails() || {};

  // Get selected segment from context
  const { selectedSegment } = useServiceDetailsContext();

  // Get primary address from context (matches Flutter constant.savedFinalAddress)
  const { primaryAddress } = useAddressContext();

  // Use dynamic attributes hook for enhanced attribute management
  const {
    selectedAttributes,
    requiredAttributes,
    handleAttributeSelect,
    areRequiredAttributesSelected,
    getValidationErrors,
    getMissingRequiredAttributes,
    isReadyForBooking
  } = useDynamicAttributes(serviceDetails);

  // Get user's selected booking date and time
  const {
    selectedDate,
    timeFromValue,
    timeToValue
  } = useBookingState();

  useEffect(() => {
    if (serviceId && fetchServiceDetails) {
      fetchServiceDetails(serviceId, {
        subServiceId,
        showSubcategories: false
      });
    }
  }, [serviceId, subServiceId, fetchServiceDetails]);

  const handleBack = () => {
    navigate(-1);
  };

  // Handle continue button click - navigate to service provider page
  // Matches Flutter SelectServiceProviderScreen navigation
  const handleContinue = () => {
    if (!areRequiredAttributesSelected()) {
      console.log('❌ ServiceDetails: Required attributes not selected');
      return;
    }

    console.log('🔧 ServiceDetails: Navigating to service provider page...');
    console.log('🔧 ServiceDetails: URL Params:', { serviceId, subServiceId });
    console.log('🏠 ServiceDetails: Primary address:', primaryAddress);

    // Build navigation data matching Flutter SelectServiceProviderScreen parameters
    const navigationData = {
      // Required Flutter parameters - Fix category/subcategory ID mapping
      catIdValue: serviceDetails?.category_id || '', // Use actual category ID from service details API response
      subCatIdValue: serviceId || '', // Use serviceId as subcategory ID (not as fallback for both)
      filterList: Object.entries(selectedAttributes)
        .filter(([attributeGroupKey, selection]) => {
          // Only include primary attributes, exclude nested options and segments
          if (attributeGroupKey === "No.of Service" || attributeGroupKey === "serviceSegments" || attributeGroupKey === "Super Saver Deal") {
            return false;
          }

          const optionId = selection?.id || selection;
          return attributeGroupKey && optionId && optionId !== '' && optionId !== 'NA';
        })
        .map(([attributeGroupKey, selection]) => {
          // Find the real attribute ID from the service details attributes
          const attributeGroup = serviceDetails?.attributes?.[attributeGroupKey];
          let realAttributeId = null;

          // Try multiple ways to find the attribute ID
          if (attributeGroup?.list && attributeGroup.list.length > 0) {
            realAttributeId = attributeGroup.list[0]?.id;
          } else if (attributeGroup?.dropdown && attributeGroup.dropdown.length > 0) {
            realAttributeId = attributeGroup.dropdown[0]?.id;
          } else if (attributeGroup?.search && attributeGroup.search.length > 0) {
            realAttributeId = attributeGroup.search[0]?.id;
          }

          // FIXED: Get the actual selected option ID, not the attribute ID
          // From the structure verification: selection contains attribute data, we need the option data
          let optionId = selection?.id || selection;

          // Check if selection has options and get the first selected option ID
          if (selection?.options && typeof selection.options === 'object') {
            // Look for the first option in any of the option groups
            for (const [optionGroupKey, optionArray] of Object.entries(selection.options)) {
              if (Array.isArray(optionArray) && optionArray.length > 0) {
                optionId = optionArray[0]?.id; // Get the first option's ID
                console.log('🔧 Found option ID from selection.options:', {
                  optionGroupKey,
                  optionId,
                  optionData: optionArray[0]
                });
                break;
              }
            }
          }

          // Fallback: If still no option ID found, check selectedAttributes for nested option data
          if (!optionId || optionId === realAttributeId) {
            // Look for "No.of Service" selection which should contain the actual option
            const noOfServiceSelection = selectedAttributes["No.of Service"];
            if (noOfServiceSelection?.id) {
              optionId = noOfServiceSelection.id;
              console.log('🔧 Using No.of Service option ID as fallback:', optionId);
            }
          }

          console.log('🚨 SELECTION OBJECT ANALYSIS:', {
            attributeGroupKey,
            selection,
            selectionType: typeof selection,
            selectionKeys: selection ? Object.keys(selection) : null,
            selectionId: selection?.id,
            selectionValue: selection?.value,
            selectionData: selection?.data,
            selectionTimestamp: selection?.timestamp,

            // What we're extracting
            extractedOptionId: optionId,
            expectedOptionId: "1c46d620f40d73e9c99926f70db01575",
            extractionIsCorrect: optionId === "1c46d620f40d73e9c99926f70db01575"
          });

          // VERIFICATION: Log the actual structure to understand what we're working with
          console.log('🔍 ACTUAL STRUCTURE VERIFICATION:', {
            attributeGroupKey,
            selection,
            selectionStructure: selection ? Object.keys(selection) : null,

            attributeGroup,
            attributeGroupStructure: attributeGroup ? Object.keys(attributeGroup) : null,

            firstListItem: attributeGroup?.list?.[0],
            firstListItemStructure: attributeGroup?.list?.[0] ? Object.keys(attributeGroup.list[0]) : null,

            serviceDetailsAttributes: serviceDetails?.attributes,
            serviceDetailsAttributesType: typeof serviceDetails?.attributes,
            serviceDetailsAttributesKeys: serviceDetails?.attributes ? Object.keys(serviceDetails.attributes) : null,

            currentMapping: {
              realAttributeId,
              optionId,
              bothSame: realAttributeId === optionId,
              isFixed: realAttributeId !== optionId
            },

            expectedFlutterMapping: {
              attribute_id: "2d136416f73de4fa0ff21620cf918167", // Should be attribute ID
              option_id: "1c46d620f40d73e9c99926f70db01575"   // Should be option ID (split AC)
            }
          });

          console.log('🔧 ServiceDetails: Processing attribute for navigation:', {
            attributeGroupKey,
            attributeGroup,
            realAttributeId,
            selection,
            extractedOptionId: optionId,

            // Debug: Check if attribute_id and option_id are the same
            attributeIdEqualsOptionId: realAttributeId === optionId,

            // Debug: Show the attribute structure
            attributeGroupStructure: {
              hasList: !!attributeGroup?.list,
              hasDropdown: !!attributeGroup?.dropdown,
              hasSearch: !!attributeGroup?.search,
              listLength: attributeGroup?.list?.length || 0,
              dropdownLength: attributeGroup?.dropdown?.length || 0,
              searchLength: attributeGroup?.search?.length || 0,
              firstListItem: attributeGroup?.list?.[0],
              firstListItemId: attributeGroup?.list?.[0]?.id
            },

            // Debug: Show what should be the correct option ID
            expectedOptionId: "1c46d620f40d73e9c99926f70db01575",
            optionIdMatches: optionId === "1c46d620f40d73e9c99926f70db01575"
          });

          // Validation: Don't send if we couldn't find a proper attribute ID
          if (!realAttributeId) {
            console.warn('⚠️ ServiceDetails: Could not find real attribute ID for:', attributeGroupKey);
            console.warn('⚠️ ServiceDetails: Using fallback - first list item ID as attribute ID');
            // FALLBACK: Use the first list item ID as attribute ID to prevent empty array
            realAttributeId = attributeGroup?.list?.[0]?.id || attributeGroup?.dropdown?.[0]?.id || attributeGroup?.search?.[0]?.id;

            if (!realAttributeId) {
              console.error('❌ ServiceDetails: No fallback attribute ID found, skipping this attribute');
              return null;
            }
          }

          return {
            attribute_id: realAttributeId,
            option_id: optionId,
            attribute_name: attributeGroupKey,
            option_name: selection?.value || selection?.name || ''
          };
        })
        .filter(Boolean), // Remove null entries
      serviceNameValue: serviceName || serviceDetails?.name || '',
      timeRequired: serviceDetails?.serviceTime || '',
      addressValue: primaryAddress, // Primary address from context (matches Flutter constant.savedFinalAddress)
      // Use user's selected booking values or Flutter-compatible defaults
      date: selectedDate ? selectedDate.toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timeFrom: timeFromValue || '10:00:00', // User selected or default
      timeTo: timeToValue || '11:00:00', // User selected or default
      catName: serviceName || serviceDetails?.name || '',
      subCatName: subServiceName || '',
      segmentId: selectedAttributes["serviceSegments"]?.id || selectedSegment?.id || '',

      // Additional navigation data
      serviceName: serviceName || serviceDetails?.name || '',
      subServiceName: subServiceName || ''
    };

    console.log('🔍 ServiceDetails: Segment analysis:', {
      selectedSegment,
      selectedSegmentFromContext: selectedSegment?.id,
      selectedSegmentFromAttributes: selectedAttributes["serviceSegments"]?.id,
      selectedAttributesServiceSegments: selectedAttributes["serviceSegments"],
      finalSegmentIdInNavigationData: navigationData.segmentId,
      segmentIdType: typeof navigationData.segmentId,
      isSegmentIdEmpty: !navigationData.segmentId,

      // Debug: Segment selection analysis
      segmentSelectionSource: selectedAttributes["serviceSegments"]?.id ? "attributes" : "context",

      // Check all available segments in service details
      availableSegments: serviceDetails?.attributes ?
        Object.values(serviceDetails.attributes).flatMap(attr =>
          attr?.list?.flatMap(item => item?.serviceSegments || []) || []
        ) : []
    });

    console.log('🔧 ServiceDetails: Navigation data:', navigationData);

    // Compare React vs Flutter URL parameters
    console.log('🔍 ServiceDetails: React vs Flutter comparison:', {
      react: {
        categoryId: navigationData.catIdValue,
        subcategoryId: navigationData.subCatIdValue,
        segmentId: navigationData.segmentId,
        attributes: navigationData.filterList
      },
      correctImplementation: {
        categoryId: "561c01d348b6d760413d99e9f6733ed6",
        subcategoryId: "1bdfe916ddd7e7556863948ae35a8326",
        segmentId: "Should be actual selected segment ID",
        attributes: "Should be real attribute selections"
      },
      reactMatches: {
        categoryId: navigationData.catIdValue === "561c01d348b6d760413d99e9f6733ed6",
        subcategoryId: navigationData.subCatIdValue === "1bdfe916ddd7e7556863948ae35a8326"
      }
    });

    // Debug: Log the complete service details attributes structure
    console.log('🔍 ServiceDetails: Complete attributes structure:', {
      serviceDetailsAttributes: serviceDetails?.attributes,
      selectedAttributes,
      attributeKeys: Object.keys(serviceDetails?.attributes || {}),
      selectedAttributeKeys: Object.keys(selectedAttributes || {}),

      // Analyze React's attribute structure
      reactAttributeStructure: {
        totalAttributes: Object.keys(serviceDetails?.attributes || {}).length,
        attributeTypes: Object.keys(serviceDetails?.attributes || {}),
        hasSegments: Object.values(serviceDetails?.attributes || {}).some(attr =>
          attr?.list?.some(item => item?.serviceSegments?.length > 0)
        )
      }
    });

    // Navigate to service provider page (Flutter-style: no URL parameters)
    // Route: /service-providers (all data passed via state)
    navigate('/service-providers', {
      state: navigationData
    });
  };

  const getServiceImage = () => {
    if (serviceDetails?.image) return serviceDetails.image;
    if (serviceDetails?.icon) return serviceDetails.icon;
    return null;
  };

  const getServiceName = () => {
    return serviceDetails?.name || subServiceName || serviceName || 'Service';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Service</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchServiceDetails && fetchServiceDetails(serviceId, { subServiceId })}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (import.meta.env.DEV) {
    console.log('🔧 ServiceDetails Hook State:', {
      serviceDetails,
      isLoading,
      error,
      selectedAttributes,
      serviceId,
      subServiceId
    });

    if (serviceDetails) {
      console.log('🔧 ServiceDetails API Response:', {
        name: serviceDetails.name,
        image: serviceDetails.image,
        icon: serviceDetails.icon,
        attributes: serviceDetails.attributes,
        attributeKeys: Object.keys(serviceDetails.attributes || {}),
        hasAttributes: !!(serviceDetails.attributes && Object.keys(serviceDetails.attributes).length > 0)
      });

      // Log detailed attribute structure for dynamic rendering validation
      if (serviceDetails.attributes) {
        Object.keys(serviceDetails.attributes).forEach(attributeName => {
          const attributeGroup = serviceDetails.attributes[attributeName];
          console.log(`🎯 Attribute "${attributeName}":`, {
            hasDropdown: !!(attributeGroup.dropdown && attributeGroup.dropdown.length > 0),
            hasList: !!(attributeGroup.list && attributeGroup.list.length > 0),
            hasSearch: !!(attributeGroup.search && attributeGroup.search.length > 0),
            dropdownCount: attributeGroup.dropdown?.length || 0,
            listCount: attributeGroup.list?.length || 0,
            searchCount: attributeGroup.search?.length || 0,
            structure: attributeGroup
          });
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-white pb-safe-bottom service-details-page">
      {/* Header and Image Section */}
      <div className="w-full" style={{ backgroundColor: '#F5E6D3' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start py-4">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <button onClick={handleBack}>
                <ArrowLeft className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>
        </div>

        {/* Service Image - Flutter Exact Dimensions */}
        <div className="w-full flex justify-center pb-6">
          {getServiceImage() ? (
            <img
              src={getServiceImage()}
              alt={getServiceName()}
              className="object-contain"
              style={{ width: '180px', height: '120px' }}
            />
          ) : (
            <div
              className="flex items-center justify-center bg-gray-200 rounded-lg"
              style={{ width: '180px', height: '120px' }}
            >
              <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Service</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="pb-40">
          <div className="px-4 sm:px-6 lg:px-8 pb-4 bg-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {getServiceName()}
              </h1>
              <Heart className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          {/* Dynamic Attributes with Error Boundary */}
          {serviceDetails?.attributes && Object.keys(serviceDetails.attributes).length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 bg-white py-4">
              <AttributeErrorBoundary>
                <DynamicAttributeSelector
                  attributes={serviceDetails.attributes}
                  selectedAttributes={selectedAttributes}
                  onAttributeSelect={handleAttributeSelect}
                  requiredAttributes={requiredAttributes}
                  showValidationErrors={true}
                  serviceDetails={serviceDetails}
                  className="mb-4"
                />
              </AttributeErrorBoundary>

              {/* Validation Feedback */}
              <AttributeValidationFeedback
                validationErrors={getValidationErrors()}
                missingRequiredAttributes={getMissingRequiredAttributes()}
                isReadyForBooking={isReadyForBooking}
                showSuccessMessage={false}
                className="mb-4"
              />
            </div>
          )}

          {/* About this Service Section */}
          {(serviceDetails?.includeItems?.length > 0 || serviceDetails?.excludeItems?.length > 0 || serviceDetails?.meta_description) && (
            <div className="px-4 sm:px-6 lg:px-8 bg-white py-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About this Service</h3>

              {/* Service Description */}
              {serviceDetails?.meta_description && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {serviceDetails.meta_description}
                  </p>
                </div>
              )}

              {/* Include Items */}
              {serviceDetails?.includeItems?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-green-700 mb-3">✓ What's Included</h4>
                  <div className="space-y-2">
                    {serviceDetails.includeItems.map((item, index) => (
                      <div key={index} className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">
                            {item.name || item.title || `Service Item ${index + 1}`}
                          </h5>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exclude Items */}
              {serviceDetails?.excludeItems?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-red-700 mb-3">✗ What's Not Included</h4>
                  <div className="space-y-2">
                    {serviceDetails.excludeItems.map((item, index) => (
                      <div key={index} className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">
                            {item.name || item.title || `Excluded Item ${index + 1}`}
                          </h5>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Address */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center flex-1">
                <MapPin className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-gray-700 text-sm flex-1">
                  Lodha , powai, Mahatma Jyotiba Phule Nagar IIT Market, Powai, Mumbai, Maharashtra, 400076
                </span>
              </div>
              <button className="text-blue-500 font-medium text-sm ml-3">
                Change
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="mb-5">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700 text-sm">
                    {selectedDate
                      ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} 🕐 ${timeFromValue || '10:00'} - ${timeToValue || '11:00'}`
                      : 'Thu, 26th Jun 2025 🕐 10:00 AM - 11:00 AM'
                    }
                  </span>
                </div>
                <button
                  className="text-blue-500 font-medium text-sm"
                  onClick={() => {
                    // TODO: Open date/time picker modal
                    console.log('🔧 Date/Time change clicked - implement date/time picker');
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Validation Summary for Continue Button */}
          {!areRequiredAttributesSelected() && (
            <div className="mb-3">
              <AttributeValidationFeedback
                validationErrors={getValidationErrors()}
                missingRequiredAttributes={getMissingRequiredAttributes()}
                isReadyForBooking={isReadyForBooking}
                showSuccessMessage={false}
                compact={true}
              />
            </div>
          )}

          {/* Continue Button */}
          <div className="pb-20 md:pb-4">
            <button
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                areRequiredAttributesSelected()
                  ? 'text-white hover:shadow-lg transform hover:scale-[1.02]'
                  : 'text-gray-500 bg-gray-300 cursor-not-allowed'
              }`}
              style={areRequiredAttributesSelected() ? { backgroundColor: '#F59E0B' } : {}}
              disabled={!areRequiredAttributesSelected()}
              onClick={handleContinue}
              title={!areRequiredAttributesSelected() ? 'Please complete all required selections' : 'Continue to service providers'}
            >
              {areRequiredAttributesSelected() ? 'Continue' : 'Complete Required Selections'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsContent;
