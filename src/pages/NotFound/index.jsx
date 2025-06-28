import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Phone, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * NotFound - Creative 404 Error Page
 * Provides user-friendly navigation options for both authenticated and unauthenticated users
 */
const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  const handleReturnHome = () => {
    console.log('🏠 NotFound: Return home clicked, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('🏠 NotFound: Navigating to /home');
      navigate('/home');
    } else {
      console.log('🏠 NotFound: Navigating to /');
      navigate('/');
    }
  };

  const handleContactSupport = () => {
    console.log('📞 NotFound: Contact support clicked');
    // You can replace this with your actual support contact method
    const phoneNumber = '+911234567890';
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleGoBack = () => {
    console.log('⬅️ NotFound: Go back clicked');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated 404 Illustration */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            {/* Large 404 Text with Gradient */}
            <motion.h1
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-4"
              style={{
                background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
                backgroundSize: '400% 400%',
                animation: 'gradient 8s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              404
            </motion.h1>


          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for seems to have taken a detour.
          </p>
          <p className="text-base text-gray-500">
            Don't worry, we'll help you get back on track with EassyLife!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          {/* Return Home Button */}
          <button
            onClick={handleReturnHome}
            className="group relative overflow-hidden px-8 py-3 text-white font-semibold rounded-lg transition-all duration-500 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
            style={{
              background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
              backgroundSize: '400% 400%',
              animation: 'gradient 8s ease infinite'
            }}
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              {isAuthenticated ? 'Return to Home' : 'Go to Landing'}
            </div>
          </button>

          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="px-8 py-3 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 rounded-lg cursor-pointer bg-white"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </div>
          </button>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-gray-500 mb-4">
            Still having trouble? We're here to help!
          </p>
          <button
            onClick={handleContactSupport}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-300 px-4 py-2 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Support
            </div>
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-orange-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Global CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
