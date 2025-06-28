/**
 * Attribute Utilities - Helper functions for dynamic attribute handling
 * 
 * Provides utility functions for:
 * - Attribute validation
 * - Data structure normalization
 * - Type detection
 * - Error handling
 */

/**
 * Validate attribute structure from API response
 * @param {Object} attributes - Attributes object from API
 * @returns {Object} Validation result with errors and warnings
 */
export const validateAttributeStructure = (attributes) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    attributeCount: 0,
    supportedCount: 0,
    unsupportedCount: 0
  };

  if (!attributes || typeof attributes !== 'object') {
    result.isValid = false;
    result.errors.push('Attributes must be an object');
    return result;
  }

  const attributeKeys = Object.keys(attributes);
  result.attributeCount = attributeKeys.length;

  if (attributeKeys.length === 0) {
    result.warnings.push('No attributes found in response');
    return result;
  }

  attributeKeys.forEach(attributeName => {
    const attributeGroup = attributes[attributeName];
    
    if (!attributeGroup || typeof attributeGroup !== 'object') {
      result.errors.push(`Invalid attribute group for "${attributeName}"`);
      result.unsupportedCount++;
      return;
    }

    // Check for supported attribute types
    const hasDropdown = !!(attributeGroup.dropdown && Array.isArray(attributeGroup.dropdown));
    const hasList = !!(attributeGroup.list && Array.isArray(attributeGroup.list));
    const hasSearch = !!(attributeGroup.search && Array.isArray(attributeGroup.search));

    if (!hasDropdown && !hasList && !hasSearch) {
      result.warnings.push(`No supported attribute types found for "${attributeName}"`);
      result.unsupportedCount++;
      return;
    }

    result.supportedCount++;

    // Validate individual attribute items
    ['dropdown', 'list', 'search'].forEach(type => {
      if (attributeGroup[type] && Array.isArray(attributeGroup[type])) {
        attributeGroup[type].forEach((item, index) => {
          if (!item.options || typeof item.options !== 'object') {
            result.warnings.push(`Missing or invalid options for ${attributeName}.${type}[${index}]`);
          }
        });
      }
    });
  });

  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
};

/**
 * Extract all options from an attribute item
 * @param {Object} attributeItem - Single attribute item with options
 * @returns {Array} Flattened array of options
 */
export const extractAttributeOptions = (attributeItem) => {
  if (!attributeItem?.options || typeof attributeItem.options !== 'object') {
    return [];
  }

  const options = [];
  
  Object.values(attributeItem.options).forEach(optionGroup => {
    if (Array.isArray(optionGroup)) {
      options.push(...optionGroup.filter(option => 
        option && typeof option === 'object' && (option.id || option.value)
      ));
    }
  });

  // Sort by weight (Flutter pattern)
  return options.sort((a, b) => (a.weight || 0) - (b.weight || 0));
};

/**
 * Detect required attributes from service details
 * @param {Object} serviceDetails - Service details object
 * @returns {Array} Array of required attribute names
 */
export const detectRequiredAttributes = (serviceDetails) => {
  const requiredAttributes = [];
  
  if (!serviceDetails?.attributes) {
    return requiredAttributes;
  }

  Object.keys(serviceDetails.attributes).forEach(attributeName => {
    const attributeGroup = serviceDetails.attributes[attributeName];
    
    // Check if any attribute item is marked as required
    ['dropdown', 'list', 'search'].forEach(type => {
      if (attributeGroup[type] && Array.isArray(attributeGroup[type])) {
        attributeGroup[type].forEach(item => {
          if (item.required === true || item.is_required === true) {
            if (!requiredAttributes.includes(attributeName)) {
              requiredAttributes.push(attributeName);
            }
          }
        });
      }
    });
  });

  return requiredAttributes;
};

/**
 * Validate selected attributes against requirements
 * @param {Object} selectedAttributes - Currently selected attributes
 * @param {Array} requiredAttributes - Array of required attribute names
 * @returns {Object} Validation result
 */
export const validateSelectedAttributes = (selectedAttributes, requiredAttributes) => {
  const result = {
    isValid: true,
    errors: [],
    missingRequired: []
  };

  requiredAttributes.forEach(attributeName => {
    const selection = selectedAttributes[attributeName];
    
    if (!selection || !selection.id) {
      result.isValid = false;
      result.missingRequired.push(attributeName);
      result.errors.push(`${attributeName} is required`);
    }
  });

  return result;
};

/**
 * Normalize attribute selection data for API calls
 * @param {Object} selectedAttributes - Selected attributes object
 * @returns {Array} Normalized attribute array for API
 */
export const normalizeAttributesForAPI = (selectedAttributes) => {
  if (!selectedAttributes || typeof selectedAttributes !== 'object') {
    return [];
  }

  return Object.entries(selectedAttributes)
    .filter(([_, selection]) => selection && selection.id)
    .map(([attributeId, selection]) => ({
      attribute_id: attributeId,
      option_id: selection.id === 'NA' ? '' : selection.id,
      option_value: selection.value || '',
      option_data: selection.data || {}
    }));
};

/**
 * Get attribute display information
 * @param {string} attributeName - Attribute name
 * @param {Object} attributeGroup - Attribute group data
 * @returns {Object} Display information
 */
export const getAttributeDisplayInfo = (attributeName, attributeGroup) => {
  const info = {
    name: attributeName,
    displayName: attributeName,
    type: 'unknown',
    hasOptions: false,
    optionCount: 0,
    isRequired: false
  };

  if (!attributeGroup || typeof attributeGroup !== 'object') {
    return info;
  }

  // Determine primary type and get display name
  if (attributeGroup.list && attributeGroup.list.length > 0) {
    info.type = 'list';
    info.displayName = attributeGroup.list[0].name || attributeName;
    info.hasOptions = true;
    info.optionCount = extractAttributeOptions(attributeGroup.list[0]).length;
    info.isRequired = attributeGroup.list[0].required === true || attributeGroup.list[0].is_required === true;
  } else if (attributeGroup.dropdown && attributeGroup.dropdown.length > 0) {
    info.type = 'dropdown';
    info.displayName = attributeGroup.dropdown[0].name || attributeName;
    info.hasOptions = true;
    info.optionCount = extractAttributeOptions(attributeGroup.dropdown[0]).length;
    info.isRequired = attributeGroup.dropdown[0].required === true || attributeGroup.dropdown[0].is_required === true;
  } else if (attributeGroup.search && attributeGroup.search.length > 0) {
    info.type = 'search';
    info.displayName = attributeGroup.search[0].name || attributeName;
    info.hasOptions = true;
    info.optionCount = extractAttributeOptions(attributeGroup.search[0]).length;
    info.isRequired = attributeGroup.search[0].required === true || attributeGroup.search[0].is_required === true;
  }

  return info;
};

/**
 * Create attribute selection summary for display
 * @param {Object} selectedAttributes - Selected attributes
 * @param {Object} serviceAttributes - Service attributes structure
 * @returns {Array} Summary array for display
 */
export const createAttributeSelectionSummary = (selectedAttributes, serviceAttributes) => {
  const summary = [];

  if (!selectedAttributes || !serviceAttributes) {
    return summary;
  }

  Object.keys(selectedAttributes).forEach(attributeName => {
    const selection = selectedAttributes[attributeName];
    const attributeGroup = serviceAttributes[attributeName];
    
    if (selection && selection.id && attributeGroup) {
      const displayInfo = getAttributeDisplayInfo(attributeName, attributeGroup);
      
      summary.push({
        attributeName,
        displayName: displayInfo.displayName,
        selectedValue: selection.value || selection.id,
        selectedId: selection.id,
        type: displayInfo.type
      });
    }
  });

  return summary;
};

/**
 * Check if attributes have changed and need re-fetching
 * @param {Object} previousAttributes - Previous attribute selections
 * @param {Object} currentAttributes - Current attribute selections
 * @returns {boolean} Whether attributes have changed
 */
export const hasAttributesChanged = (previousAttributes, currentAttributes) => {
  if (!previousAttributes && !currentAttributes) return false;
  if (!previousAttributes || !currentAttributes) return true;

  const prevKeys = Object.keys(previousAttributes).sort();
  const currKeys = Object.keys(currentAttributes).sort();

  if (prevKeys.length !== currKeys.length) return true;
  if (prevKeys.join(',') !== currKeys.join(',')) return true;

  return prevKeys.some(key => {
    const prevSelection = previousAttributes[key];
    const currSelection = currentAttributes[key];
    
    if (!prevSelection && !currSelection) return false;
    if (!prevSelection || !currSelection) return true;
    
    return prevSelection.id !== currSelection.id;
  });
};

/**
 * Handle attribute rendering errors gracefully
 * @param {Error} error - The error that occurred
 * @param {string} context - Context where error occurred
 * @param {Object} attributeData - The attribute data that caused the error
 * @returns {Object} Error handling result
 */
export const handleAttributeError = (error, context = 'Attribute Rendering', attributeData = null) => {
  const errorInfo = {
    message: error.message || 'Unknown attribute error',
    context,
    timestamp: new Date().toISOString(),
    attributeData: attributeData ? JSON.stringify(attributeData, null, 2) : null,
    stack: error.stack
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${context} Error`);
    console.error('Error:', error);
    console.error('Context:', context);
    if (attributeData) {
      console.error('Attribute Data:', attributeData);
    }
    console.groupEnd();
  }

  // Return error info for handling
  return {
    hasError: true,
    errorInfo,
    canRecover: isRecoverableError(error),
    fallbackData: generateFallbackAttributeData(attributeData)
  };
};

/**
 * Check if an error is recoverable
 * @param {Error} error - The error to check
 * @returns {boolean} Whether the error is recoverable
 */
export const isRecoverableError = (error) => {
  const recoverableErrors = [
    'Cannot read property',
    'Cannot read properties',
    'undefined is not an object',
    'null is not an object',
    'TypeError'
  ];

  return recoverableErrors.some(pattern =>
    error.message && error.message.includes(pattern)
  );
};

/**
 * Generate fallback attribute data for error recovery
 * @param {Object} originalData - Original attribute data that caused error
 * @returns {Object} Safe fallback data
 */
export const generateFallbackAttributeData = (originalData) => {
  if (!originalData || typeof originalData !== 'object') {
    return {
      dropdown: [],
      list: [],
      search: []
    };
  }

  const fallback = {
    dropdown: [],
    list: [],
    search: []
  };

  // Try to preserve any valid data
  try {
    if (originalData.dropdown && Array.isArray(originalData.dropdown)) {
      fallback.dropdown = originalData.dropdown.filter(item =>
        item && typeof item === 'object'
      );
    }
    if (originalData.list && Array.isArray(originalData.list)) {
      fallback.list = originalData.list.filter(item =>
        item && typeof item === 'object'
      );
    }
    if (originalData.search && Array.isArray(originalData.search)) {
      fallback.search = originalData.search.filter(item =>
        item && typeof item === 'object'
      );
    }
  } catch (e) {
    // If even fallback generation fails, return empty structure
    console.warn('Failed to generate fallback data:', e);
  }

  return fallback;
};

/**
 * Safe attribute option extraction with error handling
 * @param {Object} attributeItem - Attribute item to extract options from
 * @returns {Array} Safely extracted options
 */
export const safeExtractAttributeOptions = (attributeItem) => {
  try {
    return extractAttributeOptions(attributeItem);
  } catch (error) {
    console.warn('Error extracting attribute options:', error);
    return [];
  }
};

/**
 * Debug helper to log attribute structure
 * @param {Object} attributes - Attributes to debug
 * @param {string} context - Context for logging
 */
export const debugAttributeStructure = (attributes, context = 'Attributes') => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group(`🔧 ${context} Debug`);

  if (!attributes || typeof attributes !== 'object') {
    console.warn('Invalid attributes structure:', attributes);
    console.groupEnd();
    return;
  }

  const validation = validateAttributeStructure(attributes);
  console.log('Validation Result:', validation);

  Object.keys(attributes).forEach(attributeName => {
    const attributeGroup = attributes[attributeName];
    const displayInfo = getAttributeDisplayInfo(attributeName, attributeGroup);

    console.log(`Attribute "${attributeName}":`, {
      displayInfo,
      structure: attributeGroup,
      hasDropdown: !!(attributeGroup.dropdown && attributeGroup.dropdown.length > 0),
      hasList: !!(attributeGroup.list && attributeGroup.list.length > 0),
      hasSearch: !!(attributeGroup.search && attributeGroup.search.length > 0)
    });
  });

  console.groupEnd();
};
