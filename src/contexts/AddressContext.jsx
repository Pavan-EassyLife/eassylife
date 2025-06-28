import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import addressService from '../api/services/addressService';
import { useToast } from '../components/ui/toast';
import {
  getPrimaryAddress,
  setPrimaryAddress,
  removePrimaryAddress,
} from '../utils/tokenManager';

// Address Context
const AddressContext = createContext();

// Address Actions
const ADDRESS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ADDRESSES: 'SET_ADDRESSES',
  SET_PRIMARY_ADDRESS: 'SET_PRIMARY_ADDRESS',
  SET_FORMATTED_ADDRESS: 'SET_FORMATTED_ADDRESS',
  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR',
  CLEAR_ADDRESSES: 'CLEAR_ADDRESSES'
};

// Initial State
const initialState = {
  addresses: [],
  primaryAddress: null,
  formattedAddress: null,
  loading: false,
  error: null
};

// Address Reducer
const addressReducer = (state, action) => {
  console.log('🏠 AddressReducer: Action dispatched:', action.type, action.payload);

  switch (action.type) {
    case ADDRESS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };

    case ADDRESS_ACTIONS.SET_ADDRESSES:
      return { ...state, addresses: action.payload, loading: false };

    case ADDRESS_ACTIONS.SET_PRIMARY_ADDRESS:
      // Store primary address in cookies when it's set
      if (action.payload) {
        const addressForCookie = {
          id: action.payload.id,
          formattedAddress: action.payload.formattedAddress ||
            `${action.payload.flatNo || ''} ${action.payload.buildingName || ''} ${action.payload.streetAddress || ''} ${action.payload.city || ''} ${action.payload.state || ''} ${action.payload.postalCode || ''}`.trim(),
          coordinates: {
            latitude: action.payload.latitude,
            longitude: action.payload.longitude
          },
          placeId: action.payload.placeId || null
        };
        setPrimaryAddress(addressForCookie);
        console.log('🍪 AddressReducer: Primary address stored in cookies:', addressForCookie);
      } else {
        removePrimaryAddress();
        console.log('🗑️ AddressReducer: Primary address removed from cookies');
      }
      return { ...state, primaryAddress: action.payload, loading: false };

    case ADDRESS_ACTIONS.SET_FORMATTED_ADDRESS:
      return { ...state, formattedAddress: action.payload };

    case ADDRESS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ADDRESS_ACTIONS.RESET_ERROR:
      return { ...state, error: null };

    case ADDRESS_ACTIONS.CLEAR_ADDRESSES:
      removePrimaryAddress();
      return { ...initialState };

    default:
      return state;
  }
};

// Address Provider Component
export const AddressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(addressReducer, initialState);
  const { isAuthenticated, user } = useAuthContext();
  const { showSuccess, showError } = useToast();

  // Fetch all addresses
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('⚠️ AddressContext: User not authenticated, skipping address fetch');
      return { success: false, message: 'User not authenticated' };
    }

    dispatch({ type: ADDRESS_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ADDRESS_ACTIONS.RESET_ERROR });

    try {
      console.log('🔄 AddressContext: Fetching addresses...');
      const result = await addressService.getAndSetPrimaryAddress();

      if (result.success) {
        console.log('✅ AddressContext: Addresses fetched successfully:', result);
        dispatch({ type: ADDRESS_ACTIONS.SET_ADDRESSES, payload: result.data });
        dispatch({ type: ADDRESS_ACTIONS.SET_PRIMARY_ADDRESS, payload: result.primaryAddress });
        dispatch({ type: ADDRESS_ACTIONS.SET_FORMATTED_ADDRESS, payload: result.formattedAddress });
        return result;
      } else {
        console.log('❌ AddressContext: No addresses found');
        dispatch({ type: ADDRESS_ACTIONS.SET_ADDRESSES, payload: [] });
        dispatch({ type: ADDRESS_ACTIONS.SET_PRIMARY_ADDRESS, payload: null });
        dispatch({ type: ADDRESS_ACTIONS.SET_FORMATTED_ADDRESS, payload: null });
        return { success: false, message: 'No addresses found' };
      }
    } catch (error) {
      console.error('💥 AddressContext: Error fetching addresses:', error);
      const errorMessage = error.message || 'Failed to fetch addresses';
      dispatch({ type: ADDRESS_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [isAuthenticated, showError]);

  // Load addresses when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 AddressContext: User authenticated, fetching addresses...');
      fetchAddresses();
    } else {
      // Clear addresses when user is not authenticated
      console.log('🔄 AddressContext: User not authenticated, clearing addresses...');
      dispatch({ type: ADDRESS_ACTIONS.CLEAR_ADDRESSES });
    }
  }, [isAuthenticated, user]); // Remove fetchAddresses dependency to prevent infinite re-renders

  // Add new address
  const addAddress = async (addressData) => {
    if (!isAuthenticated) {
      const errorMessage = 'User not authenticated';
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }

    dispatch({ type: ADDRESS_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ADDRESS_ACTIONS.RESET_ERROR });

    try {
      console.log('🔄 AddressContext: Adding new address:', addressData);
      const result = await addressService.addAddress(addressData);

      if (result.success) {
        console.log('✅ AddressContext: Address added successfully');
        showSuccess('Address added successfully');

        // Refresh addresses to get updated list
        await fetchAddresses();
        return result;
      } else {
        const errorMessage = result.message || 'Failed to add address';
        dispatch({ type: ADDRESS_ACTIONS.SET_ERROR, payload: errorMessage });
        showError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('💥 AddressContext: Error adding address:', error);
      const errorMessage = error.message || 'Failed to add address';
      dispatch({ type: ADDRESS_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Set primary address
  const setPrimary = async (addressId) => {
    if (!isAuthenticated) {
      const errorMessage = 'User not authenticated';
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }

    dispatch({ type: ADDRESS_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ADDRESS_ACTIONS.RESET_ERROR });

    try {
      console.log('🔄 AddressContext: Setting primary address:', addressId);
      const result = await addressService.setPrimaryAddress(addressId);

      if (result.success) {
        console.log('✅ AddressContext: Primary address set successfully');
        showSuccess('Primary address updated');

        // Refresh addresses to get updated primary address
        await fetchAddresses();
        return result;
      } else {
        const errorMessage = result.message || 'Failed to set primary address';
        dispatch({ type: ADDRESS_ACTIONS.SET_ERROR, payload: errorMessage });
        showError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('💥 AddressContext: Error setting primary address:', error);
      const errorMessage = error.message || 'Failed to set primary address';
      dispatch({ type: ADDRESS_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Helper functions for header compatibility
  const getDisplayAddress = () => {
    if (!state.primaryAddress) {
      return 'Select Address';
    }
    // Use the formatted address from API response first, then fallback to primary address formatted address
    const fullAddress = state.formattedAddress || state.primaryAddress.formattedAddress || 'Selected Address';

    // For mobile display, show more comprehensive address (up to 2 lines)
    if (fullAddress === 'Select Address' || fullAddress === 'Selected Address') {
      return fullAddress;
    }

    // Split address into parts and show meaningful information
    const parts = fullAddress.split(',').map(part => part.trim());
    if (parts.length > 3) {
      // Show first 3-4 parts for better context (flat, building, area, city)
      return parts.slice(0, 4).join(', ');
    }

    return fullAddress;
  };

  const getShortDisplayAddress = () => {
    const fullAddress = getDisplayAddress();
    if (fullAddress === 'Select Address') {
      return fullAddress;
    }

    // Extract main area/locality for mobile display
    const parts = fullAddress.split(',');
    if (parts.length > 1) {
      // Show first 2 parts (area, city) for mobile
      const shortAddress = parts.slice(0, 2).join(', ').trim();
      if (shortAddress.length > 25) {
        return shortAddress.substring(0, 22) + '...';
      }
      return shortAddress;
    }

    // Fallback: truncate long addresses for mobile
    if (fullAddress.length > 25) {
      return fullAddress.substring(0, 22) + '...';
    }

    return fullAddress;
  };

  const hasSelectedAddress = () => {
    return !!state.primaryAddress;
  };

  const updateSelectedAddress = (address) => {
    // For compatibility with header component
    console.log('📍 AddressContext: updateSelectedAddress called with:', address);
    // This would typically update a selected address for search functionality
    // For now, we'll just log it since we're using primary address from API
  };

  // Context value
  const value = {
    // State
    ...state,

    // Computed values
    hasAddress: !!state.primaryAddress,
    formattedAddress: state.primaryAddress?.formattedAddress || null,

    // Actions
    fetchAddresses,
    addAddress,
    setPrimary,

    // Header compatibility functions
    getDisplayAddress,
    getShortDisplayAddress,
    hasSelectedAddress,
    updateSelectedAddress,

    // Utilities
    clearError: () => dispatch({ type: ADDRESS_ACTIONS.RESET_ERROR })
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};

// Custom hook to use address context
export const useAddressContext = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddressContext must be used within an AddressProvider');
  }
  return context;
};

export default AddressContext;
