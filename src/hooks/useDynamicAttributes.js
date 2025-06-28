import { useCallback, useMemo, useEffect } from 'react';
import { useServiceDetailsContext } from '../contexts/ServiceDetailsContext';
import {
  validateAttributeStructure,
  detectRequiredAttributes,
  validateSelectedAttributes,
  normalizeAttributesForAPI,
  createAttributeSelectionSummary,
  hasAttributesChanged,
  debugAttributeStructure
} from '../components/serviceDetails/attributeUtils';

/**
 * useDynamicAttributes Hook - Enhanced attribute management
 * 
 * Provides comprehensive attribute handling for dynamic service details:
 * - Automatic attribute validation
 * - Required attribute detection
 * - Selection validation
 * - API data normalization
 * - Change detection for re-fetching
 */
export const useDynamicAttributes = (serviceDetails) => {
  const {
    selectedAttributes,
    updateSelectedAttributes,
    setSelectedSegment,
    loading,
    error
  } = useServiceDetailsContext();

  // Validate attribute structure from API response
  const attributeValidation = useMemo(() => {
    if (!serviceDetails?.attributes) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        attributeCount: 0,
        supportedCount: 0,
        unsupportedCount: 0
      };
    }

    return validateAttributeStructure(serviceDetails.attributes);
  }, [serviceDetails?.attributes]);

  // Detect required attributes
  const requiredAttributes = useMemo(() => {
    return detectRequiredAttributes(serviceDetails);
  }, [serviceDetails]);

  // Validate current selections
  const selectionValidation = useMemo(() => {
    return validateSelectedAttributes(selectedAttributes, requiredAttributes);
  }, [selectedAttributes, requiredAttributes]);

  // Create selection summary for display
  const selectionSummary = useMemo(() => {
    return createAttributeSelectionSummary(selectedAttributes, serviceDetails?.attributes);
  }, [selectedAttributes, serviceDetails?.attributes]);

  // Normalize attributes for API calls
  const normalizedAttributes = useMemo(() => {
    return normalizeAttributesForAPI(selectedAttributes);
  }, [selectedAttributes]);

  /**
   * Enhanced attribute selection handler with validation
   * @param {string} attributeName - Attribute name/ID
   * @param {string} optionId - Selected option ID
   * @param {string} optionValue - Selected option value
   * @param {Object} optionData - Full option data object
   */
  const handleAttributeSelect = useCallback((attributeName, optionId, optionValue, optionData = {}) => {
    console.log('🚨 handleAttributeSelect RECEIVED:', {
      attributeName,
      optionId,
      optionValue,
      optionData,
      expectedCorrectOptionId: "1c46d620f40d73e9c99926f70db01575",
      receivedCorrectOptionId: optionId === "1c46d620f40d73e9c99926f70db01575"
    });

    if (!attributeName || !optionId) {
      console.warn('useDynamicAttributes: Invalid attribute selection parameters');
      return;
    }

    // Enhanced selection data structure
    const selectionData = {
      id: optionId,
      value: optionValue,
      data: optionData,
      timestamp: Date.now()
    };

    console.log('🚨 handleAttributeSelect STORING:', {
      attributeName,
      selectionData,
      storedOptionId: selectionData.id
    });

    // Update context with enhanced data
    updateSelectedAttributes(attributeName, selectionData);

    // Special handling for service segments - ONLY update selectedSegment context, don't treat as attribute
    if (attributeName === "serviceSegments") {
      setSelectedSegment(optionData);
      console.log('🎯 useDynamicAttributes: Segment selected (NOT stored as attribute):', {
        segmentId: optionId,
        segmentName: optionValue,
        segmentData: optionData
      });
      return; // Don't store segments as attributes
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 useDynamicAttributes: Attribute selected', {
        attributeName,
        optionId,
        optionValue,
        selectionData
      });
    }
  }, [updateSelectedAttributes, setSelectedSegment]);

  /**
   * Initialize default attribute selections
   * @param {Object} attributes - Attributes object from service details
   */
  const initializeDefaultSelections = useCallback((attributes) => {
    if (!attributes || typeof attributes !== 'object') return;

    console.log('🔧 useDynamicAttributes: Initializing default selections');

    // Special handling for AC service "Type of AC" attribute
    if (attributes["Type of AC"] && attributes["Type of AC"].list) {
      const typeOfACOptions = [...attributes["Type of AC"].list];

      // Add "Super Saver Deal" from empty key attribute if it exists
      if (attributes[""] && attributes[""].list) {
        typeOfACOptions.push(...attributes[""].list);
      }

      if (typeOfACOptions.length > 0 && !selectedAttributes["Type of AC"]?.id) {
        // Find the correct "Split" option by name, not just the first option
        const splitOption = typeOfACOptions.find(option =>
          option.name === "split" || option.name === "Split" || option.value === "split"
        );

        let selectedOption;

        if (splitOption) {
          console.log('🔧 useDynamicAttributes: Auto-selecting Split option:', {
            optionId: splitOption.id,
            optionName: splitOption.name,
            expectedId: "1c46d620f40d73e9c99926f70db01575",
            isCorrectId: splitOption.id === "1c46d620f40d73e9c99926f70db01575"
          });
          selectedOption = splitOption;
          handleAttributeSelect("Type of AC", splitOption.id, splitOption.name, splitOption);
        } else {
          // Fallback to first option if Split not found
          const firstOption = typeOfACOptions[0];
          console.log('🔧 useDynamicAttributes: Split not found, auto-selecting first option:', {
            optionId: firstOption.id,
            optionName: firstOption.name
          });
          selectedOption = firstOption;
          handleAttributeSelect("Type of AC", firstOption.id, firstOption.name, firstOption);
        }

        if (selectedOption.name === "split") {
          // Auto-select first No. of Service option if available for Split
          const noOfServiceOptions = selectedOption.options?.["No.of Service"];
          if (noOfServiceOptions && noOfServiceOptions.length > 0) {
            const firstNoOfService = noOfServiceOptions[0];
            setTimeout(() => {
              handleAttributeSelect("No.of Service", firstNoOfService.id, firstNoOfService.value, firstNoOfService);
            }, 100);
          }

          // Auto-select first service segment if available for Split
          const serviceSegments = selectedOption.serviceSegments;
          if (serviceSegments && serviceSegments.length > 0) {
            const firstSegment = serviceSegments[0];
            setTimeout(() => {
              handleAttributeSelect("serviceSegments", firstSegment.id, firstSegment.segment_name, firstSegment);
            }, 200);
          }
        } else if (selectedOption.name === "Super Saver Deal") {
          // Auto-select first Super Saver Deal option if available
          const superSaverOptions = selectedOption.options?.["null"] || selectedOption.options?.[null];
          if (superSaverOptions && superSaverOptions.length > 0) {
            const firstSuperSaver = superSaverOptions[0];
            setTimeout(() => {
              handleAttributeSelect("Super Saver Deal", firstSuperSaver.id, firstSuperSaver.value, firstSuperSaver);
            }, 100);
          }
        }
      }
      return; // Skip general initialization for AC services
    }

    // General initialization for non-AC services
    Object.keys(attributes).forEach(attributeName => {
      const attributeGroup = attributes[attributeName];

      // Skip if already selected or empty key
      if (selectedAttributes[attributeName]?.id || attributeName === "") return;

      // Find first available option from any type
      let defaultOption = null;

      ['list', 'dropdown', 'search'].forEach(type => {
        if (!defaultOption && attributeGroup[type] && Array.isArray(attributeGroup[type])) {
          attributeGroup[type].forEach(item => {
            if (!defaultOption && item.options) {
              const options = [];
              Object.values(item.options).forEach(optionGroup => {
                if (Array.isArray(optionGroup)) {
                  options.push(...optionGroup);
                }
              });

              if (options.length > 0) {
                // Sort by weight and select first
                const sortedOptions = options.sort((a, b) => (a.weight || 0) - (b.weight || 0));
                defaultOption = sortedOptions[0];
              }
            }
          });
        }
      });

      if (defaultOption) {
        handleAttributeSelect(attributeName, defaultOption.id, defaultOption.value, defaultOption);
      }
    });
  }, [selectedAttributes, handleAttributeSelect]);

  /**
   * Clear all attribute selections
   */
  const clearAllSelections = useCallback(() => {
    console.log('🔧 useDynamicAttributes: Clearing all selections');
    // This would need to be implemented in the context
    // For now, we'll clear each attribute individually
    Object.keys(selectedAttributes).forEach(attributeName => {
      updateSelectedAttributes(attributeName, null);
    });
  }, [selectedAttributes, updateSelectedAttributes]);

  /**
   * Check if all required attributes are selected
   * @returns {boolean} Whether all required attributes are selected
   */
  const areRequiredAttributesSelected = useCallback(() => {
    return selectionValidation.isValid;
  }, [selectionValidation.isValid]);

  /**
   * Get validation errors for display
   * @returns {Array} Array of validation error messages
   */
  const getValidationErrors = useCallback(() => {
    return selectionValidation.errors;
  }, [selectionValidation.errors]);

  /**
   * Get missing required attributes
   * @returns {Array} Array of missing required attribute names
   */
  const getMissingRequiredAttributes = useCallback(() => {
    return selectionValidation.missingRequired;
  }, [selectionValidation.missingRequired]);

  /**
   * Check if attributes are ready for booking
   * @returns {boolean} Whether attributes are ready for booking
   */
  const isReadyForBooking = useCallback(() => {
    return attributeValidation.isValid && 
           selectionValidation.isValid && 
           attributeValidation.supportedCount > 0;
  }, [attributeValidation.isValid, selectionValidation.isValid, attributeValidation.supportedCount]);

  /**
   * Get attribute statistics for debugging
   * @returns {Object} Attribute statistics
   */
  const getAttributeStats = useCallback(() => {
    return {
      total: attributeValidation.attributeCount,
      supported: attributeValidation.supportedCount,
      unsupported: attributeValidation.unsupportedCount,
      required: requiredAttributes.length,
      selected: Object.keys(selectedAttributes).length,
      valid: selectionValidation.isValid
    };
  }, [attributeValidation, requiredAttributes.length, selectedAttributes, selectionValidation.isValid]);

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && serviceDetails?.attributes) {
      debugAttributeStructure(serviceDetails.attributes, 'useDynamicAttributes');
    }
  }, [serviceDetails?.attributes]);

  // Auto-initialize default selections when service details load
  useEffect(() => {
    if (serviceDetails?.attributes && Object.keys(selectedAttributes).length === 0) {
      initializeDefaultSelections(serviceDetails.attributes);
    }
  }, [serviceDetails?.attributes, selectedAttributes, initializeDefaultSelections]);

  return {
    // Attribute data
    attributes: serviceDetails?.attributes || {},
    attributeValidation,
    requiredAttributes,
    
    // Selection data
    selectedAttributes,
    selectionValidation,
    selectionSummary,
    normalizedAttributes,
    
    // Actions
    handleAttributeSelect,
    initializeDefaultSelections,
    clearAllSelections,
    
    // Validation helpers
    areRequiredAttributesSelected,
    getValidationErrors,
    getMissingRequiredAttributes,
    isReadyForBooking,
    getAttributeStats,
    
    // State
    isLoading: loading.serviceDetails,
    error: error.serviceDetails,
    
    // Utilities
    hasAttributesChanged: (previousAttributes) => 
      hasAttributesChanged(previousAttributes, selectedAttributes)
  };
};

export default useDynamicAttributes;
