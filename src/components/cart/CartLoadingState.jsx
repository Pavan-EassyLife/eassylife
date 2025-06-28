import React from 'react';
import { motion } from 'framer-motion';

/**
 * Cart Loading State Component
 * Matches Flutter loading indicator styling and behavior
 */
const CartLoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div 
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
        
        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading your cart...</p>
      </motion.div>
    </div>
  );
};

export default CartLoadingState;
