import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

/**
 * NotificationPreferencesPage - Matches Flutter app notification preferences exactly
 * Shows WhatsApp Notifications with All, Service Alert, and Marketing Updates toggles
 */
const NotificationPreferencesPage = () => {
  const navigate = useNavigate();
  const {
    preferences,
    loading,
    updating,
    error,
    toggleWhatsApp,
    toggleServiceAlerts,
    toggleMarketingUpdates,
    fetchPreferences,
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

  // Handle back navigation
  const handleBack = () => {
    navigate('/settings');
  };

  // Handle All toggle
  const handleAllToggle = async () => {
    await toggleWhatsApp(!isAllEnabled);
  };

  // Handle Service Alert toggle
  const handleServiceAlertToggle = async () => {
    await toggleServiceAlerts(!preferences.service_update);
  };

  // Handle Marketing Updates toggle
  const handleMarketingToggle = async () => {
    await toggleMarketingUpdates(!preferences.marketing_update);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Notification Preferences - EassyLife</title>
        <meta name="description" content="Manage your notification preferences" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header - Matching Flutter app */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6">
            <div className="flex items-center h-16">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Notification Preferences</h1>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Main Content - Flutter app style with exact spacing */}
        <div className="py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* WhatsApp Notifications Header */}
            <div className="px-6 py-3">
              <h2 className="text-base font-medium text-gray-900">WhatsApp Notifications</h2>
            </div>

            {/* All Toggle */}
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-900">All</span>
                <ToggleSwitch
                  enabled={isAllEnabled}
                  onChange={handleAllToggle}
                  disabled={updating}
                />
              </div>
            </div>

            {/* Divider - Matching Flutter app exactly */}
            <div className="mx-6 h-px bg-gray-200 my-4"></div>

            {/* Individual Toggles */}
            <div className="px-6 space-y-3">
              {/* Service Alert */}
              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-900">Service Alert</span>
                <ToggleSwitch
                  enabled={preferences.service_update}
                  onChange={handleServiceAlertToggle}
                  disabled={updating}
                />
              </div>

              {/* Marketing Updates */}
              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-900">Marketing Updates</span>
                <ToggleSwitch
                  enabled={preferences.marketing_update}
                  onChange={handleMarketingToggle}
                  disabled={updating}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

/**
 * ToggleSwitch - Simple toggle switch matching mobile app design exactly
 */
const ToggleSwitch = ({ enabled, onChange, disabled = false }) => {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
        ${enabled
          ? 'bg-green-500'
          : 'bg-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export default NotificationPreferencesPage;
