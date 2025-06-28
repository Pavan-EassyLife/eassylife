import { useState, useEffect, useRef } from 'react';
import settingsService from '../api/services/settingsService';
import { handleError, handleSuccess } from '../utils/errorHandler';

/**
 * useSettings Hook - Settings state management and API integration
 * Follows the same patterns as useHomePage and useProfile hooks
 * Provides comprehensive settings management with loading states and error handling
 */
export const useSettings = () => {
  // State management
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
      promotional: false,
      booking: true,
      payment: true
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      theme: 'light'
    },
    security: {
      twoFactorEnabled: false,
      activeSessions: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Refs to prevent duplicate API calls
  const isLoadingRef = useRef(false);
  const hasInitialized = useRef(false);

  /**
   * Fetch current settings from API
   */
  const fetchSettings = async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useSettings: Fetching settings...');
      const result = await settingsService.getCurrentSettings();

      if (result.success) {
        // Map API response to our settings structure
        const apiData = result.data;
        
        setSettings({
          notifications: {
            email: apiData.email_notifications ?? true,
            sms: apiData.sms_notifications ?? true,
            push: apiData.push_notifications ?? true,
            promotional: apiData.promotional_notifications ?? false,
            booking: apiData.booking_notifications ?? true,
            payment: apiData.payment_notifications ?? true
          },
          preferences: {
            language: apiData.language ?? 'en',
            timezone: apiData.timezone ?? 'Asia/Kolkata',
            currency: apiData.currency ?? 'INR',
            theme: apiData.theme ?? 'light'
          },
          security: {
            twoFactorEnabled: apiData.two_factor_enabled ?? false,
            activeSessions: apiData.active_sessions ?? []
          }
        });

        setLastFetched(Date.now());
        hasInitialized.current = true;
        console.log('✅ useSettings: Settings fetched successfully');
      } else {
        throw new Error(result.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('❌ useSettings: Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
      handleError.settings(err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  /**
   * Update notification preferences
   * @param {Object} notifications - Notification preferences
   * @returns {Promise<boolean>} Success status
   */
  const updateNotifications = async (notifications) => {
    setSaving(true);
    setError(null);

    try {
      console.log('🔔 useSettings: Updating notifications:', notifications);
      const result = await settingsService.updateNotificationPreferences(notifications);

      if (result.success) {
        setSettings(prev => ({
          ...prev,
          notifications: notifications
        }));
        handleSuccess('Notification preferences updated successfully');
        console.log('✅ useSettings: Notifications updated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to update notifications');
      }
    } catch (err) {
      console.error('❌ useSettings: Error updating notifications:', err);
      setError(err.message || 'Failed to update notification preferences');
      handleError.settings(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update profile preferences
   * @param {Object} preferences - Profile preferences
   * @returns {Promise<boolean>} Success status
   */
  const updatePreferences = async (preferences) => {
    setSaving(true);
    setError(null);

    try {
      console.log('⚙️ useSettings: Updating preferences:', preferences);
      const result = await settingsService.updateProfileSettings(preferences);

      if (result.success) {
        setSettings(prev => ({
          ...prev,
          preferences: preferences
        }));
        handleSuccess('Profile preferences updated successfully');
        console.log('✅ useSettings: Preferences updated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('❌ useSettings: Error updating preferences:', err);
      setError(err.message || 'Failed to update profile preferences');
      handleError.settings(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  const changePassword = async (currentPassword, newPassword) => {
    setSaving(true);
    setError(null);

    try {
      console.log('🔑 useSettings: Changing password...');
      const result = await settingsService.changePassword(currentPassword, newPassword);

      if (result.success) {
        handleSuccess('Password changed successfully');
        console.log('✅ useSettings: Password changed successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('❌ useSettings: Error changing password:', err);
      setError(err.message || 'Failed to change password');
      handleError.settings(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle two-factor authentication
   * @param {boolean} enabled - Enable/disable 2FA
   * @returns {Promise<boolean>} Success status
   */
  const toggleTwoFactor = async (enabled) => {
    setSaving(true);
    setError(null);

    try {
      console.log('🛡️ useSettings: Toggling two-factor auth:', enabled);
      const result = await settingsService.toggleTwoFactorAuth(enabled);

      if (result.success) {
        setSettings(prev => ({
          ...prev,
          security: {
            ...prev.security,
            twoFactorEnabled: enabled
          }
        }));
        handleSuccess(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`);
        console.log('✅ useSettings: Two-factor auth toggled successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to toggle two-factor authentication');
      }
    } catch (err) {
      console.error('❌ useSettings: Error toggling two-factor auth:', err);
      setError(err.message || 'Failed to toggle two-factor authentication');
      handleError.settings(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete account
   * @param {string} reason - Reason for deletion
   * @param {string} password - User password for confirmation
   * @returns {Promise<boolean>} Success status
   */
  const deleteAccount = async (reason, password) => {
    setSaving(true);
    setError(null);

    try {
      console.log('🗑️ useSettings: Deleting account...');
      const result = await settingsService.deactivateAccount(reason, password);

      if (result.success) {
        handleSuccess('Account deletion initiated successfully');
        console.log('✅ useSettings: Account deleted successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('❌ useSettings: Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
      handleError.settings(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Export user data
   * @returns {Promise<boolean>} Success status
   */
  const exportData = async () => {
    setSaving(true);
    setError(null);

    try {
      console.log('📥 useSettings: Exporting user data...');
      const result = await settingsService.exportUserData();

      if (result.success) {
        handleSuccess('Data export initiated. You will receive an email with your data.');
        console.log('✅ useSettings: Data export initiated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to export data');
      }
    } catch (err) {
      console.error('❌ useSettings: Error exporting data:', err);
      setError(err.message || 'Failed to export user data');
      handleError.settings(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Refresh settings data
   */
  const refreshSettings = () => {
    fetchSettings();
  };

  // Initialize settings on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      fetchSettings();
    }
  }, []);

  return {
    // State
    settings,
    loading,
    saving,
    error,
    lastFetched,
    
    // Actions
    updateNotifications,
    updatePreferences,
    changePassword,
    toggleTwoFactor,
    deleteAccount,
    exportData,
    clearError,
    refreshSettings,
    
    // Utilities
    refetch: fetchSettings
  };
};
