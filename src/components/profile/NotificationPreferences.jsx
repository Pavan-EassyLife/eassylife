import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageCircle, Megaphone, Shield, Loader2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications.js';

/**
 * NotificationToggle - Individual toggle switch component
 */
const NotificationToggle = ({ 
  id,
  label, 
  description, 
  icon: Icon,
  enabled, 
  onChange, 
  disabled = false,
  loading = false
}) => {
  const handleToggle = () => {
    if (!disabled && !loading && onChange) {
      onChange(!enabled);
    }
  };

  return (
    <motion.div
      className={`
        flex items-center justify-between p-4 rounded-lg border transition-all duration-300
        ${enabled 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
      `}
      onClick={handleToggle}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      <div className="flex items-start space-x-3 flex-1">
        <div className={`
          p-2 rounded-lg transition-colors duration-300
          ${enabled 
            ? 'bg-green-100 text-green-600' 
            : 'bg-gray-200 text-gray-500'
          }
        `}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`
            text-sm font-medium transition-colors duration-300
            ${enabled ? 'text-gray-900' : 'text-gray-600'}
          `}>
            {label}
          </h4>
          <p className={`
            text-xs mt-1 transition-colors duration-300
            ${enabled ? 'text-gray-600' : 'text-gray-500'}
          `}>
            {description}
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center space-x-2">
        {loading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        )}
        
        <motion.div
          className={`
            relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer
            ${enabled ? 'bg-green-500' : 'bg-gray-300'}
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{
              x: enabled ? 24 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * NotificationPreferences - Main notification preferences component
 */
const NotificationPreferences = ({ 
  className = "",
  showHeader = true 
}) => {
  const {
    preferences,
    loading,
    updating,
    error,
    toggleWhatsApp,
    toggleServiceAlerts,
    toggleMarketingUpdates,
    fetchPreferences,
    labels,
    isAllEnabled,
    clearError
  } = useNotifications();

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleWhatsAppToggle = async (enabled) => {
    await toggleWhatsApp(enabled);
  };

  const handleServiceAlertsToggle = async (enabled) => {
    await toggleServiceAlerts(enabled);
  };

  const handleMarketingToggle = async (enabled) => {
    await toggleMarketingUpdates(enabled);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      {showHeader && (
        <motion.div className="mb-6" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
            <Bell className="w-5 h-5 mr-2 text-orange-500" />
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-600">
            Manage how you receive updates and notifications from EassyLife
          </p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Notification Toggles */}
      <div className="space-y-4">
        {/* WhatsApp Master Toggle */}
        <motion.div variants={itemVariants}>
          <NotificationToggle
            id="whatsapp"
            label="WhatsApp Notifications"
            description="Master toggle for all WhatsApp notifications. Disable this to stop all WhatsApp messages."
            icon={MessageCircle}
            enabled={preferences.is_whatsapp_checked}
            onChange={handleWhatsAppToggle}
            disabled={updating}
            loading={updating}
          />
        </motion.div>

        {/* Service Alerts */}
        <motion.div variants={itemVariants}>
          <NotificationToggle
            id="service"
            label="Service Alerts"
            description="Booking confirmations, service updates, payment receipts, and important service notifications."
            icon={Bell}
            enabled={preferences.service_update}
            onChange={handleServiceAlertsToggle}
            disabled={!preferences.is_whatsapp_checked || updating}
            loading={updating}
          />
        </motion.div>

        {/* Marketing Updates */}
        <motion.div variants={itemVariants}>
          <NotificationToggle
            id="marketing"
            label="Marketing Updates"
            description="Promotional offers, new service announcements, seasonal deals, and marketing content."
            icon={Megaphone}
            enabled={preferences.marketing_update}
            onChange={handleMarketingToggle}
            disabled={!preferences.is_whatsapp_checked || updating}
            loading={updating}
          />
        </motion.div>
      </div>

      {/* Info Note */}
      <motion.div
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        variants={itemVariants}
      >
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Privacy & Control</p>
            <p>
              You can change these preferences anytime. We respect your privacy and will only send 
              notifications you've opted into. Critical account security messages may still be sent 
              regardless of these settings.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Summary */}
      <motion.div
        className="mt-4 text-center"
        variants={itemVariants}
      >
        <p className="text-xs text-gray-500">
          {isAllEnabled 
            ? "All notifications are enabled" 
            : preferences.is_whatsapp_checked 
              ? "Some notifications are enabled"
              : "All notifications are disabled"
          }
        </p>
      </motion.div>
    </motion.div>
  );
};

export default NotificationPreferences;
