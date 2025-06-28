import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * NotificationSettings - Simplified notification preferences matching Flutter app exactly
 * Only shows WhatsApp Notifications, Service Alert, and Marketing Updates
 */
const NotificationSettings = ({
  notifications = {},
  onUpdate,
  saving = false,
  className = ''
}) => {
  // Simple local state for demo purposes
  const [preferences, setPreferences] = React.useState({
    is_whatsapp_checked: true,
    service_update: true,
    marketing_update: false
  });

  const [updating, setUpdating] = React.useState(false);

  // Calculate if all notifications are enabled
  const isAllEnabled = preferences.is_whatsapp_checked && preferences.service_update && preferences.marketing_update;

  // Handle All toggle
  const handleAllToggle = async () => {
    setUpdating(true);
    const newValue = !isAllEnabled;
    setPreferences({
      is_whatsapp_checked: newValue,
      service_update: newValue,
      marketing_update: newValue
    });

    // Simulate API call
    setTimeout(() => {
      setUpdating(false);
      console.log('All notifications toggled to:', newValue);
    }, 500);
  };

  // Handle Service Alert toggle
  const handleServiceAlertToggle = async () => {
    setUpdating(true);
    const newValue = !preferences.service_update;
    setPreferences(prev => ({
      ...prev,
      service_update: newValue
    }));

    // Simulate API call
    setTimeout(() => {
      setUpdating(false);
      console.log('Service alerts toggled to:', newValue);
    }, 500);
  };

  // Handle Marketing Updates toggle
  const handleMarketingToggle = async () => {
    setUpdating(true);
    const newValue = !preferences.marketing_update;
    setPreferences(prev => ({
      ...prev,
      marketing_update: newValue
    }));

    // Simulate API call
    setTimeout(() => {
      setUpdating(false);
      console.log('Marketing updates toggled to:', newValue);
    }, 500);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden m-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
        {/* WhatsApp Notifications Header - Enhanced with animation */}
        <motion.div
          className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 via-orange-100/50 to-orange-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageSquare className="w-5 h-5 text-orange-500" />
            </motion.div>
            WhatsApp Notifications
          </h3>
        </motion.div>

        {/* All Toggle - Enhanced with hover effects */}
        <motion.div
          className="px-6 py-5 hover:bg-gray-50/50 transition-colors duration-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between min-h-[44px]">
            <span className="text-base font-medium text-gray-900 flex-1">All</span>
            <div className="flex-shrink-0">
              <ToggleSwitch
                enabled={isAllEnabled}
                onChange={handleAllToggle}
                disabled={updating}
              />
            </div>
          </div>
        </motion.div>

        {/* Divider - Animated */}
        <motion.div
          className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        ></motion.div>

        {/* Individual Toggles - Staggered animation */}
        <motion.div
          className="px-6 py-5 space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {/* Service Alert */}
          <motion.div
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-200 min-h-[60px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <span className="text-base font-medium text-gray-900 flex-1 pr-4">Service Alert</span>
            <div className="flex-shrink-0">
              <ToggleSwitch
                enabled={preferences.service_update}
                onChange={handleServiceAlertToggle}
                disabled={updating}
              />
            </div>
          </motion.div>

          {/* Marketing Updates */}
          <motion.div
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-200 min-h-[60px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <span className="text-base font-medium text-gray-900 flex-1 pr-4">Marketing Updates</span>
            <div className="flex-shrink-0">
              <ToggleSwitch
                enabled={preferences.marketing_update}
                onChange={handleMarketingToggle}
                disabled={updating}
              />
            </div>
          </motion.div>
        </motion.div>
    </motion.div>
  );
};

/**
 * ToggleSwitch - Enhanced mobile app style toggle switch with smooth animations
 * Fixed size, non-responsive toggle switch with consistent dimensions and better UX
 */
const ToggleSwitch = ({ enabled, onChange, disabled = false }) => {
  const toggleStyle = {
    width: '44px',
    height: '24px',
    minWidth: '44px',
    minHeight: '24px',
    maxWidth: '44px',
    maxHeight: '24px',
    flexShrink: 0
  };

  const thumbStyle = {
    width: '16px',
    height: '16px',
    minWidth: '16px',
    minHeight: '16px',
    maxWidth: '16px',
    maxHeight: '16px',
    flexShrink: 0
  };

  return (
    <motion.button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-2xl transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        ${enabled
          ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg'
          : 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
      `}
      style={toggleStyle}
      aria-pressed={enabled}
      role="switch"
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.span
        className="inline-block rounded-full bg-white shadow-lg border border-gray-200/50"
        style={thumbStyle}
        animate={{
          x: enabled ? 20 : 4,
          boxShadow: enabled
            ? '0 4px 12px rgba(34, 197, 94, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      />

      {/* Subtle glow effect when enabled */}
      {enabled && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-green-400 opacity-20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
};

export default NotificationSettings;
