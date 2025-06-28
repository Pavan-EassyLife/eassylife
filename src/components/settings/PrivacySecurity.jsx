import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Key, 
  Shield, 
  Smartphone, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { SettingItemWithButton } from './SettingItem';
import { ToggleWithLabel } from './ToggleSwitch';
import { InlineSpinner } from '../common/LoadingSpinner';
import { cn } from '../../lib/utils';

/**
 * PrivacySecurity - Privacy and security settings component
 * Includes password change, 2FA toggle, and active sessions management
 * Following design specifications and security best practices
 */
const PrivacySecurity = ({
  security = {},
  onChangePassword,
  onToggleTwoFactor,
  onManageSessions,
  saving = false,
  className = ''
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(security.twoFactorEnabled ?? false);

  // Handle 2FA toggle
  const handleTwoFactorToggle = async (enabled) => {
    setTwoFactorEnabled(enabled);
    if (onToggleTwoFactor) {
      const success = await onToggleTwoFactor(enabled);
      if (!success) {
        // Revert on failure
        setTwoFactorEnabled(!enabled);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  return (
    <>
      <motion.div
        className={cn('space-y-6', className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Privacy & Security
          </h3>
        </div>

        {/* Change Password */}
        <motion.div variants={itemVariants}>
          <SettingItemWithButton
            icon={Key}
            label="Change Password"
            description="Update your account password for better security"
            buttonText="Change"
            onButtonClick={() => setShowPasswordModal(true)}
            disabled={saving}
            buttonVariant="primary"
          />
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div variants={itemVariants}>
          <div className="flex items-start justify-between py-4 border-b border-gray-100">
            <div className="flex items-start gap-3 flex-1 pr-4">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    Two-Factor Authentication
                  </h4>
                  {twoFactorEnabled && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
                {twoFactorEnabled && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Two-factor authentication is enabled
                  </p>
                )}
              </div>
            </div>
            <ToggleWithLabel
              checked={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              disabled={saving}
              variant="success"
            />
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div variants={itemVariants}>
          <SettingItemWithButton
            icon={Smartphone}
            label="Active Sessions"
            description="View and manage devices logged into your account"
            buttonText="Manage"
            onButtonClick={() => setShowSessionsModal(true)}
            disabled={saving}
            buttonVariant="default"
          />
        </motion.div>

        {/* Security Status */}
        <motion.div variants={itemVariants}>
          <div className="bg-green-50/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Security Status: Good</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your account security settings are properly configured.
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Strong password enabled</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Account verification completed</span>
                  </div>
                  {twoFactorEnabled && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      <span>Two-factor authentication active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Change Password Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={onChangePassword}
        saving={saving}
      />

      {/* Active Sessions Modal */}
      <ActiveSessionsModal
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        sessions={security.activeSessions || []}
        onManage={onManageSessions}
      />
    </>
  );
};

/**
 * PasswordChangeModal - Modal for changing password
 */
const PasswordChangeModal = ({ isOpen, onClose, onSubmit, saving }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const success = await onSubmit(formData.currentPassword, formData.newPassword);
      if (success) {
        onClose();
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={saving}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving && <InlineSpinner size="xs" />}
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/**
 * ActiveSessionsModal - Modal for managing active sessions
 */
const ActiveSessionsModal = ({ isOpen, onClose, sessions, onManage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active sessions found</p>
          ) : (
            sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.device || 'Unknown Device'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {session.location || 'Unknown Location'} • {session.lastActive || 'Recently'}
                    </p>
                  </div>
                </div>
                {session.current ? (
                  <span className="text-xs text-green-600 font-medium">Current</span>
                ) : (
                  <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                    Revoke
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacySecurity;
