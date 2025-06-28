import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import OtpVerificationModal from './OtpVerificationModal';
import SignupModal from './SignupModal';
import { useAuthContext } from '../../contexts/AuthContext';

const AuthFlowManager = ({ isOpen, onClose, onAuthSuccess, initialStep = 'login' }) => {
  console.log('🔄 AuthFlowManager: Component rendering with props:', {
    isOpen,
    initialStep,
    hasOnClose: !!onClose,
    hasOnAuthSuccess: !!onAuthSuccess
  });

  const [currentStep, setCurrentStep] = useState(initialStep);
  const { resetAuthState } = useAuthContext();

  // Update current step when initialStep changes
  useEffect(() => {
    console.log('🔄 AuthFlowManager: initialStep changed to:', initialStep);
    setCurrentStep(initialStep);
  }, [initialStep]);

  // Handle login success (OTP sent)
  const handleLoginSuccess = () => {
    console.log('✅ AuthFlowManager: Login success, moving to OTP step');
    setCurrentStep('otp');
  };

  // Handle OTP verification success
  const handleOtpVerificationSuccess = async (result) => {
    console.log('✅ AuthFlowManager: OTP verification success:', result);
    if (result.isNewUser) {
      // New user - show signup form
      console.log('👤 AuthFlowManager: New user detected, moving to signup step');
      setCurrentStep('signup');
    } else {
      // Existing user - authentication complete
      console.log('👤 AuthFlowManager: Existing user, closing modal and calling onAuthSuccess');
      // Small delay to ensure success animation completes before closing
      setTimeout(() => {
        handleClose();
        if (onAuthSuccess) {
          console.log('🔄 AuthFlowManager: Calling onAuthSuccess callback');
          // Pass login flag to indicate this is an existing user login
          onAuthSuccess('login');
        }
      }, 200);
    }
  };

  // Handle new user registration flow
  const handleNewUserRegistration = () => {
    setCurrentStep('signup');
  };

  // Handle signup success (Flutter-aligned: redirect to address setup)
  const handleSignupSuccess = async () => {
    // Registration complete - close modal and trigger success callback
    console.log('✅ AuthFlowManager: Signup success, closing modal');
    // Small delay to ensure success animation completes before closing
    setTimeout(() => {
      handleClose();
      if (onAuthSuccess) {
        console.log('🔄 AuthFlowManager: Calling onAuthSuccess callback after signup');
        // Pass signup flag to indicate this is a new user signup
        onAuthSuccess('signup');
      }
    }, 200);
  };

  // Handle modal close
  const handleClose = () => {
    console.log('🔄 AuthFlowManager: Closing modal and resetting state');
    resetAuthState();
    setCurrentStep('login');
    console.log('🔄 AuthFlowManager: Calling onClose callback');
    onClose();
  };

  // Handle back navigation
  const handleBackToLogin = () => {
    setCurrentStep('login');
  };

  const handleBackToOtp = () => {
    setCurrentStep('otp');
  };

  return (
    <>
      {/* Login Modal */}
      <LoginModal
        isOpen={isOpen && currentStep === 'login'}
        onClose={handleClose}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOpen && currentStep === 'otp'}
        onClose={handleClose}
        onVerificationSuccess={handleOtpVerificationSuccess}
        onNewUserRegistration={handleNewUserRegistration}
        onBackToLogin={handleBackToLogin}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={isOpen && currentStep === 'signup'}
        onClose={handleClose}
        onSignupSuccess={handleSignupSuccess}
        onBackToOtp={handleBackToOtp}
      />
    </>
  );
};

export default AuthFlowManager;
