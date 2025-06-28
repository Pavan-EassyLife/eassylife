import React, { createContext, useContext, useReducer, useCallback } from 'react';
import serviceProviderService from '../api/services/serviceProviderService.js';
import { 
  ServiceProviderStatus, 
  defaultServiceProviderState,
  transformServiceProvidersData,
  isValidProviderSelection
} from '../types/serviceProvider.js';

/**
 * ServiceProviderContext - React Context implementation matching Flutter ServiceProviderBloc
 * 
 * Replicates Flutter ServiceProviderBloc state structure and events:
 * - FetchServiceProviderDataEvent
 * - RefreshServiceProviderDataEvent
 * - ToggleProviderEvent
 * - AddToCartButtonEvent
 * 
 * Flutter Reference:
 * - flutterapp/lib/modules/ServiceProvider/bloc/service_provider_bloc.dart
 * - flutterapp/lib/modules/ServiceProvider/bloc/service_provider_event.dart
 * - flutterapp/lib/modules/ServiceProvider/bloc/service_provider_state.dart
 */

// Action types matching Flutter bloc events
const ActionTypes = {
  // Data fetching actions
  SET_STATUS: 'SET_STATUS',
  SET_ERROR: 'SET_ERROR',
  SET_SERVICE_PROVIDERS: 'SET_SERVICE_PROVIDERS',
  
  // Provider selection actions
  SET_SELECTED_PROVIDER: 'SET_SELECTED_PROVIDER',
  
  // Reset actions
  RESET_STATE: 'RESET_STATE'
};

// Reducer function matching Flutter ServiceProviderBloc state transitions
const serviceProviderReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_STATUS:
      return {
        ...state,
        status: action.payload.status,
        errorMessage: action.payload.status === ServiceProviderStatus.FAILURE ? state.errorMessage : null
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        status: ServiceProviderStatus.FAILURE,
        errorMessage: action.payload.message
      };

    case ActionTypes.SET_SERVICE_PROVIDERS:
      return {
        ...state,
        servicesProvider: action.payload.providers,
        status: ServiceProviderStatus.INITIAL,
        errorMessage: null
      };

    case ActionTypes.SET_SELECTED_PROVIDER:
      return {
        ...state,
        selectedServicesProvider: action.payload.provider
      };

    case ActionTypes.RESET_STATE:
      return {
        ...defaultServiceProviderState
      };

    default:
      return state;
  }
};

// Create context
const ServiceProviderContext = createContext();

/**
 * ServiceProviderProvider - Context provider component
 * Wraps components that need access to service provider state
 */
export const ServiceProviderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(serviceProviderReducer, defaultServiceProviderState);

  // Action creators matching Flutter bloc events

  /**
   * Set loading/error status
   * @param {string} status - ServiceProviderStatus value
   * @param {string|null} errorMessage - Error message if status is failure
   */
  const setStatus = useCallback((status, errorMessage = null) => {
    if (status === ServiceProviderStatus.FAILURE && errorMessage) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: { message: errorMessage }
      });
    } else {
      dispatch({
        type: ActionTypes.SET_STATUS,
        payload: { status }
      });
    }
  }, []);

  /**
   * Fetch service provider data
   * Matches Flutter FetchServiceProviderDataEvent
   * @param {Object} params - Service provider fetch parameters
   */
  const fetchServiceProviderData = useCallback(async (params) => {
    try {
      console.log('🔧 ServiceProviderContext: Starting fetchServiceProviderData...', params);

      // Validate required parameters
      if (!params.catId || !params.subCatId) {
        const errorMsg = 'Category ID and Sub-category ID are required';
        console.error('❌ ServiceProviderContext: Missing required parameters:', params);
        setStatus(ServiceProviderStatus.FAILURE, errorMsg);
        return;
      }

      // Validate service ID format (basic validation for encrypted IDs)
      // Allow test data in development mode
      const isValidId = (id) => {
        if (import.meta.env.DEV && id.startsWith('test-')) {
          return true; // Allow test IDs in development
        }
        return id && typeof id === 'string' && id.length > 5 && /^[a-zA-Z0-9]+$/.test(id);
      };

      if (!isValidId(params.catId) || !isValidId(params.subCatId)) {
        const errorMsg = 'Invalid service ID format. Please try again from the home page.';
        console.error('❌ ServiceProviderContext: Invalid service ID format:', params);
        setStatus(ServiceProviderStatus.FAILURE, errorMsg);
        return;
      }

      // Set initial loading state (matches Flutter emit(state.copyWith(status: ServiceProviderStatus.initial)))
      setStatus(ServiceProviderStatus.INITIAL);

      // Set services provider loading state (matches Flutter emit(state.copyWith(status: ServiceProviderStatus.servicesProviderLoading)))
      setStatus(ServiceProviderStatus.SERVICES_PROVIDER_LOADING);

      // Call API service (matches Flutter apiValue.getServiceProvider)
      const response = await serviceProviderService.getServiceProviders(params);

      if (response.success) {
        // Transform data to match Flutter model structure
        const providers = transformServiceProvidersData(response.data);
        
        console.log('🔧 ServiceProviderContext: Service providers fetched successfully:', {
          count: providers.length,
          providers: providers.slice(0, 2) // Log first 2 for debugging
        });

        // Update state with providers (matches Flutter emit(state.copyWith(servicesProvider: serviceProviders, status: ServiceProviderStatus.initial)))
        dispatch({
          type: ActionTypes.SET_SERVICE_PROVIDERS,
          payload: { providers }
        });

        // Reset loading status to initial (matches Flutter ServiceProviderStatus.initial)
        setStatus(ServiceProviderStatus.INITIAL);
      } else {
        console.error('❌ ServiceProviderContext: Failed to fetch service providers:', response.message);
        setStatus(ServiceProviderStatus.FAILURE, response.message);
      }
    } catch (error) {
      console.error('❌ ServiceProviderContext: Error in fetchServiceProviderData:', error);
      setStatus(ServiceProviderStatus.FAILURE, error.message || 'Failed to fetch service providers');
    }
  }, [setStatus]);

  /**
   * Refresh service provider data
   * Matches Flutter RefreshServiceProviderDataEvent
   * @param {Object} params - Service provider fetch parameters
   */
  const refreshServiceProviderData = useCallback(async (params) => {
    console.log('🔄 ServiceProviderContext: Refreshing service provider data...');
    await fetchServiceProviderData(params);
  }, [fetchServiceProviderData]);

  /**
   * Toggle provider selection
   * Matches Flutter ToggleProviderEvent
   * @param {Object} provider - Selected provider
   * @param {string} serviceName - Service name for analytics
   * @param {string} subServiceName - Sub-service name for analytics
   * @param {Array} filterList - Filter list for analytics
   */
  const toggleProvider = useCallback((provider, serviceName, subServiceName, filterList) => {
    console.log('🔄 ServiceProviderContext: Toggling provider selection:', {
      providerId: provider?.id,
      providerName: provider?.provider?.firstName,
      serviceName,
      subServiceName
    });

    // Update selected provider (matches Flutter emit(state.copyWith(selectedServicesProvider: event.selectedProvider)))
    dispatch({
      type: ActionTypes.SET_SELECTED_PROVIDER,
      payload: { provider }
    });

    // TODO: Add analytics event (matches Flutter AppEventsHelper.onProviderClickEvent)
    // This would be implemented when analytics service is available
  }, []);

  /**
   * Add to cart button action
   * Matches Flutter AddToCartButtonEvent
   * @param {Object} params - Add to cart parameters
   */
  const addToCartButton = useCallback(async (params) => {
    try {
      console.log('🛒 ServiceProviderContext: Starting add to cart...', params);

      // Validate selected provider
      if (!isValidProviderSelection(state.selectedServicesProvider)) {
        const errorMessage = 'Please select a provider';
        console.error('❌ ServiceProviderContext: No provider selected');
        setStatus(ServiceProviderStatus.FAILURE, errorMessage);
        return { success: false, message: errorMessage };
      }

      // Set button loading state (matches Flutter emit(state.copyWith(status: ServiceProviderStatus.buttonLoading)))
      setStatus(ServiceProviderStatus.BUTTON_LOADING);

      // Call add to cart API (matches Flutter apiValue.addToCartService)
      const response = await serviceProviderService.addToCart(params);

      if (response.success) {
        console.log('🛒 ServiceProviderContext: Add to cart successful');
        
        // Set success state (matches Flutter emit(state.copyWith(status: ServiceProviderStatus.addToCartConfirmed)))
        setStatus(ServiceProviderStatus.ADD_TO_CART_CONFIRMED);

        // TODO: Add analytics events (matches Flutter AppEventsHelper calls)
        // This would be implemented when analytics service is available

        return { success: true, message: response.message };
      } else {
        console.error('❌ ServiceProviderContext: Add to cart failed:', response.message);
        setStatus(ServiceProviderStatus.FAILURE, response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('❌ ServiceProviderContext: Error in addToCartButton:', error);
      const errorMessage = error.message || 'Failed to add to cart';
      setStatus(ServiceProviderStatus.FAILURE, errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [state.selectedServicesProvider, setStatus]);

  /**
   * Reset state to initial values
   */
  const resetState = useCallback(() => {
    console.log('🔄 ServiceProviderContext: Resetting state...');
    dispatch({ type: ActionTypes.RESET_STATE });
  }, []);

  // Context value
  const value = {
    // State (matches Flutter ServiceProviderState)
    servicesProvider: state.servicesProvider,
    selectedServicesProvider: state.selectedServicesProvider,
    status: state.status,
    errorMessage: state.errorMessage,

    // Computed values
    isLoading: state.status === ServiceProviderStatus.SERVICES_PROVIDER_LOADING,
    isButtonLoading: state.status === ServiceProviderStatus.BUTTON_LOADING,
    isAddToCartConfirmed: state.status === ServiceProviderStatus.ADD_TO_CART_CONFIRMED,
    hasError: state.status === ServiceProviderStatus.FAILURE,
    hasProviders: state.servicesProvider.length > 0,

    // Actions (matches Flutter bloc events)
    fetchServiceProviderData,
    refreshServiceProviderData,
    toggleProvider,
    addToCartButton,
    resetState,
    setStatus
  };

  return (
    <ServiceProviderContext.Provider value={value}>
      {children}
    </ServiceProviderContext.Provider>
  );
};

/**
 * Hook to use ServiceProvider context
 * @returns {Object} ServiceProvider context value
 */
export const useServiceProvider = () => {
  const context = useContext(ServiceProviderContext);
  if (!context) {
    throw new Error('useServiceProvider must be used within a ServiceProviderProvider');
  }
  return context;
};

export default ServiceProviderContext;
