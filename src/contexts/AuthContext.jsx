import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getAuthToken,
  getUserData,
  setAuthToken,
  setUserData,
  removeAuthToken,
  setPhoneData,
  getPhoneDataWithFallback,
  removePhoneData,
  isAuthenticated
} from '../utils/tokenManager';
import authService from '../api/services/authService';
import { useToast } from '../components/ui/toast';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  RESET_ERROR: 'RESET_ERROR',
  SET_OTP_SENT: 'SET_OTP_SENT',
  SET_PHONE_NUMBER: 'SET_PHONE_NUMBER',
  SET_COUNTRY_CODE: 'SET_COUNTRY_CODE',
  SET_IS_NEW_USER: 'SET_IS_NEW_USER',
  SET_INITIALIZED: 'SET_INITIALIZED',
  SET_VIP_STATUS: 'SET_VIP_STATUS'
};

// Initial State
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  otpSent: false,
  phoneNumber: '',
  countryCode: '91',
  isNewUser: false,
  initialized: false,
  isVipMember: false
};

// Auth Reducer
const authReducer = (state, action) => {
  console.log('🔄 AuthReducer: Action dispatched:', action.type, action.payload);

  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      console.log('⏳ AuthReducer: Setting loading to:', action.payload);
      return { ...state, loading: action.payload, error: null };

    case AUTH_ACTIONS.SET_AUTHENTICATED:
      console.log('🔐 AuthReducer: Setting authenticated to:', action.payload);
      return {
        ...state,
        isAuthenticated: action.payload,
        loading: false,
        initialized: true
      };

    case AUTH_ACTIONS.SET_USER:
      console.log('👤 AuthReducer: Setting user:', action.payload);
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        initialized: true,
        countryCode: state.countryCode
      };

    case AUTH_ACTIONS.RESET_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_OTP_SENT:
      return { ...state, otpSent: action.payload };

    case AUTH_ACTIONS.SET_PHONE_NUMBER:
      return { ...state, phoneNumber: action.payload };

    case AUTH_ACTIONS.SET_COUNTRY_CODE:
      return { ...state, countryCode: action.payload };

    case AUTH_ACTIONS.SET_IS_NEW_USER:
      return { ...state, isNewUser: action.payload };

    case AUTH_ACTIONS.SET_INITIALIZED:
      return { ...state, initialized: action.payload };

    case AUTH_ACTIONS.SET_VIP_STATUS:
      console.log('👑 AuthReducer: Setting VIP status to:', action.payload);
      return { ...state, isVipMember: action.payload };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showSuccess, showError } = useToast();

  // Initialize auth state from cookies on app load
  useEffect(() => {
    // Prevent duplicate initialization
    if (state.initialized) {
      return;
    }

    console.log('🔄 AuthContext: Initializing auth state...');
    const initializeAuth = () => {
      try {
        const token = getAuthToken();
        const userData = getUserData();

        console.log('🔍 AuthContext: Token exists:', !!token);
        console.log('🔍 AuthContext: User data exists:', !!userData);

        if (token && userData) {
          console.log('✅ AuthContext: Setting authenticated user:', userData);
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
          dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
        } else {
          console.log('❌ AuthContext: No valid token/user data, setting unauthenticated');
          dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: false });
        }

        // Load phone data from storage if available
        const phoneData = getPhoneDataWithFallback();
        if (phoneData) {
          console.log('📱 AuthContext: Restored phone data from storage:', phoneData);
          dispatch({ type: AUTH_ACTIONS.SET_PHONE_NUMBER, payload: phoneData.phoneNumber });
          dispatch({ type: AUTH_ACTIONS.SET_COUNTRY_CODE, payload: phoneData.countryCode });
        }

        // Mark as initialized
        console.log('🏁 AuthContext: Marking as initialized');
        dispatch({ type: AUTH_ACTIONS.SET_INITIALIZED, payload: true });
      } catch (error) {
        console.error('💥 AuthContext: Error initializing auth:', error);
        dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: false });
        dispatch({ type: AUTH_ACTIONS.SET_INITIALIZED, payload: true });
      }
    };

    initializeAuth();
  }, [state.initialized]);

  // Login - Send OTP
  const login = async (phone, country = '91') => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.RESET_ERROR });

    try {
      const result = await authService.sendOTP(country, phone);

      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.SET_PHONE_NUMBER, payload: phone });
        dispatch({ type: AUTH_ACTIONS.SET_COUNTRY_CODE, payload: country });
        dispatch({ type: AUTH_ACTIONS.SET_OTP_SENT, payload: true });

        // Store phone data in localStorage/cookies for persistence
        setPhoneData(phone, country);
        console.log('📱 AuthContext: Phone data stored in localStorage/cookies:', { phone, country });

        showSuccess('OTP sent successfully');
        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.message });
        showError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to send OTP';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Verify OTP
  const verifyOTP = async (otp, phone, country = '91') => {
    console.log('🔄 AuthContext: Starting OTP verification for:', phone || state.phoneNumber);
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.RESET_ERROR });

    try {
      console.log('📞 AuthContext: Calling authService.verifyOTP...');
      const result = await authService.verifyOTP(country, phone || state.phoneNumber, otp);
      console.log('📞 AuthContext: OTP verification result:', result);

      if (result.success && result.data?.token) {
        console.log('✅ AuthContext: EXISTING USER - Login successful');

        // Store token and user data
        setAuthToken(result.data.token);
        setUserData(result.data.user);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: result.data.user });
        dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
        dispatch({ type: AUTH_ACTIONS.SET_IS_NEW_USER, payload: false });

        showSuccess('Login successful');
        return { success: true, isNewUser: false, data: result.data };
      } else if (result.message === 'User not found') {
        // New user - needs registration
        dispatch({ type: AUTH_ACTIONS.SET_IS_NEW_USER, payload: true });
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

        showSuccess('Mobile number verified. Please complete your registration.');
        return { success: true, isNewUser: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.message });
        showError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'OTP verification failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Register new user
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.RESET_ERROR });

    try {
      // Get phone data from storage as fallback
      const phoneData = getPhoneDataWithFallback();
      const finalCountryCode = userData.countryCode || state.countryCode || phoneData?.countryCode;
      const finalMobile = userData.mobile || state.phoneNumber || phoneData?.phoneNumber;

      console.log('📱 AuthContext: Register - Phone data sources:', {
        fromUserData: { countryCode: userData.countryCode, mobile: userData.mobile },
        fromState: { countryCode: state.countryCode, mobile: state.phoneNumber },
        fromStorage: phoneData,
        final: { countryCode: finalCountryCode, mobile: finalMobile }
      });

      const result = await authService.register({
        ...userData,
        countryCode: finalCountryCode,
        mobile: finalMobile,
      });

      if (result.success && result.data?.token) {
        // Store token and user data
        setAuthToken(result.data.token);
        setUserData(result.data.user);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: result.data.user });
        dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
        dispatch({ type: AUTH_ACTIONS.SET_IS_NEW_USER, payload: false });

        // Clean up phone data after successful registration
        removePhoneData();
        console.log('🧹 AuthContext: Phone data cleaned up after successful registration');

        showSuccess('Registration successful');
        return { success: true, data: result.data };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: result.message });
        showError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Simple logout
  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Starting logout process...');

      // Clear authentication tokens and user data
      removeAuthToken();

      // Reset auth state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();

      console.log('✅ AuthContext: Logout completed successfully');
      showSuccess('Logged out successfully');

      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      showError('Error during logout');
      return { success: false, error: error.message };
    }
  };

  // Reset auth state
  const resetAuthState = () => {
    dispatch({ type: AUTH_ACTIONS.SET_OTP_SENT, payload: false });
    dispatch({ type: AUTH_ACTIONS.SET_PHONE_NUMBER, payload: '' });
    dispatch({ type: AUTH_ACTIONS.SET_IS_NEW_USER, payload: false });
    dispatch({ type: AUTH_ACTIONS.RESET_ERROR });
  };

  // Resend OTP
  const resendOTP = async () => {
    if (!state.phoneNumber) {
      showError('Phone number not found');
      return { success: false };
    }

    return await login(state.phoneNumber, state.countryCode);
  };

  // VIP Status Management
  const updateUserVipStatus = (isVip) => {
    console.log('👑 AuthContext: Updating VIP status to:', isVip);
    dispatch({ type: AUTH_ACTIONS.SET_VIP_STATUS, payload: isVip });
  };

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    login,
    verifyOTP,
    register,
    logout,
    resetAuthState,
    resendOTP,

    // VIP Management
    updateUserVipStatus,

    // Utilities
    clearError: () => dispatch({ type: AUTH_ACTIONS.RESET_ERROR }),
    setPhoneNumber: (phone) => dispatch({ type: AUTH_ACTIONS.SET_PHONE_NUMBER, payload: phone }),
    setCountryCode: (code) => dispatch({ type: AUTH_ACTIONS.SET_COUNTRY_CODE, payload: code })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
