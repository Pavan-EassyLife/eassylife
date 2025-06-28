import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import settingsService from '../api/services/settingsService';

// Settings Context
const SettingsContext = createContext();

// Action types
const SETTINGS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PHONE_NUMBERS: 'SET_PHONE_NUMBERS',
  SET_PRIMARY_PHONE: 'SET_PRIMARY_PHONE',
  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR'
};

// Initial state
const initialState = {
  phoneNumbers: [],
  primaryPhoneNumber: null,
  loading: false,
  error: null,
  initialized: false
};

// Reducer
const settingsReducer = (state, action) => {
  switch (action.type) {
    case SETTINGS_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case SETTINGS_ACTIONS.SET_PHONE_NUMBERS:
      return {
        ...state,
        phoneNumbers: action.payload,
        primaryPhoneNumber: action.payload.length > 0 ? action.payload[0].number : null,
        loading: false,
        error: null,
        initialized: true
      };

    case SETTINGS_ACTIONS.SET_PRIMARY_PHONE:
      return {
        ...state,
        primaryPhoneNumber: action.payload
      };

    case SETTINGS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case SETTINGS_ACTIONS.RESET_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Settings Provider Component
export const SettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Fetch application settings including phone numbers
  const fetchApplicationSettings = useCallback(async () => {
    try {
      dispatch({ type: SETTINGS_ACTIONS.SET_LOADING, payload: true });
      
      console.log('🔧 SettingsContext: Fetching application settings...');
      
      const response = await settingsService.getApplicationSettings();
      
      if (response.success) {
        dispatch({
          type: SETTINGS_ACTIONS.SET_PHONE_NUMBERS,
          payload: response.data.phoneNumbers
        });

        console.log('✅ SettingsContext: Application settings loaded successfully', {
          phoneNumbers: response.data.phoneNumbers,
          primaryPhone: response.data.phoneNumbers[0]?.number
        });
      } else {
        throw new Error(response.error || 'Failed to fetch application settings');
      }
    } catch (error) {
      console.error('❌ SettingsContext: Error fetching application settings:', error);
      dispatch({ 
        type: SETTINGS_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to fetch application settings' 
      });
    }
  }, []);

  // Initialize settings on mount
  useEffect(() => {
    if (!state.initialized) {
      fetchApplicationSettings();
    }
  }, [fetchApplicationSettings, state.initialized]);

  // Format phone number for display
  const formatPhoneNumber = useCallback((phoneNumber) => {
    return settingsService.formatPhoneNumber(phoneNumber);
  }, []);

  // Initiate phone call
  const initiateCall = useCallback((phoneNumber = null) => {
    const numberToCall = phoneNumber || state.primaryPhoneNumber;
    if (numberToCall) {
      settingsService.initiateCall(numberToCall);
    } else {
      console.warn('⚠️ SettingsContext: No phone number available for call');
    }
  }, [state.primaryPhoneNumber]);

  // Get formatted primary phone number
  const getFormattedPrimaryPhone = useCallback(() => {
    return state.primaryPhoneNumber ? formatPhoneNumber(state.primaryPhoneNumber) : null;
  }, [state.primaryPhoneNumber, formatPhoneNumber]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: SETTINGS_ACTIONS.RESET_ERROR });
  }, []);

  // Context value
  const value = {
    // State
    phoneNumbers: state.phoneNumbers,
    primaryPhoneNumber: state.primaryPhoneNumber,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // Computed values
    hasPhoneNumber: !!state.primaryPhoneNumber,
    formattedPrimaryPhone: getFormattedPrimaryPhone(),

    // Actions
    fetchApplicationSettings,
    initiateCall,
    formatPhoneNumber,
    clearError
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
