import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, RefreshCw } from 'lucide-react';

/**
 * Empty Cart State Component
 * Matches Flutter empty cart UI with different states for guest vs authenticated users
 * Implements exact behavior from Flutter noCartDataFoundWidgetBuilder
 */
const EmptyCartState = ({ isGuest, onLogin, onExplore, onRefresh }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cart Icon */}
        <motion.div 
          className="mx-auto mb-6 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <ShoppingCart className="h-10 w-10 text-orange-500" />
        </motion.div>

        {/* Title and Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isGuest ? 'Please Login' : 'No Service added to cart'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isGuest
              ? 'Login to view your cart and continue shopping'
              : 'Add some services to get started'
            }
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isGuest ? (
            <motion.button
              onClick={onLogin}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          ) : (
            <motion.button
              onClick={onExplore}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Services
            </motion.button>
          )}

          {/* Refresh Button */}
          <motion.button
            onClick={onRefresh}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmptyCartState;
