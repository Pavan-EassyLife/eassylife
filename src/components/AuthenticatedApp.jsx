import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import Home from '../pages/Home';
import Landing from '../pages/Landing';

const AuthenticatedApp = () => {
  console.log('🔄 AuthenticatedApp: Component rendering...');

  const {
    isAuthenticated,
    loading: authLoading,
    initialized
  } = useAuthContext();

  console.log('🔍 AuthenticatedApp: Auth state:', {
    isAuthenticated,
    authLoading,
    initialized
  });

  // Show loading spinner while initializing
  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-palette-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="authenticated"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
        ) : (
          <motion.div
            key="unauthenticated"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Landing />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthenticatedApp;
