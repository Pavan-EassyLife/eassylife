import React, { useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * DynamicAttributeSelector - Reusable component for rendering service attributes
 *
 * Handles different attribute types dynamically based on API response structure:
 * - Dropdown attributes: Rendered as select dropdowns
 * - List attributes: Rendered as tab/button selections (AC Service style)
 * - Search attributes: Rendered as searchable dropdowns
 * - AC Service attributes: Hardcoded AC-specific attributes (Type of AC, No. of Service)
 *
 * Features:
 * - API response-driven rendering
 * - Flexible form control types
 * - Consistent styling with Flutter app
 * - Proper state management integration
 * - Error handling and validation
 * - AC service special handling
 */
const DynamicAttributeSelector = ({
  attributes = {},
  selectedAttributes = {},
  onAttributeSelect,
  className = "",
  showValidationErrors = false,
  requiredAttributes = [],
  disabled = false,
  serviceDetails = null // Added to detect AC service
}) => {



  /**
   * Detect attribute type and structure from API response
   * @param {Object} attributeGroup - Attribute group from API
   * @returns {Object} Detected structure info
   */
  const detectAttributeStructure = useCallback((attributeGroup) => {
    const structure = {
      hasDropdown: !!(attributeGroup.dropdown && attributeGroup.dropdown.length > 0),
      hasList: !!(attributeGroup.list && attributeGroup.list.length > 0),
      hasSearch: !!(attributeGroup.search && attributeGroup.search.length > 0),
      dropdownCount: attributeGroup.dropdown?.length || 0,
      listCount: attributeGroup.list?.length || 0,
      searchCount: attributeGroup.search?.length || 0
    };

    // Determine primary rendering type
    if (structure.hasList) {
      structure.primaryType = 'list';
    } else if (structure.hasDropdown) {
      structure.primaryType = 'dropdown';
    } else if (structure.hasSearch) {
      structure.primaryType = 'search';
    } else {
      structure.primaryType = 'unknown';
    }

    return structure;
  }, []);

  /**
   * Extract options from attribute structure
   * @param {Object} attribute - Single attribute item
   * @returns {Array} Flattened options array
   */
  const extractOptions = useCallback((attribute) => {
    if (!attribute.options || typeof attribute.options !== 'object') {
      return [];
    }

    // Flatten options from nested structure
    const options = [];
    Object.values(attribute.options).forEach(optionGroup => {
      if (Array.isArray(optionGroup)) {
        options.push(...optionGroup);
      }
    });

    // Sort by weight (Flutter pattern)
    return options.sort((a, b) => (a.weight || 0) - (b.weight || 0));
  }, []);

  /**
   * Find attribute ID by display name
   * @param {string} displayName - Attribute display name
   * @param {Object} allAttributes - All attributes object
   * @returns {string} Attribute ID or display name as fallback
   */
  const findAttributeIdByName = useCallback((displayName, allAttributes = {}) => {
    // First, check if displayName is already an ID (contains numbers/letters pattern)
    if (displayName && displayName.length > 10 && /^[a-f0-9]+$/.test(displayName)) {
      return displayName;
    }

    // Search through all attributes to find the one with matching name
    for (const [attributeId, attributeGroup] of Object.entries(allAttributes)) {
      const allAttributeItems = [
        ...(attributeGroup.list || []),
        ...(attributeGroup.dropdown || []),
        ...(attributeGroup.search || [])
      ];

      for (const item of allAttributeItems) {
        if (item.name === displayName) {
          return item.id || attributeId;
        }
      }
    }

    // Fallback to display name if not found
    return displayName;
  }, []);

  /**
   * Handle attribute selection with proper data structure
   * @param {string} attributeName - Attribute name/ID
   * @param {string} optionId - Selected option ID
   * @param {string} optionValue - Selected option value
   * @param {Object} optionData - Full option data object
   */
  const handleAttributeSelect = useCallback((attributeName, optionId, optionValue, optionData = {}) => {
    if (disabled || !onAttributeSelect) return;

    // Ensure we're using the attribute ID, not display name
    const attributeId = findAttributeIdByName(attributeName, attributes);

    console.log('🔧 DynamicAttributeSelector: Attribute selection', {
      originalAttributeName: attributeName,
      resolvedAttributeId: attributeId,
      optionId,
      optionValue
    });

    // Call parent handler with consistent data structure
    onAttributeSelect(attributeId, optionId, optionValue, optionData);
  }, [disabled, onAttributeSelect, findAttributeIdByName, attributes]);

  /**
   * Check if attribute is required and not selected
   * @param {string} attributeName - Attribute name
   * @returns {boolean} Whether attribute has validation error
   */
  const hasValidationError = useCallback((attributeName) => {
    if (!showValidationErrors) return false;
    
    const isRequired = requiredAttributes.includes(attributeName);
    const isSelected = selectedAttributes[attributeName]?.id;
    
    return isRequired && !isSelected;
  }, [showValidationErrors, requiredAttributes, selectedAttributes]);

  /**
   * Render dropdown attribute
   * @param {string} attributeName - Attribute name
   * @param {Object} attribute - Attribute data
   * @param {Array} options - Extracted options
   * @returns {JSX.Element} Dropdown component
   */
  const renderDropdownAttribute = useCallback((attributeName, attribute, options) => {
    const selectedValue = selectedAttributes[attributeName]?.id || '';
    const hasError = hasValidationError(attributeName);
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold w-20 flex-shrink-0 ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
            {attribute.name || attributeName}
            {requiredAttributes.includes(attributeName) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>
          <div className="relative flex-1 ml-4">
            <select
              value={selectedValue}
              onChange={(e) => {
                const selectedOption = options.find(opt => opt.id === e.target.value);
                if (selectedOption) {
                  handleAttributeSelect(attributeName, selectedOption.id, selectedOption.value, selectedOption);
                }
              }}
              disabled={disabled}
              className={`w-full p-3 border rounded-md text-sm appearance-none focus:outline-none transition-all duration-300 ${
                hasError 
                  ? 'bg-red-50 border-red-300 focus:border-red-500' 
                  : 'bg-gray-100 border-gray-200 focus:border-orange-500 focus:bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-600'}`}
            >
              <option value="">Select {attribute.name || attributeName}</option>
              {options.map((option, index) => (
                <option key={option.id || index} value={option.id}>
                  {option.value || option.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        {hasError && (
          <p className="text-red-500 text-xs mt-1 ml-24">
            Please select {attribute.name || attributeName}
          </p>
        )}
      </div>
    );
  }, [selectedAttributes, hasValidationError, requiredAttributes, handleAttributeSelect, disabled]);

  /**
   * Render AC service attributes with nested structure
   * @param {string} attributeName - Attribute name
   * @param {Object} attributeGroup - Attribute group data
   * @returns {JSX.Element} AC service component
   */
  const renderACServiceAttributes = useCallback((attributeName, attributeGroup, allAttributes = {}) => {
    if (!attributeGroup.list || attributeGroup.list.length === 0) return null;

    // Merge "Type of AC" and empty key ("") attributes
    let typeOfACOptions = [...attributeGroup.list];

    // Add "Super Saver Deal" from empty key attribute if it exists
    if (allAttributes[""] && allAttributes[""].list) {
      typeOfACOptions.push(...allAttributes[""].list);
    }

    const selectedTypeOfAC = selectedAttributes[attributeName]?.id;
    const selectedTypeOfACData = typeOfACOptions.find(option => option.id === selectedTypeOfAC);

    // Second level: No. of Service options (when Split is selected)
    const noOfServiceOptions = selectedTypeOfACData?.options?.["No.of Service"] || [];
    const selectedNoOfService = selectedAttributes["No.of Service"]?.id;

    // Third level: Service segments
    const serviceSegments = selectedTypeOfACData?.serviceSegments || [];
    const selectedSegment = selectedAttributes["serviceSegments"]?.id;

    const hasError = hasValidationError(attributeName);

    return (
      <div className="mb-6">
        {/* Type of AC Section */}
        <h3 className={`text-lg font-bold mb-4 ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
          {attributeName}
          {requiredAttributes.includes(attributeName) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-3 mb-6">
          {typeOfACOptions.map((option, index) => (
            <button
              key={option.id || index}
              onClick={() => {
                console.log('🚨 OPTION CLICKED - DynamicAttributeSelector:', {
                  attributeName,
                  clickedOptionId: option.id,
                  clickedOptionName: option.name,
                  clickedOptionData: option,

                  // Show all available options and their IDs
                  allAvailableOptions: typeOfACOptions.map(opt => ({
                    id: opt.id,
                    name: opt.name,
                    isClicked: opt.id === option.id
                  })),

                  // Expected correct option ID
                  expectedCorrectOptionId: "1c46d620f40d73e9c99926f70db01575",
                  isCorrectOption: option.id === "1c46d620f40d73e9c99926f70db01575"
                });

                console.log('🚨 CALLING handleAttributeSelect with:', {
                  attributeName,
                  optionId: option.id,
                  optionName: option.name,
                  optionData: option
                });

                handleAttributeSelect(attributeName, option.id, option.name, option);
                // Reset dependent selections when changing Type of AC
                if (selectedAttributes["No.of Service"]) {
                  handleAttributeSelect("No.of Service", "", "", {});
                }
                if (selectedAttributes["serviceSegments"]) {
                  handleAttributeSelect("serviceSegments", "", "", {});
                }
              }}
              disabled={disabled}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedTypeOfAC === option.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* No. of Service Section (only show when Split is selected) */}
        {selectedTypeOfACData && noOfServiceOptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              No. of Service
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {noOfServiceOptions.map((option, index) => (
                <button
                  key={option.id || index}
                  onClick={() => handleAttributeSelect("No.of Service", option.id, option.value, option)}
                  disabled={disabled}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedNoOfService === option.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Service Segments Section (Jet spray, Foam + Jet) */}
        {serviceSegments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Service Type</h3>
            <div className="flex flex-wrap gap-3">
              {serviceSegments.map((segment, index) => (
                <button
                  key={segment.id || index}
                  onClick={() => {
                    console.log('🎯 DynamicAttributeSelector: Segment selected:', {
                      segmentId: segment.id,
                      segmentName: segment.segment_name,
                      segmentData: segment,
                      allAvailableSegments: serviceSegments,
                      segmentIndex: serviceSegments.findIndex(s => s.id === segment.id)
                    });
                    // Use proper segment selection instead of treating as attribute
                    onAttributeSelect("serviceSegments", segment.id, segment.segment_name, segment);
                  }}
                  disabled={disabled}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedSegment === segment.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {segment.segment_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Super Saver Deal Options - Only show when Super Saver Deal is selected */}
        {selectedTypeOfACData && selectedTypeOfACData.name === "Super Saver Deal" && selectedTypeOfACData.options && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Service Plans
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Handle options under "null" key for Super Saver Deal */}
              {(selectedTypeOfACData.options["null"] || selectedTypeOfACData.options[null] || []).map((option, index) => (
                <button
                  key={option.id || index}
                  onClick={() => handleAttributeSelect("Super Saver Deal", option.id, option.value, option)}
                  disabled={disabled}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedAttributes["Super Saver Deal"]?.id === option.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* About this Service Section - Only show when Split is selected */}
        {selectedTypeOfACData && selectedTypeOfACData.name === "split" && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">About this Service</h3>
            <p className="text-gray-600 text-sm">
              generic
            </p>
          </div>
        )}

        {hasError && (
          <p className="text-red-500 text-xs mt-1">
            Please select {attributeName}
          </p>
        )}
      </div>
    );
  }, [selectedAttributes, hasValidationError, requiredAttributes, handleAttributeSelect, disabled, serviceDetails]);

  /**
   * Render list attribute (tab-style buttons)
   * @param {string} attributeName - Attribute name
   * @param {Object} attribute - Attribute data
   * @param {Array} options - Extracted options
   * @returns {JSX.Element} List component
   */
  const renderListAttribute = useCallback((attributeName, attribute, options) => {
    const selectedValue = selectedAttributes[attributeName]?.id;
    const hasError = hasValidationError(attributeName);

    return (
      <div className="mb-6">
        <h3 className={`text-lg font-bold mb-4 ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
          {attribute.name || attributeName}
          {requiredAttributes.includes(attributeName) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-3">
          {options.map((option, index) => (
            <button
              key={option.id || index}
              onClick={() => handleAttributeSelect(attributeName, option.id, option.value, option)}
              disabled={disabled}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 min-w-[80px] ${
                selectedValue === option.id
                  ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                  : hasError
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.value || option.name}
            </button>
          ))}
        </div>
        {hasError && (
          <p className="text-red-500 text-xs mt-2">
            Please select {attribute.name || attributeName}
          </p>
        )}
      </div>
    );
  }, [selectedAttributes, hasValidationError, requiredAttributes, handleAttributeSelect, disabled]);

  /**
   * Render search attribute (searchable dropdown)
   * @param {string} attributeName - Attribute name
   * @param {Object} attribute - Attribute data
   * @param {Array} options - Extracted options
   * @returns {JSX.Element} Search component
   */
  const renderSearchAttribute = useCallback((attributeName, attribute, options) => {
    const selectedValue = selectedAttributes[attributeName]?.id || '';
    const hasError = hasValidationError(attributeName);
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold w-20 flex-shrink-0 ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
            {attribute.name || attributeName}
            {requiredAttributes.includes(attributeName) && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>
          <div className="relative flex-1 ml-4">
            <select
              value={selectedValue}
              onChange={(e) => {
                const selectedOption = options.find(opt => opt.id === e.target.value);
                if (selectedOption) {
                  handleAttributeSelect(attributeName, selectedOption.id, selectedOption.value, selectedOption);
                }
              }}
              disabled={disabled}
              className={`w-full p-3 border rounded-md text-sm appearance-none focus:outline-none transition-all duration-300 ${
                hasError 
                  ? 'bg-red-50 border-red-300 focus:border-red-500' 
                  : 'bg-gray-100 border-gray-200 focus:border-orange-500 focus:bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-600'}`}
            >
              <option value="">Search {attribute.name || attributeName}</option>
              {options.map((option, index) => (
                <option key={option.id || index} value={option.id}>
                  {option.value || option.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        {hasError && (
          <p className="text-red-500 text-xs mt-1 ml-24">
            Please search and select {attribute.name || attributeName}
          </p>
        )}
      </div>
    );
  }, [selectedAttributes, hasValidationError, requiredAttributes, handleAttributeSelect, disabled]);

  /**
   * Render single attribute based on its structure
   * @param {string} attributeName - Attribute name
   * @param {Object} attributeGroup - Attribute group data
   * @returns {JSX.Element} Rendered attribute component
   */
  const renderAttribute = useCallback((attributeName, attributeGroup, allAttributes = {}) => {
    // Special handling for AC service "Type of AC" attribute
    if (attributeName === "Type of AC" && attributeGroup.list) {
      return (
        <div key={attributeName}>
          {renderACServiceAttributes(attributeName, attributeGroup, allAttributes)}
        </div>
      );
    }

    // Skip empty key attribute as it's handled within "Type of AC"
    if (attributeName === "" && attributeGroup.list) {
      return null;
    }

    const structure = detectAttributeStructure(attributeGroup);

    // Handle different attribute types
    if (structure.primaryType === 'list' && attributeGroup.list) {
      return attributeGroup.list.map((attribute, index) => {
        const options = extractOptions(attribute);
        if (options.length === 0) return null;
        
        return (
          <div key={`${attributeName}-list-${index}`}>
            {renderListAttribute(attributeName, attribute, options)}
          </div>
        );
      });
    }
    
    if (structure.primaryType === 'dropdown' && attributeGroup.dropdown) {
      return attributeGroup.dropdown.map((attribute, index) => {
        const options = extractOptions(attribute);
        if (options.length === 0) return null;
        
        return (
          <div key={`${attributeName}-dropdown-${index}`}>
            {renderDropdownAttribute(attributeName, attribute, options)}
          </div>
        );
      });
    }
    
    if (structure.primaryType === 'search' && attributeGroup.search) {
      return attributeGroup.search.map((attribute, index) => {
        const options = extractOptions(attribute);
        if (options.length === 0) return null;
        
        return (
          <div key={`${attributeName}-search-${index}`}>
            {renderSearchAttribute(attributeName, attribute, options)}
          </div>
        );
      });
    }
    
    // Fallback for unknown structure
    return (
      <div key={attributeName} className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800 text-sm">
          <strong>{attributeName}:</strong> Unsupported attribute structure
        </p>
        <pre className="text-xs text-yellow-600 mt-1 overflow-x-auto">
          {JSON.stringify(attributeGroup, null, 2)}
        </pre>
      </div>
    );
  }, [detectAttributeStructure, extractOptions, renderListAttribute, renderDropdownAttribute, renderSearchAttribute, renderACServiceAttributes]);

  // Memoize the rendered attributes for performance
  const renderedAttributes = useMemo(() => {
    if (!attributes || typeof attributes !== 'object' || Object.keys(attributes).length === 0) {
      return null;
    }

    return Object.keys(attributes).map((attributeName) => {
      const attributeGroup = attributes[attributeName];
      if (!attributeGroup || typeof attributeGroup !== 'object') {
        return null;
      }

      return (
        <div key={attributeName} className="attribute-group">
          {renderAttribute(attributeName, attributeGroup, attributes)}
        </div>
      );
    }).filter(Boolean);
  }, [attributes, renderAttribute]);

  // Don't render if no attributes
  if (!renderedAttributes || renderedAttributes.length === 0) {
    return null;
  }

  return (
    <div className={`dynamic-attribute-selector ${className}`}>
      {renderedAttributes}
    </div>
  );
};

export default DynamicAttributeSelector;
