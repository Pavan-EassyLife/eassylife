import { ERROR_MESSAGES } from '../api/config.js';

// Phone number validation
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phoneNumber);
};

// OTP validation
export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Name validation
export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

// Date validation (YYYY-MM-DD format)
export const validateDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Form validation functions
export const validateLoginForm = (phoneNumber, countryCode, termsAccepted) => {
  const errors = {};

  if (!phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!validatePhoneNumber(phoneNumber)) {
    errors.phoneNumber = ERROR_MESSAGES.INVALID_PHONE;
  }

  if (!countryCode) {
    errors.countryCode = 'Country code is required';
  }

  if (!termsAccepted) {
    errors.terms = 'Please accept the Terms of Service and Privacy Policy';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateOTPForm = (otp) => {
  const errors = {};

  if (!otp) {
    errors.otp = 'OTP is required';
  } else if (!validateOTP(otp)) {
    errors.otp = ERROR_MESSAGES.INVALID_OTP;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSignupForm = (formData) => {
  const errors = {};

  if (!formData.firstName || !validateName(formData.firstName)) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!formData.lastName || !validateName(formData.lastName)) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.gender) {
    errors.gender = 'Please select your gender';
  }

  if (formData.birthdate && !validateDate(formData.birthdate)) {
    errors.birthdate = 'Please enter a valid birth date';
  }

  if (formData.anniversary && !validateDate(formData.anniversary)) {
    errors.anniversary = 'Please enter a valid anniversary date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
