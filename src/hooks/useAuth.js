import { useState } from 'react';
import authService from '../api/services/authService.js';
import { setAuthToken, setUserData, removeAuthToken, isAuthenticated, getUserData } from '../utils/tokenManager.js';
import { toast } from 'react-hot-toast';
import {
  validateLoginForm,
  validateOTPForm,
  validateSignupForm
} from '../utils/validators.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../api/config.js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [isNewUser, setIsNewUser] = useState(false);
  // Using react-hot-toast for notifications

  // Login - Send OTP
  const login = async (phone, country, termsAccepted) => {
    // Validate form
    const validation = validateLoginForm(phone, country, termsAccepted);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return { success: false, errors: validation.errors };
    }

    setLoading(true);
    try {
      const result = await authService.sendOTP(country, phone);

      if (result.success) {
        // Store phone number and country code for later use in registration
        setPhoneNumber(phone);
        
        setCountryCode(country);
        setOtpSent(true);
        toast.success(SUCCESS_MESSAGES.OTP_SENT);
        return { success: true };
      } else {
        toast.error(result.message || ERROR_MESSAGES.SERVER_ERROR);
        return { success: false, message: result.message };
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otp, phone = phoneNumber, country = countryCode) => {
    // Validate OTP
    const validation = validateOTPForm(otp);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return { success: false, errors: validation.errors };
    }

    setLoading(true);
    try {
      const result = await authService.verifyOTP(country, phone, otp);

      if (result.success=== true) {
        // Existing user - store token and user data
        if (result.data.token) {
          setAuthToken(result.data.token);
        }
        if (result.data.user) {
          setUserData(result.data.user);
        }
        navigate('/address');
        toast.success(SUCCESS_MESSAGES.OTP_VERIFIED);
        setIsNewUser(false);
        return { success: true, data: result.data, isNewUser: false };
      } else {
        // Check if it's a "User not found" error (new user)
        if (result.message === 'User not found') {
          setIsNewUser(true);
          toast.success('Mobile number verified. Please complete your registration.');
          return { success: true, isNewUser: true };
        } else {
          toast.error(result.message || ERROR_MESSAGES.INVALID_OTP);
          return { success: false, message: result.message };
        }
      }
    } catch (error) {
      // Check if error message indicates new user
      if (error.message === 'User not found') {
        setIsNewUser(true);
        toast.success('Mobile number verified. Please complete your registration.');
        return { success: true, isNewUser: true };
      } else {
        toast.error(error.message || ERROR_MESSAGES.INVALID_OTP);
        return { success: false, message: error.message };
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async (phone = phoneNumber, country = countryCode) => {
    setLoading(true);
    try {
      const result = await authService.resendOTP(country, phone);

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.OTP_SENT);
        return { success: true };
      } else {
        toast.error(result.message || ERROR_MESSAGES.SERVER_ERROR);
        return { success: false, message: result.message };
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    // Validate form
    const validation = validateSignupForm(userData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return { success: false, errors: validation.errors };
    }

    setLoading(true);
    try {
      // Use phone number from userData if provided, otherwise fall back to state
      const finalCountryCode = userData.countryCode || countryCode;
      const finalMobile = userData.mobile || phoneNumber;

      // Debug logging
      console.log('Register - phoneNumber from state:', phoneNumber);
      console.log('Register - countryCode from state:', countryCode);
      console.log('Register - userData:', userData);
      console.log('Register - final countryCode:', finalCountryCode);
      console.log('Register - final mobile:', finalMobile);

      const result = await authService.register({
        ...userData,
        countryCode: finalCountryCode,
        mobile: finalMobile,
      });

      // Handle both 'success' and 'status' response formats for backward compatibility
      const isSuccess = result.success || result.status;

      if (isSuccess) {
        // Store token and user data
        if (result.data && result.data.token) {
          setAuthToken(result.data.token);
        }
        if (result.data && result.data.user) {
          setUserData(result.data.user);
        }

        toast.success(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
        return { success: true, data: result.data };
      } else {
        toast.error(result.message || ERROR_MESSAGES.SERVER_ERROR);
        return { success: false, message: result.message };
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    removeAuthToken();
    setOtpSent(false);
    setPhoneNumber('');
    setCountryCode('91');
    toast.success('Logged out successfully');
  };

  // Reset auth state
  const resetAuthState = () => {
    setOtpSent(false);
    setPhoneNumber('');
    setCountryCode('91');
    setIsNewUser(false);
    setLoading(false);
  };

  return {
    loading,
    otpSent,
    phoneNumber,
    countryCode,
    isNewUser,
    login,
    verifyOTP,
    resendOTP,
    register,
    logout,
    resetAuthState,
    isAuthenticated: isAuthenticated(),
    user: getUserData(),
  };
};
