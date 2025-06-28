import React from 'react';
import { motion } from 'framer-motion';

/**
 * Cancellation Policy Section Component
 * Exactly matches Flutter cancellation policy implementation (lines 1372-1393)
 * Shows compact cancellation policy text without Learn More link
 */
const CancellationPolicySection = () => {
  // Check if cancellation policy should be shown (matches Flutter constant.SHOW_BOOKING_CANCEL_BUTTON)
  const showCancellationPolicy = import.meta.env.VITE_SHOW_BOOKING_CANCEL_BUTTON === 'true';

  // Don't render if cancellation policy is disabled
  if (!showCancellationPolicy) return null;

  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="bg-gray-100 rounded-2xl p-6">
        {/* Cancellation Policy Title - matches Flutter AppText.semiBold16 */}
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Cancellation Policy
        </h3>

        {/* Cancellation Policy Description - compact layout matching Flutter */}
        <p className="text-sm text-gray-600 leading-relaxed">
          Free cancellations if done more than 3 hours before the service. If professional isn't assigned, a fee will be charged otherwise.
        </p>
      </div>
    </motion.div>
  );
};

export default CancellationPolicySection;
