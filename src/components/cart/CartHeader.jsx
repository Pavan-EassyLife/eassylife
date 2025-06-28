import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Cart Header Component
 * Matches Flutter cart header with back navigation and title
 * Implements exact styling and behavior from Flutter app
 */
const CartHeader = ({ onBack }) => {
  return (
    <motion.div
      className="bg-white shadow-sm border-b sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* EXISTING Mobile Layout - COMPLETELY UNCHANGED */}
      <div className="flex items-center justify-between h-16 px-4 min-[768px]:hidden">
        <div className="flex items-center">
          {/* Back Button */}
          <motion.button
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </motion.button>

          {/* Title */}
          <h1 className="text-lg font-semibold text-gray-900">Cart Summary</h1>
        </div>
      </div>

      {/* NEW WebView/TabletView Layout - ADDITIVE ONLY */}
      <div className="hidden min-[768px]:block">
        <div className="cart-desktop-header">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <motion.button
                onClick={onBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </motion.button>
              <h1 className="text-xl font-semibold text-gray-900">Cart Summary</h1>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartHeader;
