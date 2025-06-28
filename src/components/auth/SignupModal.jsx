import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Clock, ChevronDown, Mail, User, Calendar, Gift, ArrowLeft, Phone } from 'lucide-react';
import { ModernModal } from '../ui/modern-modal';
import { FloatingLabelInput } from '../ui/floating-label-input';
import { FloatingLabelSelect } from '../ui/floating-label-select';
import { AnimatedButton } from '../ui/animated-button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { getPhoneDataWithFallback } from '../../utils/tokenManager';
import { cn } from '../../lib/utils';
import eassylifeLogo from '../../assets/images/eassylife_logo.png';
import loginBackground from '../../assets/images/loginBackground.png';
import googleLogo from '../../assets/images/google_logo.svg';
import facebookLogo from '../../assets/images/facebook_logo.svg';
import appleLogo from '../../assets/images/apple.svg';
import { useNavigate } from 'react-router-dom';

const SignupModal = ({ isOpen, onClose, phoneNumber, onSignupSuccess, onBackToOtp }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    anniversaryDate: '',
    referralCode: '',
  });

  const [agreements, setAgreements] = useState({
    termsAndConditions: false,
    whatsappUpdates: true,
  });
 const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuthContext();
  const { getCurrentLocation, getAddressFromCoordinates } = useLocation();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.gender) newErrors.gender = 'Please select your gender';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setAgreements({
      ...agreements,
      [name]: checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!agreements.termsAndConditions) {
      setErrors({ terms: 'Please agree to the terms and conditions' });
      return;
    }

    // Extract phone number and country code from the phoneNumber prop or storage
    // phoneNumber format: "+919876543210" or "919876543210"
    let finalPhoneNumber = phoneNumber;

    // Fallback to stored phone data if phoneNumber prop is not available
    if (!finalPhoneNumber) {
      const storedPhoneData = getPhoneDataWithFallback();
      if (storedPhoneData) {
        finalPhoneNumber = `+${storedPhoneData.countryCode}${storedPhoneData.phoneNumber}`;
        console.log('📱 SignupModal: Using phone data from storage:', storedPhoneData);
      }
    }

    if (!finalPhoneNumber) {
      setErrors({ phone: 'Phone number is required for registration' });
      return;
    }

    const cleanPhoneNumber = finalPhoneNumber.replace(/^\+/, ''); // Remove + if present
    const countryCode = cleanPhoneNumber.substring(0, cleanPhoneNumber.length - 10); // Extract country code
    const mobile = cleanPhoneNumber.substring(cleanPhoneNumber.length - 10); // Extract mobile number

    console.log('📱 SignupModal - Final phone data:', {
      phoneNumberProp: phoneNumber,
      finalPhoneNumber,
      extractedCountryCode: countryCode,
      extractedMobile: mobile
    });

    // Capture location during signup (Flutter-aligned)
    let signupLocation = 'Web';
    try {
      console.log('🔄 SignupModal: Attempting to capture location during signup...');
      const location = await getCurrentLocation();

      if (location && location.latitude && location.longitude) {
        // Try to get formatted address
        try {
          const addressData = await getAddressFromCoordinates(location.latitude, location.longitude);
          signupLocation = addressData.formattedAddress || `${location.latitude}, ${location.longitude}`;
          console.log('✅ SignupModal: Location captured:', signupLocation);
        } catch (geocodeError) {
          // Fallback to coordinates if geocoding fails
          signupLocation = `${location.latitude}, ${location.longitude}`;
          console.log('⚠️ SignupModal: Geocoding failed, using coordinates:', signupLocation);
        }
      }
    } catch (locationError) {
      console.log('❌ SignupModal: Location capture failed:', locationError.message);
      // Continue with default 'Web' location
    }

    // Prepare data for API (Flutter-aligned payload)
    const signupData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      gender: formData.gender,
      birthdate: formData.dateOfBirth,
      anniversary: formData.anniversaryDate,
      referralCode: formData.referralCode,
      is_whatsapp_checked: agreements.whatsappUpdates,
      signupLocation: signupLocation, // Location captured during signup
      countryCode: countryCode,
      mobile: mobile,
      country_code: countryCode, // Ensure country_code is included
    };

   
    const result = await register(signupData);

    if (result.success && result.data) {
      console.log('✅ Registration successful, AuthContext has updated the state');

      // Close the modal first to prevent auth state reset
      if (onClose) {
        onClose();
      }

      // Navigate to address page after successful registration
      // Use setTimeout to ensure modal close completes first
      setTimeout(() => {
        navigate('/address');
        console.log('✅ Signup successful, redirecting to address page');
      }, 100);

      // Don't call onSignupSuccess to avoid triggering AuthFlowManager's resetAuthState
      // The navigation is handled directly here
    } else {
      console.error('❌ Registration failed:', result.message || 'Unknown error');
      // Error handling is already done in the register function via toast
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`Signing up with ${provider}`);
  };

  const benefits = [
    { icon: Heart, title: 'Trusted Services', description: 'Verified professionals at your doorstep' },
    { icon: Shield, title: 'Secure & Safe', description: 'Your data is protected with us' },
    { icon: Clock, title: 'Quick Booking', description: 'Book services in just a few clicks' }
  ];

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="overflow-hidden max-h-[95vh]"
    >
      <div className="flex flex-col lg:flex-row min-h-[600px] max-h-[95vh]">
        {/* Left side with branding and benefits - Fixed */}
        <motion.div
          className="w-full lg:w-2/5 p-4 lg:p-8 flex flex-col justify-center relative overflow-hidden min-h-[200px] lg:min-h-full flex-shrink-0"
          style={{
            backgroundColor: '#FFA301',
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative z-10 flex flex-col justify-center items-center text-center h-full">
            <motion.img
              src={eassylifeLogo}
              alt="EassyLife Logo"
              className="w-32 lg:w-40 h-auto mx-auto mb-4 lg:mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />

            <motion.h2
              className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 text-center font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Join EassyLife Today
            </motion.h2>

            <div className="space-y-3 lg:space-y-4 max-w-xs mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <benefit.icon className="w-4 h-4 text-palette-orange" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{benefit.title}</h4>
                    <p className="text-gray-600 text-xs">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side with form - Scrollable */}
        <motion.div
          className="w-full lg:w-3/5 bg-white flex flex-col min-h-0 flex-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col h-full min-h-0">
            {/* Header - Fixed */}
            <motion.div
              className="px-4 lg:px-6 pt-4 lg:pt-6 pb-4 flex-shrink-0 border-b border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {onBackToOtp && (
                  <button
                    onClick={onBackToOtp}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="flex-1">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 font-inter">
                    Create Account
                  </h3>
                </div>
              </div>

              {/* Phone Number Display */}
              {phoneNumber && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-3">
                  <Phone className="w-4 h-4 text-palette-orange" />
                  <span className="text-sm text-gray-700">
                    Registering for: <span className="font-semibold">{phoneNumber}</span>
                  </span>
                </div>
              )}

              <p className="text-gray-600 text-sm">
                Complete your profile to get started
              </p>
            </motion.div>

            {/* Scrollable Form Container */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full max-w-md mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FloatingLabelInput
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      icon={User}
                      required
                      error={errors.firstName}
                      className="w-full"
                    />

                    <FloatingLabelInput
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      icon={User}
                      required
                      error={errors.lastName}
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <FloatingLabelInput
                    label="Email (optional)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={Mail}
                    error={errors.email}
                  />

                  {/* Gender Selection */}
                  <FloatingLabelSelect
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    icon={User}
                    required
                    error={errors.gender}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />

                  {/* Date Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FloatingLabelInput
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      icon={Calendar}
                      className="w-full"
                      placeholder=""
                    />

                    <FloatingLabelInput
                      label="Anniversary Date (optional)"
                      name="anniversaryDate"
                      type="date"
                      value={formData.anniversaryDate}
                      onChange={handleInputChange}
                      icon={Calendar}
                      className="w-full"
                      placeholder=""
                    />
                  </div>

                  {/* Referral Code */}
                  <FloatingLabelInput
                    label="Referral Code (optional)"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    icon={Gift}
                  />

                  {/* Agreements */}
                  <div className="space-y-3 sm:space-y-4">
                    <motion.label
                      className="flex items-start gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                      whileHover={{ scale: 1.005 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="relative mt-0.5 flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <input
                          type="checkbox"
                          name="termsAndConditions"
                          checked={agreements.termsAndConditions}
                          onChange={handleCheckboxChange}
                          className="sr-only"
                        />
                        <div className={cn(
                          'w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all duration-300 flex items-center justify-center',
                          'min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px]', // Minimum touch target
                          agreements.termsAndConditions
                            ? 'bg-palette-orange border-palette-orange shadow-sm'
                            : 'border-gray-300 hover:border-palette-orange hover:shadow-sm'
                        )}>
                          {agreements.termsAndConditions && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </motion.svg>
                          )}
                        </div>
                      </motion.div>
                      <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        I accept the{' '}
                        <a href="#" className="text-palette-orange hover:underline font-medium">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-palette-orange hover:underline font-medium">
                          Privacy Policy
                        </a>
                      </span>
                    </motion.label>

                    <motion.label
                      className="flex items-start gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                      whileHover={{ scale: 1.005 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="relative mt-0.5 flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <input
                          type="checkbox"
                          name="whatsappUpdates"
                          checked={agreements.whatsappUpdates}
                          onChange={handleCheckboxChange}
                          className="sr-only"
                        />
                        <div className={cn(
                          'w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all duration-300 flex items-center justify-center',
                          'min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px]', // Minimum touch target
                          agreements.whatsappUpdates
                            ? 'bg-palette-orange border-palette-orange shadow-sm'
                            : 'border-gray-300 hover:border-palette-orange hover:shadow-sm'
                        )}>
                          {agreements.whatsappUpdates && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </motion.svg>
                          )}
                        </div>
                      </motion.div>
                      <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Receive WhatsApp updates about my bookings
                      </span>
                    </motion.label>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {errors.terms && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                      >
                        {errors.terms}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={!agreements.termsAndConditions}
                    className={cn(
                      'w-full min-h-[48px] sm:min-h-[52px]', // Minimum touch target
                      'text-base sm:text-lg font-semibold',
                      'transition-all duration-300 ease-in-out'
                    )}
                  >
                    Create Account
                  </AnimatedButton>

                  {/* Social Login */}
                  <div className="text-center">
                    <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">OR</p>
                    <div className="flex justify-center gap-3 sm:gap-4">
                      {[
                        { logo: googleLogo, name: 'Google' },
                        { logo: facebookLogo, name: 'Facebook' },
                        { logo: appleLogo, name: 'Apple' }
                      ].map((social, index) => (
                        <motion.button
                          key={social.name}
                          type="button"
                          onClick={() => handleSocialSignup(social.name.toLowerCase())}
                          className={cn(
                            'w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center',
                            'hover:bg-gray-200 transition-colors duration-300',
                            'min-w-[48px] min-h-[48px]', // Minimum touch target
                            'shadow-sm hover:shadow-md'
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <img src={social.logo} alt={social.name} className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ModernModal>
  );
};

export default SignupModal;
