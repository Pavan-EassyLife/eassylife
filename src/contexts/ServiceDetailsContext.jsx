import React, { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * ServiceDetailsContext - React Context implementation matching Flutter ServiceDetailBloc
 * 
 * Replicates Flutter ServiceDetailBloc state structure and events:
 * - FetchServiceDetailDataEvent
 * - ToggleTabAttributeSelectionEvent  
 * - ToggleDropDownOptionSelectionEvent
 * - ToggleSearchOptionSelectionEvent
 * - ToggleSegementSelectionEvent
 * - ToggleDateAndTimeSelectionEvent
 * - FetchServiceAboutEvent
 */

// Initial state matching Flutter ServiceDetailBloc
const initialState = {
  // Core service data (Flutter: serviceDetails, serviceDataDetails)
  serviceDetails: null,
  serviceSegments: [], // Flutter: aboutServiceDataList
  subServices: [], // Flutter: subServicesDataList

  // Navigation state (Flutter: serviceIdValue, subServiceIdValue)
  serviceId: null, // Original service ID from URL (Flutter: serviceIdValue)
  subServiceId: null, // Sub-service ID if applicable (Flutter: subServiceIdValue)
  
  // User selections (Flutter: selected* variables)
  selectedAttributes: {}, // Flutter: selectedTabAttribute, selectedOptionsByDropdown, selectedOptionsBySearch
  selectedSegment: null, // Flutter: selectedSegementsId
  selectedDate: null, // Flutter: dateValue
  timeFromValue: null, // Flutter: timeFromValue
  timeToValue: null, // Flutter: timeToValue
  
  // Attribute state (Flutter: attribute lists)
  tabAttributesList: [], // Flutter: tabAttributesList
  dropdownAttributesList: [], // Flutter: dropdownAttributesList
  searchAttributesList: [], // Flutter: searchAttributesList
  
  // UI state
  loading: {
    serviceDetails: false,
    serviceSegments: false,
    subServices: false,
    dateAvailability: false
  },
  error: {
    serviceDetails: null,
    serviceSegments: null,
    subServices: null,
    dateAvailability: null
  },
  
  // Navigation state (Flutter: navigation logic)
  hasSubcategories: false,
  showSubcategorySelection: false,
  
  // Video state (Flutter: videoPlayerWidget state)
  videoUrl: null,
  videoError: false,
  isVideoPlaying: false,
  isMuted: true, // Flutter: controller.setVolume(0)
  
  // Booking state
  availableDates: [],
  availableTimeSlots: [],
  
  // Filter state (Flutter: selectedFilterList)
  selectedFilterList: []
};

// Action types matching Flutter bloc events
const ActionTypes = {
  // Data fetching actions (Flutter: FetchServiceDetailDataEvent)
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SERVICE_DETAILS: 'SET_SERVICE_DETAILS',
  SET_SERVICE_SEGMENTS: 'SET_SERVICE_SEGMENTS',
  SET_SUB_SERVICES: 'SET_SUB_SERVICES',

  // Navigation state actions (Flutter: serviceIdValue, subServiceIdValue)
  SET_SERVICE_ID: 'SET_SERVICE_ID',
  
  // Attribute selection actions (Flutter: Toggle*AttributeSelectionEvent)
  UPDATE_SELECTED_ATTRIBUTES: 'UPDATE_SELECTED_ATTRIBUTES',
  SET_ATTRIBUTE_LISTS: 'SET_ATTRIBUTE_LISTS',
  
  // Segment selection action (Flutter: ToggleSegementSelectionEvent)
  SET_SELECTED_SEGMENT: 'SET_SELECTED_SEGMENT',
  
  // Date/Time selection actions (Flutter: ToggleDateAndTimeSelectionEvent)
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_TIME_FROM_VALUE: 'SET_TIME_FROM_VALUE',
  SET_TIME_TO_VALUE: 'SET_TIME_TO_VALUE',
  SET_AVAILABLE_DATES: 'SET_AVAILABLE_DATES',
  SET_AVAILABLE_TIME_SLOTS: 'SET_AVAILABLE_TIME_SLOTS',
  
  // Video state actions (Flutter: videoPlayerWidget state)
  SET_VIDEO_URL: 'SET_VIDEO_URL',
  SET_VIDEO_ERROR: 'SET_VIDEO_ERROR',
  SET_VIDEO_PLAYING: 'SET_VIDEO_PLAYING',
  SET_VIDEO_MUTED: 'SET_VIDEO_MUTED',
  
  // Navigation actions
  SET_SUBCATEGORY_STATE: 'SET_SUBCATEGORY_STATE',
  
  // Filter actions (Flutter: selectedFilterList)
  UPDATE_FILTER_LIST: 'UPDATE_FILTER_LIST',
  
  // Reset actions
  RESET_STATE: 'RESET_STATE',
  RESET_SELECTIONS: 'RESET_SELECTIONS'
};

// Reducer function matching Flutter bloc state transitions
const serviceDetailsReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.isLoading
        }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.type]: action.payload.error
        }
      };
      
    case ActionTypes.SET_SERVICE_DETAILS:
      return {
        ...state,
        serviceDetails: action.payload,
        videoUrl: action.payload?.serviceVideos?.video_url || null,
        hasSubcategories: action.payload?.subcategories?.length > 0 || false
      };
      
    case ActionTypes.SET_SERVICE_SEGMENTS:
      return {
        ...state,
        serviceSegments: action.payload || []
      };
      
    case ActionTypes.SET_SUB_SERVICES:
      return {
        ...state,
        subServices: action.payload || []
      };

    case ActionTypes.SET_SERVICE_ID:
      return {
        ...state,
        serviceId: action.payload.serviceId,
        subServiceId: action.payload.subServiceId || null
      };

    case ActionTypes.UPDATE_SELECTED_ATTRIBUTES:
      // Handle both legacy (optionId) and new (selectionData) formats
      const { attributeId, optionId, selectionData } = action.payload;

      let updatedAttributes;
      if (selectionData) {
        // New enhanced format with full selection data
        updatedAttributes = {
          ...state.selectedAttributes,
          [attributeId]: selectionData
        };
      } else {
        // Legacy format for backward compatibility
        updatedAttributes = {
          ...state.selectedAttributes,
          [attributeId]: typeof optionId === 'object' ? optionId : { id: optionId }
        };
      }

      // Update filter list (Flutter: selectedFilterList) - handle both formats
      const updatedFilterList = Object.entries(updatedAttributes).map(([attrId, selection]) => {
        const selectionId = selection?.id || selection;
        return {
          attribute_id: attrId,
          option_id: selectionId === 'NA' ? '' : selectionId,
          option_value: selection?.value || '',
          option_data: selection?.data || {}
        };
      });

      return {
        ...state,
        selectedAttributes: updatedAttributes,
        selectedFilterList: updatedFilterList
      };
      
    case ActionTypes.SET_ATTRIBUTE_LISTS:
      return {
        ...state,
        tabAttributesList: action.payload.tabAttributes || [],
        dropdownAttributesList: action.payload.dropdownAttributes || [],
        searchAttributesList: action.payload.searchAttributes || []
      };
      
    case ActionTypes.SET_SELECTED_SEGMENT:
      return {
        ...state,
        selectedSegment: action.payload
      };
      
    case ActionTypes.SET_SELECTED_DATE:
      return {
        ...state,
        selectedDate: action.payload
      };
      
    case ActionTypes.SET_TIME_FROM_VALUE:
      return {
        ...state,
        timeFromValue: action.payload
      };
      
    case ActionTypes.SET_TIME_TO_VALUE:
      return {
        ...state,
        timeToValue: action.payload
      };
      
    case ActionTypes.SET_AVAILABLE_DATES:
      return {
        ...state,
        availableDates: action.payload || []
      };
      
    case ActionTypes.SET_AVAILABLE_TIME_SLOTS:
      return {
        ...state,
        availableTimeSlots: action.payload || []
      };
      
    case ActionTypes.SET_VIDEO_URL:
      return {
        ...state,
        videoUrl: action.payload
      };
      
    case ActionTypes.SET_VIDEO_ERROR:
      return {
        ...state,
        videoError: action.payload
      };
      
    case ActionTypes.SET_VIDEO_PLAYING:
      return {
        ...state,
        isVideoPlaying: action.payload
      };
      
    case ActionTypes.SET_VIDEO_MUTED:
      return {
        ...state,
        isMuted: action.payload
      };
      
    case ActionTypes.SET_SUBCATEGORY_STATE:
      return {
        ...state,
        hasSubcategories: action.payload.hasSubcategories,
        showSubcategorySelection: action.payload.showSubcategorySelection
      };
      
    case ActionTypes.UPDATE_FILTER_LIST:
      return {
        ...state,
        selectedFilterList: action.payload
      };
      
    case ActionTypes.RESET_SELECTIONS:
      return {
        ...state,
        selectedAttributes: {},
        selectedSegment: null,
        selectedDate: null,
        timeFromValue: null,
        timeToValue: null,
        selectedFilterList: []
      };
      
    case ActionTypes.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
};

// Create context
const ServiceDetailsContext = createContext();

/**
 * ServiceDetailsProvider - Context provider component
 * Wraps components that need access to service details state
 */
export const ServiceDetailsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(serviceDetailsReducer, initialState);

  // Action creators (matching Flutter bloc events)
  
  /**
   * Set loading state for specific operation type
   * @param {string} type - Loading type (serviceDetails, serviceSegments, etc.)
   * @param {boolean} isLoading - Loading state
   */
  const setLoading = useCallback((type, isLoading) => {
    dispatch({
      type: ActionTypes.SET_LOADING,
      payload: { type, isLoading }
    });
  }, []);

  /**
   * Set error state for specific operation type
   * @param {string} type - Error type
   * @param {string|null} error - Error message
   */
  const setError = useCallback((type, error) => {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { type, error }
    });
  }, []);

  /**
   * Set service details data (Flutter: FetchServiceDetailDataEvent result)
   * @param {Object} serviceDetails - Service details data
   */
  const setServiceDetails = useCallback((serviceDetails) => {
    dispatch({
      type: ActionTypes.SET_SERVICE_DETAILS,
      payload: serviceDetails
    });
  }, []);

  /**
   * Set service segments data (Flutter: FetchServiceAboutEvent result)
   * @param {Array} segments - Service segments array
   */
  const setServiceSegments = useCallback((segments) => {
    dispatch({
      type: ActionTypes.SET_SERVICE_SEGMENTS,
      payload: segments
    });
  }, []);

  /**
   * Set service ID and sub-service ID (Flutter: serviceIdValue, subServiceIdValue)
   * @param {string} serviceId - Main service ID
   * @param {string} subServiceId - Sub-service ID (optional)
   */
  const setServiceId = useCallback((serviceId, subServiceId = null) => {
    dispatch({
      type: ActionTypes.SET_SERVICE_ID,
      payload: { serviceId, subServiceId }
    });
  }, []);

  /**
   * Update selected attributes (Flutter: ToggleAttributeSelectionEvent)
   * @param {string} attributeId - Attribute ID
   * @param {string|Object} optionIdOrData - Selected option ID (legacy) or selection data object (new)
   * @param {string} optionValue - Optional option value (legacy compatibility)
   * @param {Object} optionData - Optional additional data (legacy compatibility)
   */
  const updateSelectedAttributes = useCallback((attributeId, optionIdOrData, optionValue, optionData) => {
    let payload;

    if (typeof optionIdOrData === 'object' && optionIdOrData !== null) {
      // New format: full selection data object
      payload = { attributeId, selectionData: optionIdOrData };
    } else {
      // Legacy format: individual parameters
      const selectionData = {
        id: optionIdOrData,
        value: optionValue || optionIdOrData,
        data: optionData || {},
        timestamp: Date.now()
      };
      payload = { attributeId, selectionData };
    }

    dispatch({
      type: ActionTypes.UPDATE_SELECTED_ATTRIBUTES,
      payload
    });
  }, []);

  /**
   * Set selected segment (Flutter: ToggleSegementSelectionEvent)
   * @param {Object} segment - Selected segment object
   */
  const setSelectedSegment = useCallback((segment) => {
    console.log('🔍 ServiceDetailsContext: Setting selected segment:', {
      segment,
      segmentId: segment?.id,
      segmentName: segment?.segment_name || segment?.segmentName
    });

    dispatch({
      type: ActionTypes.SET_SELECTED_SEGMENT,
      payload: segment
    });
  }, []);

  /**
   * Set selected date (Flutter: ToggleDateAndTimeSelectionEvent)
   * @param {Date} date - Selected date
   */
  const setSelectedDate = useCallback((date) => {
    dispatch({
      type: ActionTypes.SET_SELECTED_DATE,
      payload: date
    });
  }, []);

  /**
   * Set time from value (Flutter: timeFromValue)
   * @param {string} timeFrom - Time from value
   */
  const setTimeFromValue = useCallback((timeFrom) => {
    dispatch({
      type: ActionTypes.SET_TIME_FROM_VALUE,
      payload: timeFrom
    });
  }, []);

  /**
   * Set time to value (Flutter: timeToValue)
   * @param {string} timeTo - Time to value
   */
  const setTimeToValue = useCallback((timeTo) => {
    dispatch({
      type: ActionTypes.SET_TIME_TO_VALUE,
      payload: timeTo
    });
  }, []);

  /**
   * Set video playing state (Flutter: videoPlayerWidget state)
   * @param {boolean} isPlaying - Video playing state
   */
  const setVideoPlaying = useCallback((isPlaying) => {
    dispatch({
      type: ActionTypes.SET_VIDEO_PLAYING,
      payload: isPlaying
    });
  }, []);

  /**
   * Set video muted state (Flutter: controller.setVolume)
   * @param {boolean} isMuted - Video muted state
   */
  const setVideoMuted = useCallback((isMuted) => {
    dispatch({
      type: ActionTypes.SET_VIDEO_MUTED,
      payload: isMuted
    });
  }, []);

  /**
   * Reset all selections (Flutter: reset selections)
   */
  const resetSelections = useCallback(() => {
    dispatch({
      type: ActionTypes.RESET_SELECTIONS
    });
  }, []);

  /**
   * Reset entire state (Flutter: reset bloc)
   */
  const resetState = useCallback(() => {
    dispatch({
      type: ActionTypes.RESET_STATE
    });
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions (Flutter bloc events)
    setLoading,
    setError,
    setServiceDetails,
    setServiceSegments,
    setServiceId,
    updateSelectedAttributes,
    setSelectedSegment,
    setSelectedDate,
    setTimeFromValue,
    setTimeToValue,
    setVideoPlaying,
    setVideoMuted,
    resetSelections,
    resetState
  };

  return (
    <ServiceDetailsContext.Provider value={contextValue}>
      {children}
    </ServiceDetailsContext.Provider>
  );
};

/**
 * Custom hook to use ServiceDetailsContext
 * @returns {Object} Service details context value
 */
export const useServiceDetailsContext = () => {
  const context = useContext(ServiceDetailsContext);
  if (!context) {
    throw new Error('useServiceDetailsContext must be used within a ServiceDetailsProvider');
  }
  return context;
};

export default ServiceDetailsContext;
