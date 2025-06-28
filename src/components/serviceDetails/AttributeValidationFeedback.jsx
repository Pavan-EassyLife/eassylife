import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * AttributeValidationFeedback - User feedback component for attribute validation
 * 
 * Provides visual feedback for:
 * - Required attribute validation
 * - Selection completeness
 * - Error messages
 * - Success states
 */
const AttributeValidationFeedback = ({
  validationErrors = [],
  missingRequiredAttributes = [],
  isReadyForBooking = false,
  showSuccessMessage = false,
  className = "",
  compact = false
}) => {
  
  // Don't render if no validation issues and not showing success
  if (validationErrors.length === 0 && missingRequiredAttributes.length === 0 && !showSuccessMessage) {
    return null;
  }

  // Render compact version for inline display
  if (compact) {
    if (missingRequiredAttributes.length > 0) {
      return (
        <div className={`flex items-center text-red-600 text-sm ${className}`}>
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{missingRequiredAttributes.length} required field{missingRequiredAttributes.length > 1 ? 's' : ''} missing</span>
        </div>
      );
    }
    
    if (isReadyForBooking && showSuccessMessage) {
      return (
        <div className={`flex items-center text-green-600 text-sm ${className}`}>
          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>All required fields completed</span>
        </div>
      );
    }
    
    return null;
  }

  // Full validation feedback
  return (
    <div className={`attribute-validation-feedback ${className}`}>
      {/* Error Messages */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold mb-2">Please complete the following:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Missing Required Attributes */}
      {missingRequiredAttributes.length > 0 && validationErrors.length === 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-orange-800 font-semibold mb-2">Required Selections</h4>
              <p className="text-orange-700 text-sm mb-2">
                Please make selections for the following required attributes:
              </p>
              <ul className="text-orange-700 text-sm space-y-1">
                {missingRequiredAttributes.map((attributeName, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="font-medium">{attributeName}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isReadyForBooking && showSuccessMessage && validationErrors.length === 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-green-800 font-semibold mb-1">Ready to Continue</h4>
              <p className="text-green-700 text-sm">
                All required selections have been made. You can proceed with booking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * AttributeSelectionSummary - Display summary of selected attributes
 */
export const AttributeSelectionSummary = ({
  selectionSummary = [],
  className = "",
  showEmpty = false
}) => {
  if (selectionSummary.length === 0 && !showEmpty) {
    return null;
  }

  if (selectionSummary.length === 0 && showEmpty) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-gray-600 text-sm text-center">No attributes selected</p>
      </div>
    );
  }

  return (
    <div className={`attribute-selection-summary ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Selections</h4>
      <div className="space-y-2">
        {selectionSummary.map((selection, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                {selection.displayName}
              </span>
            </div>
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selection.type === 'list' 
                  ? 'bg-orange-100 text-orange-800'
                  : selection.type === 'dropdown'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {selection.selectedValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AttributeProgressIndicator - Show completion progress
 */
export const AttributeProgressIndicator = ({
  totalAttributes = 0,
  selectedAttributes = 0,
  requiredAttributes = 0,
  selectedRequiredAttributes = 0,
  className = ""
}) => {
  if (totalAttributes === 0) {
    return null;
  }

  const overallProgress = totalAttributes > 0 ? (selectedAttributes / totalAttributes) * 100 : 0;
  const requiredProgress = requiredAttributes > 0 ? (selectedRequiredAttributes / requiredAttributes) * 100 : 100;

  return (
    <div className={`attribute-progress-indicator ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">Selection Progress</span>
        <span className="text-sm text-gray-600">
          {selectedAttributes} of {totalAttributes} selected
        </span>
      </div>
      
      {/* Overall Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>

      {/* Required Progress */}
      {requiredAttributes > 0 && (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Required fields</span>
            <span className="text-xs text-gray-600">
              {selectedRequiredAttributes} of {requiredAttributes} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                requiredProgress === 100 ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${requiredProgress}%` }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttributeValidationFeedback;
