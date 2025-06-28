import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import NotificationSettings from './NotificationSettings';



/**
 * SettingsContent - Right side content area for settings
 * Displays the selected settings section with smooth transitions
 */
const SettingsContent = ({
  activeSection,
  settings,
  onUpdateNotifications,
  onUpdatePreferences,
  onChangePassword,
  onToggleTwoFactor,
  onDeleteAccount,
  onExportData,
  saving = false,
  className = ''
}) => {
  // Content configuration for each section
  const contentConfig = {
    notifications: {
      title: 'Notification Preferences',
      description: 'Manage how you receive notifications and updates',
      icon: '📱',
      component: NotificationSettings
    },
    contact: {
      title: 'Contact us',
      description: 'Get in touch with our support team',
      icon: '📞',
      component: ContactSupport
    },
    delete: {
      title: 'Delete Account',
      description: 'Permanently delete your account and all associated data',
      icon: '⚠️',
      component: DeleteAccount
    }
  };

  const currentConfig = contentConfig[activeSection] || contentConfig.notifications;
  const CurrentComponent = currentConfig.component;

  // Animation variants
  const contentVariants = {
    hidden: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.1, duration: 0.3 }
    }
  };

  // Get component props based on active section
  const getComponentProps = () => {
    switch (activeSection) {
      case 'notifications':
        return {
          notifications: settings.notifications,
          onUpdate: onUpdateNotifications,
          saving
        };
      case 'contact':
        return {
          saving
        };
      case 'delete':
        return {
          onDeleteAccount,
          saving
        };
      default:
        return {};
    }
  };

  return (
    <div className={cn('flex-1 bg-gradient-to-br from-gray-50 to-white overflow-hidden', className)}>
      <div className="h-full flex flex-col">
        {/* Content Header - Show for webview */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-8 py-6"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentConfig.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentConfig.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentConfig.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area - Clean and Simple */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-2xl mx-auto"
              >
                <CurrentComponent {...getComponentProps()} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * EmptySettingsContent - Placeholder when no section is selected
 */
export const EmptySettingsContent = ({ className = '' }) => {
  const cardItems = [
    { icon: '📱', label: 'Notifications', color: 'from-blue-50 to-blue-100' },
    { icon: '📞', label: 'Contact us', color: 'from-green-50 to-green-100' },
    { icon: '🔗', label: 'External Links', color: 'from-purple-50 to-purple-100' },
    { icon: '⚠️', label: 'Account', color: 'from-red-50 to-red-100' }
  ];

  return (
    <div className={cn('flex-1 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center', className)}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md mx-auto px-4"
      >
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          ⚙️
        </motion.div>
        <motion.h2
          className="text-2xl font-semibold text-gray-900 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to Settings
        </motion.h2>
        <motion.p
          className="text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Select a category from the left sidebar to manage your account preferences and settings.
        </motion.p>
        <motion.div
          className="grid grid-cols-2 gap-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, staggerChildren: 0.1 }}
        >
          {cardItems.map((item, index) => (
            <motion.div
              key={index}
              className={`p-4 bg-gradient-to-br ${item.color} rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-xl mb-2"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </motion.div>
              <div className="font-medium text-gray-900">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 * ContactSupport - Contact support component
 */
const ContactSupport = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 m-8 p-8">
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          className="text-4xl mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          📞
        </motion.div>
        <motion.h3
          className="text-xl font-semibold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Get in Touch
        </motion.h3>
        <motion.p
          className="text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Need help or have questions? Our support team is here to assist you.
        </motion.p>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
            <p className="text-gray-600 mb-4">Get help via email</p>
            <motion.button
              onClick={() => window.open('mailto:support@eassylife.in')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Email
            </motion.button>
          </motion.div>

          <motion.div
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
            <p className="text-gray-600 mb-4">Call us directly</p>
            <motion.button
              onClick={() => window.open('tel:+91-XXXXXXXXXX')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Call Now
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * DeleteAccount - Delete account component
 */
const DeleteAccount = ({ onDeleteAccount, saving }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 m-8 p-8">
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          className="text-4xl mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          ⚠️
        </motion.div>
        <motion.h3
          className="text-xl font-semibold text-red-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Delete Account
        </motion.h3>
        <motion.p
          className="text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          This action cannot be undone. All your data, bookings, and account information will be permanently deleted.
        </motion.p>

        <motion.div
          className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl p-6 mb-8 hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
        >
          <h4 className="font-medium text-red-800 mb-4">What will be deleted:</h4>
          <motion.ul
            className="text-left text-red-700 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, staggerChildren: 0.1 }}
          >
            {[
              'Your profile and personal information',
              'All booking history and data',
              'Saved addresses and preferences',
              'Wallet balance and transaction history',
              'All associated data and settings'
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <span className="text-red-500">•</span>
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.button
          onClick={onDeleteAccount}
          disabled={saving}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </div>
          ) : (
            'Delete My Account'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default SettingsContent;
