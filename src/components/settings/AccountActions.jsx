import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Phone, 
  AlertTriangle,
  X,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { SettingItemWithButton } from './SettingItem';
import { InlineSpinner } from '../common/LoadingSpinner';
import { cn } from '../../lib/utils';

/**
 * AccountActions - Account actions management component
 * Includes export data, delete account, and contact support
 * Following design specifications with proper confirmation flows
 */
const AccountActions = ({
  onExportData,
  onDeleteAccount,
  onContactSupport,
  saving = false,
  className = ''
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle export data
  const handleExportData = async () => {
    if (onExportData) {
      await onExportData();
    }
  };

  // Handle contact support
  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      // Default action - open support email or phone
      window.open('mailto:support@eassylife.in?subject=Support Request');
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
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Account Actions
          </h3>
        </div>

        {/* Export Data */}
        <motion.div variants={itemVariants}>
          <SettingItemWithButton
            icon={Download}
            label="Export Data"
            description="Download all your account data and information"
            buttonText="Export"
            onButtonClick={handleExportData}
            disabled={saving}
            buttonVariant="primary"
          />
        </motion.div>

        {/* Contact Support */}
        <motion.div variants={itemVariants}>
          <SettingItemWithButton
            icon={Phone}
            label="Contact Support"
            description="Get help with your account or report issues"
            buttonText="Contact"
            onButtonClick={handleContactSupport}
            disabled={saving}
            buttonVariant="default"
          />
        </motion.div>

        {/* Delete Account - Destructive Action */}
        <motion.div variants={itemVariants}>
          <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
            <SettingItemWithButton
              icon={Trash2}
              label="Delete Account"
              description="Permanently remove your account and all associated data"
              buttonText="Delete"
              onButtonClick={() => setShowDeleteModal(true)}
              disabled={saving}
              variant="destructive"
              buttonVariant="destructive"
            />
            
            {/* Warning Notice */}
            <div className="mt-3 flex items-start gap-2 text-xs text-red-700">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <p>
                This action cannot be undone. All your data, bookings, and account information will be permanently deleted.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Support Information */}
        <motion.div variants={itemVariants}>
          <div className="bg-blue-50/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Our support team is here to help you with any questions or issues.
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>Phone: +91-XXXX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>Email: support@eassylife.in</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span>Hours: Mon-Fri 9AM-6PM IST</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDeleteAccount}
        saving={saving}
      />
    </>
  );
};

/**
 * DeleteAccountModal - Confirmation modal for account deletion
 */
const DeleteAccountModal = ({ isOpen, onClose, onConfirm, saving }) => {
  const [step, setStep] = useState(1); // 1: reason, 2: confirmation
  const [formData, setFormData] = useState({
    reason: '',
    password: '',
    confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const deleteReasons = [
    'Not satisfied with services',
    'Found better alternative',
    'Privacy concerns',
    'Too expensive',
    'Technical issues',
    'Other'
  ];

  const handleNext = () => {
    if (!formData.reason) {
      setErrors({ reason: 'Please select a reason' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleConfirm = async () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.confirmation !== 'DELETE') newErrors.confirmation = 'Please type DELETE to confirm';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const success = await onConfirm(formData.reason, formData.password);
      if (success) {
        onClose();
        setStep(1);
        setFormData({ reason: '', password: '', confirmation: '' });
      }
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setFormData({ reason: '', password: '', confirmation: '' });
    setErrors({});
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
          <h3 className="text-lg font-semibold text-red-700">Delete Account</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          // Step 1: Reason Selection
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  This action cannot be undone
                </p>
                <p className="text-xs text-red-700 mt-1">
                  All your data, bookings, and account information will be permanently deleted.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you deleting your account?
              </label>
              <div className="space-y-2">
                {deleteReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={formData.reason === reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      className="mr-2 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
              {errors.reason && (
                <p className="text-xs text-red-600 mt-1">{errors.reason}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Final Confirmation
          <div className="space-y-4">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Final Confirmation
              </h4>
              <p className="text-sm text-gray-600">
                This will permanently delete your account and all associated data.
              </p>
            </div>

            {/* Password Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your password to confirm
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Type DELETE confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={formData.confirmation}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="DELETE"
                disabled={saving}
              />
              {errors.confirmation && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmation}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={saving}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={saving}
              >
                {saving && <InlineSpinner size="xs" />}
                {saving ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AccountActions;
