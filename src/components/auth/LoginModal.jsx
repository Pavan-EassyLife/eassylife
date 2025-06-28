import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ChevronDown } from 'lucide-react';
import { ModernModal } from '../ui/modern-modal';
import { FloatingLabelInput } from '../ui/floating-label-input';
import { AnimatedButton } from '../ui/animated-button';
import { useAuthContext } from '../../contexts/AuthContext';
import eassylifeLogo from '../../assets/images/eassylife_logo.png';
import loginBackground from '../../assets/images/loginBackground.png';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { login, loading, resetAuthState } = useAuthContext();

  const validatePhoneNumber = (number) => {
    return number.length === 10 && /^\d+$/.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Remove + from country code for API
    const cleanCountryCode = countryCode.replace('+', '');

    const result = await login(phoneNumber, cleanCountryCode, termsAccepted);

    if (result.success) {
      // Pass phone number to parent for OTP verification
      onLoginSuccess(countryCode + phoneNumber);
    }
  };

  const handleClose = () => {
    resetAuthState();
    setPhoneNumber('');
    setCountryCode('+91');
    setTermsAccepted(false);
    onClose();
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      className="overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left side with branding */}
        <motion.div
          className="w-full lg:w-2/5 p-8 flex flex-col justify-center items-center relative overflow-hidden"
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
          <div className="relative z-10 text-center">
            <motion.img
              src={eassylifeLogo}
              alt="EassyLife Logo"
              className="w-48 h-auto mx-auto mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
            <motion.h2
              className="text-2xl font-bold text-gray-800 mb-4 font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Enter Your Number
            </motion.h2>
            <motion.p
              className="text-gray-600 text-sm leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              We will send you SMS with code for registration
            </motion.p>
          </div>
        </motion.div>

        {/* Right side with form */}
        <motion.div
          className="w-full lg:w-3/5 p-8 bg-white flex items-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="w-full max-w-md mx-auto">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-inter">
                Get OTP
              </h3>
              <p className="text-gray-600 text-sm">We'll send you a verification code</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {/* Phone Number Input with Country Code */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-14 pl-4 pr-8 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-orange focus:border-palette-orange transition-all duration-200 ease-in-out appearance-none font-medium"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+86">🇨🇳 +86</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </motion.div>

                  <div className="flex-1">
                    <FloatingLabelInput
                      label="Phone number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      icon={Phone}
                      maxLength={10}
                      required
                      error={''}
                      success={phoneNumber.length === 10 && validatePhoneNumber(phoneNumber) ? 'Valid phone number' : ''}
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <motion.label
                  className="flex items-start gap-3 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="relative mt-1"
                    whileTap={{ scale: 0.9 }}
                  >
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                      termsAccepted
                        ? 'bg-palette-orange border-palette-orange'
                        : 'border-gray-300 hover:border-palette-orange'
                    }`}>
                      {termsAccepted && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </motion.svg>
                      )}
                    </div>
                  </motion.div>
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I accept the{' '}
                    <a href="#" className="text-palette-orange font-medium hover:underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-palette-orange font-medium hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </motion.label>
              </div>

              {/* Error messages are now handled by toast notifications */}

              {/* Submit Button */}
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!phoneNumber || phoneNumber.length < 10 || !termsAccepted}
                className="w-full"
              >
                Continue
              </AnimatedButton>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </ModernModal>
  );
};

export default LoginModal;
