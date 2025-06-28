import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, RotateCcw, Check } from 'lucide-react';
import { ModernModal } from '../ui/modern-modal';
import { AnimatedButton } from '../ui/animated-button';
import { useAuthContext } from '../../contexts/AuthContext';
import eassylifeLogo from '../../assets/images/eassylife_logo.png';
import loginBackground from '../../assets/images/loginBackground.png';

const OtpVerificationModal = ({ isOpen, onClose, onVerificationSuccess, onNewUserRegistration }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
  const successTimeoutRef = useRef(null);
  const { verifyOTP, resendOTP, loading, phoneNumber, countryCode } = useAuthContext();

  // Debug logging
  console.log('OTP Modal - phoneNumber from context:', phoneNumber);
  console.log('OTP Modal - countryCode from context:', countryCode);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimer(30);
      setIsTimerActive(true);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccess(false);
      // Focus on first input field after a short delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 500);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Set up timer
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Format timer as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return;

    const pastedOtp = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];

    pastedOtp.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex].focus();
    } else {
      inputRefs.current[5].focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');

    const result = await verifyOTP(otpValue, phoneNumber, countryCode);

    if (result.success) {
      setSuccess(true);
      // Show success message for 1.5 seconds before proceeding
      successTimeoutRef.current = setTimeout(() => {
        if (result.isNewUser) {
          // New user - go to registration (like Flutter: goToRegister)
          onNewUserRegistration();
        } else {
          // Existing user - go to home (like Flutter: goToHome)
          onVerificationSuccess(result);
        }
      }, 1500);
    } else {
      setError(result.message || 'Invalid OTP. Please try again.');
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    const result = await resendOTP();

    if (result.success) {
      setTimer(30);
      setIsTimerActive(true);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
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
            <motion.div
              className="w-16 h-16 bg-palette-orange rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
            >
              <Phone className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-gray-800 mb-4 font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Verify Your Number
            </motion.h2>
            <motion.p
              className="text-gray-600 text-sm leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              We've sent a 6-digit verification code to{' '}
              <span className="font-semibold text-palette-orange">+{countryCode}{phoneNumber}</span>
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
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-inter">Enter Verification Code</h3>
              <p className="text-gray-600 text-sm">Enter the 6-digit code we sent to your phone</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  >
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-10 h-12 text-center bg-white border-2 rounded-lg text-lg font-bold transition-all duration-200 focus:outline-none ${
                        digit
                          ? 'border-palette-orange bg-palette-beige3'
                          : error
                            ? 'border-red-500'
                            : 'border-gray-300 focus:border-palette-orange'
                      }`}
                      maxLength={1}
                      autoComplete="one-time-code"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-base font-medium"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                    Verification successful! Redirecting...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer and Resend */}
              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                {isTimerActive ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-palette-orange rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-medium">
                      Resend code in <span className="text-palette-orange font-bold">{formatTime()}</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-gray-600 text-sm">
                      You can now resend the code
                    </p>
                  </div>
                )}

                <motion.button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isTimerActive}
                  className={`flex items-center gap-2 mx-auto font-medium transition-all duration-200 ${
                    isTimerActive
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-palette-orange hover:underline cursor-pointer'
                  }`}
                  whileHover={!isTimerActive ? { scale: 1.05 } : {}}
                  whileTap={!isTimerActive ? { scale: 0.95 } : {}}
                >
                  <RotateCcw className={`w-4 h-4 ${isTimerActive ? 'text-gray-400' : 'text-palette-orange'}`} />
                  Resend Code
                </motion.button>
              </motion.div>

              {/* Submit Button */}
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                success={success}
                disabled={otp.join('').length !== 6}
                className="w-full"
              >
                {success ? 'Verified!' : 'Verify Code'}
              </AnimatedButton>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </ModernModal>
  );
};

export default OtpVerificationModal;
