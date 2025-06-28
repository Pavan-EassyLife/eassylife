import { useCallback, useEffect } from 'react';
import { useServiceDetailsContext } from '../contexts/ServiceDetailsContext';
import serviceDetailsService from '../api/services/serviceDetailsService';

/**
 * useServiceDetails Hook - Replicates Flutter FetchServiceDetailDataEvent
 * 
 * Handles service details fetching logic matching Flutter ServiceDetailBloc:
 * - FetchServiceDetailDataEvent: Fetch main service or sub-service details
 * - Initialize default attribute selections
 * - Handle sub-service selection flow
 * - Error handling and loading states
 */
export const useServiceDetails = () => {
  const {
    serviceDetails,
    subServices,
    loading,
    error,
    hasSubcategories,
    showSubcategorySelection,
    selectedAttributes,
    selectedSegment,
    setLoading,
    setError,
    setServiceDetails,
    setServiceSegments,
    setSelectedSegment,
    updateSelectedAttributes,
    resetState
  } = useServiceDetailsContext();

  /**
   * Fetch service details - Replicates Flutter FetchServiceDetailDataEvent
   * Logic matches Flutter: Check serviceId -> getServiceDetails or getSubServicesDetail
   *
   * @param {string} serviceId - Service ID to fetch details for
   * @param {Object} options - Options object
   * @param {string} options.subServiceId - Optional sub-service ID
   * @param {boolean} options.showSubcategories - Whether to show sub-service selection
   * @param {string} options.categoryId - Category ID for context
   * @param {string} options.subCategoryId - Sub-category ID for context
   */
  const fetchServiceDetails = useCallback(async (serviceId, options = {}) => {
    if (!serviceId) {
      setError('serviceDetails', 'Service ID is required');
      return { success: false, error: 'Service ID is required' };
    }

    const {
      subServiceId = null,
      showSubcategories = false,
      categoryId = null,
      subCategoryId = null
    } = options;

    setLoading('serviceDetails', true);
    setError('serviceDetails', null);

    try {
      console.log('🔧 useServiceDetails: Fetching service details', { serviceId, subServiceId, showSubcategories, categoryId, subCategoryId });

      let result;
      
      // Flutter logic: Check if subServiceId exists -> getSubServicesDetail, else -> getServiceDetails
      if (subServiceId) {
        console.log('🔧 useServiceDetails: Fetching sub-service details');
        result = await serviceDetailsService.getSubServiceDetails(subServiceId);
      } else if (showSubcategories) {
        console.log('🔧 useServiceDetails: Fetching sub-services for selection');
        result = await serviceDetailsService.getSubServices(serviceId);
        
        if (result.success && result.data.length > 0) {
          // Handle sub-service selection flow (Flutter: SelectServiceScreen)
          return { 
            success: true, 
            data: result.data, 
            requiresSubServiceSelection: true 
          };
        }
      } else {
        console.log('🔧 useServiceDetails: Fetching main service details');
        try {
          result = await serviceDetailsService.getServiceDetails(serviceId);
        } catch (error) {
          // If service details fails with "Category not found", try sub-service details as fallback
          if (error.message?.includes('Category not found') || error.message?.includes('not found')) {
            console.log('🔄 useServiceDetails: Service details failed, trying sub-service details as fallback');
            try {
              result = await serviceDetailsService.getSubServiceDetails(serviceId);
            } catch (subError) {
              console.error('❌ useServiceDetails: Both service and sub-service details failed');
              throw error; // Throw original error
            }
          } else {
            throw error;
          }
        }
      }

      if (result.success && result.data) {
        // Validate and normalize data (Flutter: ServiceDetailsModel validation)
        const validatedData = serviceDetailsService.validateServiceDetailsResponse(result.data);
        setServiceDetails(validatedData);

        // Initialize default attribute selections (Flutter pattern)
        initializeDefaultAttributes(validatedData.attributes);

        // Fetch initial service segments (Flutter: FetchServiceAboutEvent)
        await fetchInitialServiceSegments(validatedData, serviceId);

        console.log('✅ useServiceDetails: Service details loaded successfully');
        return { success: true, data: validatedData };
      } else {
        const errorMessage = result.message || 'Failed to load service details';
        setError('serviceDetails', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('❌ useServiceDetails: Error fetching service details:', err);
      const errorMessage = err.message || 'Failed to load service details';
      setError('serviceDetails', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('serviceDetails', false);
    }
  }, [setLoading, setError, setServiceDetails]);

  /**
   * Initialize default attribute selections - DISABLED to match Flutter behavior
   * Flutter only sends user-selected attributes, not auto-selected defaults
   *
   * @param {Object} attributes - Attributes object from service details
   */
  const initializeDefaultAttributes = useCallback((attributes) => {
    if (!attributes || typeof attributes !== 'object') return;

    console.log('🔧 useServiceDetails: Skipping auto-selection to match Flutter behavior');
    console.log('🔧 useServiceDetails: Only user-selected attributes will be sent to API');

    // DISABLED: Auto-selection to match Flutter behavior
    // Flutter only sends attributes that user explicitly selects
    //
    // Object.keys(attributes).forEach(attributeId => {
    //   const attribute = attributes[attributeId];
    //   if (attribute.options && typeof attribute.options === 'object') {
    //     const sortedOptions = Object.values(attribute.options).sort((a, b) => (a.weight || 0) - (b.weight || 0));
    //     if (sortedOptions.length > 0) {
    //       const defaultOption = sortedOptions[0];
    //       updateSelectedAttributes(attributeId, defaultOption.id);
    //       console.log(`🔧 useServiceDetails: Default attribute selected - ${attributeId}: ${defaultOption.id}`);
    //     }
    //   }
    // });
  }, []);

  /**
   * Fetch initial service segments with default attributes
   * Replicates Flutter FetchServiceAboutEvent with initial parameters
   * 
   * @param {Object} serviceData - Service details data
   * @param {string} serviceId - Service ID
   */
  const fetchInitialServiceSegments = useCallback(async (serviceData, serviceId) => {
    try {
      console.log('🔧 useServiceDetails: Fetching initial service segments');

      // Build attribute filters from selected attributes (Flutter: selectedFilterList)
      const attributeFilters = Object.entries(selectedAttributes).map(([attributeId, optionId]) => ({
        attribute_id: attributeId,
        option_id: optionId === 'NA' ? '' : optionId
      }));

      const params = {
        category_id: serviceData.category_id || serviceId,
        subcategory_id: '', // Empty for main service (Flutter pattern)
        segment_id: '', // Empty for initial load (Flutter pattern)
        attribute: attributeFilters
      };

      const result = await serviceDetailsService.getServiceDetailsBySegment(params);
      if (result.success) {
        const segments = result.data || [];
        setServiceSegments(segments);

        // Auto-select first segment if available and none is selected (CORRECT implementation)
        if (segments.length > 0 && !selectedSegment) {
          console.log('🔍 useServiceDetails: Available segments for auto-selection:', {
            allSegments: segments,
            segmentIds: segments.map(s => s.id),
            segmentNames: segments.map(s => s.segment_name || s.segmentName)
          });

          // Select the first available segment (correct behavior)
          const segmentToSelect = segments[0];

          setSelectedSegment(segmentToSelect);
          console.log('🎯 useServiceDetails: Auto-selected first segment (CORRECT):', {
            selectedSegmentId: segmentToSelect?.id,
            selectedSegmentName: segmentToSelect?.segment_name || segmentToSelect?.segmentName,
            segmentData: segmentToSelect
          });
        }

        console.log('✅ useServiceDetails: Initial service segments loaded:', segments.length);
      } else {
        console.warn('⚠️ useServiceDetails: Failed to load initial segments:', result.message);
      }
    } catch (err) {
      console.warn('⚠️ useServiceDetails: Error loading initial segments:', err.message);
    }
  }, [selectedAttributes, selectedSegment, setServiceSegments, setSelectedSegment]);

  /**
   * Retry fetching service details - Error recovery
   *
   * @param {string} serviceId - Service ID to retry
   * @param {Object} options - Options object (same as fetchServiceDetails)
   */
  const retryFetchServiceDetails = useCallback((serviceId, options = {}) => {
    console.log('🔄 useServiceDetails: Retrying service details fetch');
    return fetchServiceDetails(serviceId, options);
  }, [fetchServiceDetails]);

  /**
   * Reset service details state - Cleanup
   */
  const resetServiceDetails = useCallback(() => {
    console.log('🔄 useServiceDetails: Resetting service details state');
    resetState();
  }, [resetState]);

  /**
   * Check if service has subcategories - Flutter subcategory logic
   * 
   * @param {Object} service - Service object
   * @returns {boolean} Whether service has subcategories
   */
  const checkHasSubcategories = useCallback((service) => {
    return service?.subcategories?.length > 0 || false;
  }, []);

  /**
   * Get service loading state
   * 
   * @returns {boolean} Whether service details are loading
   */
  const isLoading = loading.serviceDetails;

  /**
   * Get service error state
   * 
   * @returns {string|null} Service details error message
   */
  const getError = error.serviceDetails;

  /**
   * Check if service details are loaded
   * 
   * @returns {boolean} Whether service details are available
   */
  const isLoaded = !!serviceDetails;

  /**
   * Get service video URL - Flutter videoPlayerWidget
   * 
   * @returns {string|null} Video URL or null
   */
  const getVideoUrl = useCallback(() => {
    return serviceDetails?.serviceVideos?.video_url || null;
  }, [serviceDetails]);

  /**
   * Get service image URL - Fallback for video
   * 
   * @returns {string|null} Service image URL
   */
  const getServiceImageUrl = useCallback(() => {
    return serviceDetails?.image || null;
  }, [serviceDetails]);

  /**
   * Get service attributes organized by type - Flutter attribute lists
   * 
   * @returns {Object} Organized attributes by type
   */
  const getOrganizedAttributes = useCallback(() => {
    if (!serviceDetails?.attributes) return { tab: [], dropdown: [], search: [] };

    const organized = { tab: [], dropdown: [], search: [] };

    Object.values(serviceDetails.attributes).forEach(attribute => {
      switch (attribute.type) {
        case 'tab':
          organized.tab.push(attribute);
          break;
        case 'dropdown':
          organized.dropdown.push(attribute);
          break;
        case 'search':
          organized.search.push(attribute);
          break;
        default:
          organized.tab.push(attribute); // Default to tab
      }
    });

    // Sort by weight (Flutter pattern)
    Object.keys(organized).forEach(type => {
      organized[type].sort((a, b) => (a.weight || 0) - (b.weight || 0));
    });

    return organized;
  }, [serviceDetails]);

  return {
    // State
    serviceDetails,
    subServices,
    isLoading,
    error: getError,
    isLoaded,
    hasSubcategories,
    showSubcategorySelection,
    selectedAttributes,

    // Actions (Flutter bloc events)
    fetchServiceDetails,
    retryFetchServiceDetails,
    resetServiceDetails,
    initializeDefaultAttributes,

    // Utility functions
    checkHasSubcategories,
    getVideoUrl,
    getServiceImageUrl,
    getOrganizedAttributes
  };
};

/**
 * useServiceSegments Hook - Replicates Flutter FetchServiceAboutEvent
 *
 * Handles service segments fetching and selection logic:
 * - FetchServiceAboutEvent: Fetch segments based on attribute selections
 * - ToggleSegementSelectionEvent: Handle segment selection
 * - Real-time updates when attributes change
 */
export const useServiceSegments = () => {
  const {
    serviceDetails,
    serviceSegments,
    selectedAttributes,
    selectedSegment,
    loading,
    error,
    setLoading,
    setError,
    setServiceSegments,
    setSelectedSegment
  } = useServiceDetailsContext();

  /**
   * Fetch service segments based on current selections
   * Replicates Flutter FetchServiceAboutEvent with selectedFilterList
   *
   * @param {Object} customAttributes - Optional custom attribute selections
   * @param {string} customSegmentId - Optional custom segment ID
   */
  const fetchServiceSegments = useCallback(async (customAttributes = null, customSegmentId = null) => {
    if (!serviceDetails) {
      console.warn('⚠️ useServiceSegments: No service details available');
      return { success: false, error: 'Service details not loaded' };
    }

    setLoading('serviceSegments', true);
    setError('serviceSegments', null);

    try {
      console.log('🔧 useServiceSegments: Fetching service segments');

      // Use custom attributes or current selections (Flutter: selectedFilterList)
      const attributesToUse = customAttributes || selectedAttributes;
      const attributeFilters = Object.entries(attributesToUse).map(([attributeId, optionId]) => ({
        attribute_id: attributeId,
        option_id: optionId === 'NA' ? '' : optionId
      }));

      const params = {
        category_id: serviceDetails.category_id,
        subcategory_id: '', // Empty for main service
        segment_id: customSegmentId || selectedSegment?.id || '',
        attribute: attributeFilters
      };

      console.log('🔧 useServiceSegments: Request params:', params);

      const result = await serviceDetailsService.getServiceDetailsBySegment(params);

      if (result.success) {
        const segments = result.data || [];
        setServiceSegments(segments);

        // Auto-select first segment if available and none is selected (CORRECT implementation)
        if (segments.length > 0 && !selectedSegment) {
          console.log('🔍 useServiceSegments: Available segments for auto-selection:', {
            allSegments: segments,
            segmentIds: segments.map(s => s.id),
            segmentNames: segments.map(s => s.segment_name || s.segmentName)
          });

          // Select the first available segment (correct behavior)
          const segmentToSelect = segments[0];

          setSelectedSegment(segmentToSelect);
          console.log('🎯 useServiceSegments: Auto-selected first segment (CORRECT):', {
            selectedSegmentId: segmentToSelect?.id,
            selectedSegmentName: segmentToSelect?.segment_name || segmentToSelect?.segmentName,
            segmentData: segmentToSelect
          });
        }

        console.log('✅ useServiceSegments: Service segments updated:', segments.length);
        return { success: true, data: segments };
      } else {
        const errorMessage = result.message || 'Failed to fetch service segments';
        setError('serviceSegments', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('❌ useServiceSegments: Error fetching segments:', err);
      const errorMessage = err.message || 'Failed to fetch service segments';
      setError('serviceSegments', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading('serviceSegments', false);
    }
  }, [serviceDetails, selectedAttributes, selectedSegment, setLoading, setError, setServiceSegments]);

  /**
   * Handle segment selection - Replicates Flutter ToggleSegementSelectionEvent
   *
   * @param {Object} segment - Selected segment object
   */
  const selectSegment = useCallback((segment) => {
    console.log('🔧 useServiceSegments: Segment selected:', segment?.id);
    setSelectedSegment(segment);
  }, [setSelectedSegment]);

  /**
   * Get segments loading state
   */
  const isLoadingSegments = loading.serviceSegments;

  /**
   * Get segments error state
   */
  const getSegmentsError = error.serviceSegments;

  /**
   * Check if segments are available
   */
  const hasSegments = serviceSegments.length > 0;

  /**
   * Get selected segment price information
   */
  const getSelectedSegmentPrice = useCallback(() => {
    if (!selectedSegment) return null;

    return {
      price: selectedSegment.price,
      originalPrice: selectedSegment.original_price,
      discountPercentage: selectedSegment.discount_percentage,
      formattedPrice: `₹${selectedSegment.price}`,
      formattedOriginalPrice: selectedSegment.original_price ? `₹${selectedSegment.original_price}` : null
    };
  }, [selectedSegment]);

  return {
    // State
    serviceSegments,
    selectedSegment,
    isLoadingSegments,
    segmentsError: getSegmentsError,
    hasSegments,

    // Actions
    fetchServiceSegments,
    selectSegment,

    // Utilities
    getSelectedSegmentPrice
  };
};

/**
 * useBookingState Hook - Replicates Flutter ToggleDateAndTimeSelectionEvent
 *
 * Handles booking-related state management:
 * - Date selection logic
 * - Time slot selection
 * - Availability checking
 * - Booking validation
 */
export const useBookingState = () => {
  const {
    selectedDate,
    timeFromValue,
    timeToValue,
    availableDates,
    availableTimeSlots,
    loading,
    error,
    setSelectedDate,
    setTimeFromValue,
    setTimeToValue,
    setLoading,
    setError
  } = useServiceDetailsContext();

  /**
   * Set selected date - Replicates Flutter ToggleDateAndTimeSelectionEvent
   *
   * @param {Date} date - Selected date
   */
  const selectDate = useCallback((date) => {
    console.log('🔧 useBookingState: Date selected:', date);
    setSelectedDate(date);

    // Reset time selections when date changes (Flutter pattern)
    setTimeFromValue(null);
    setTimeToValue(null);
  }, [setSelectedDate, setTimeFromValue, setTimeToValue]);

  /**
   * Set time from value - Replicates Flutter timeFromValue
   *
   * @param {string} timeFrom - Time from value
   */
  const selectTimeFrom = useCallback((timeFrom) => {
    console.log('🔧 useBookingState: Time from selected:', timeFrom);
    setTimeFromValue(timeFrom);
  }, [setTimeFromValue]);

  /**
   * Set time to value - Replicates Flutter timeToValue
   *
   * @param {string} timeTo - Time to value
   */
  const selectTimeTo = useCallback((timeTo) => {
    console.log('🔧 useBookingState: Time to selected:', timeTo);
    setTimeToValue(timeTo);
  }, [setTimeToValue]);

  /**
   * Check if booking selections are complete
   *
   * @returns {boolean} Whether all required selections are made
   */
  const isBookingComplete = useCallback(() => {
    return !!(selectedDate && timeFromValue && timeToValue);
  }, [selectedDate, timeFromValue, timeToValue]);

  /**
   * Get booking validation errors
   *
   * @returns {Array} Array of validation error messages
   */
  const getBookingValidationErrors = useCallback(() => {
    const errors = [];

    if (!selectedDate) {
      errors.push('Please select a date');
    }

    if (!timeFromValue) {
      errors.push('Please select start time');
    }

    if (!timeToValue) {
      errors.push('Please select end time');
    }

    return errors;
  }, [selectedDate, timeFromValue, timeToValue]);

  /**
   * Format selected date for display
   *
   * @returns {string} Formatted date string
   */
  const getFormattedSelectedDate = useCallback(() => {
    if (!selectedDate) return null;

    return selectedDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [selectedDate]);

  return {
    // State
    selectedDate,
    timeFromValue,
    timeToValue,
    availableDates,
    availableTimeSlots,
    isLoadingDates: loading.dateAvailability,
    dateError: error.dateAvailability,

    // Actions
    selectDate,
    selectTimeFrom,
    selectTimeTo,

    // Validation
    isBookingComplete,
    getBookingValidationErrors,
    getFormattedSelectedDate
  };
};

export default useServiceDetails;
