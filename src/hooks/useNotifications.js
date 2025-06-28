import { useEffect } from 'react';
import useNotificationStore from '../stores/notificationStore.js';

/**
 * useNotifications - Custom hook for notification preferences management
 * Provides easy access to notification state and actions
 */
export const useNotifications = (options = {}) => {
  const {
    autoFetch = true,
    fetchOnMount = true
  } = options;

  // Get all notification state and actions
  const {
    preferences,
    loading,
    updating,
    error,
    lastFetched,
    fetchNotificationPreferences,
    updateNotificationPreferences,
    toggleWhatsAppNotifications,
    toggleServiceAlerts,
    toggleMarketingUpdates,
    canReceiveNotifications,
    getPreferenceLabels,
    isAllNotificationsEnabled,
    hasAnyIndividualPreferenceEnabled,
    clearError,
    refresh,
    reset
  } = useNotificationStore();

  // Auto-fetch preferences on mount if enabled
  useEffect(() => {
    if (fetchOnMount && autoFetch && !lastFetched && !loading) {
      fetchNotificationPreferences();
    }
  }, [fetchOnMount, autoFetch, lastFetched, loading, fetchNotificationPreferences]);

  // Helper functions
  const handleUpdatePreferences = async (newPreferences) => {
    clearError();
    const result = await updateNotificationPreferences(newPreferences);
    return result;
  };

  const handleToggleWhatsApp = async (enabled) => {
    clearError();
    const result = await toggleWhatsAppNotifications(enabled);
    return result;
  };

  const handleToggleServiceAlerts = async (enabled) => {
    clearError();
    const result = await toggleServiceAlerts(enabled);
    return result;
  };

  const handleToggleMarketingUpdates = async (enabled) => {
    clearError();
    const result = await toggleMarketingUpdates(enabled);
    return result;
  };

  const handleRefresh = async () => {
    clearError();
    await refresh();
  };

  // Computed values
  const isLoading = loading || updating;
  const hasError = !!error;
  const isDataStale = lastFetched && (Date.now() - lastFetched) > (5 * 60 * 1000); // 5 minutes

  return {
    // State
    preferences,
    loading,
    updating,
    error,
    isLoading,
    hasError,
    isDataStale,
    lastFetched,

    // Actions
    fetchPreferences: fetchNotificationPreferences,
    updatePreferences: handleUpdatePreferences,
    toggleWhatsApp: handleToggleWhatsApp,
    toggleServiceAlerts: handleToggleServiceAlerts,
    toggleMarketingUpdates: handleToggleMarketingUpdates,
    refresh: handleRefresh,
    clearError,
    reset,

    // Computed values
    labels: getPreferenceLabels(),
    isAllEnabled: isAllNotificationsEnabled(),
    hasAnyEnabled: hasAnyIndividualPreferenceEnabled(),
    canReceiveService: canReceiveNotifications('service'),
    canReceiveMarketing: canReceiveNotifications('marketing'),

    // Helper functions
    refetchPreferences: () => fetchNotificationPreferences(true),
    isRecentlyFetched: lastFetched && (Date.now() - lastFetched) < (2 * 60 * 1000) // 2 minutes
  };
};

/**
 * useNotificationToggle - Custom hook for individual notification toggles
 */
export const useNotificationToggle = (preferenceKey) => {
  const {
    preferences,
    updating,
    toggleWhatsAppNotifications,
    toggleServiceAlerts,
    toggleMarketingUpdates
  } = useNotificationStore();

  const isEnabled = preferences[preferenceKey] || false;

  const toggle = async (enabled) => {
    switch (preferenceKey) {
      case 'is_whatsapp_checked':
        return await toggleWhatsAppNotifications(enabled);
      case 'service_update':
        return await toggleServiceAlerts(enabled);
      case 'marketing_update':
        return await toggleMarketingUpdates(enabled);
      default:
        throw new Error(`Unknown preference key: ${preferenceKey}`);
    }
  };

  return {
    isEnabled,
    toggle,
    isUpdating: updating,
    canToggle: !updating
  };
};

/**
 * useNotificationLabels - Custom hook for notification preference labels
 */
export const useNotificationLabels = () => {
  const { getPreferenceLabels } = useNotificationStore();

  const labels = getPreferenceLabels();

  const getLabelForKey = (key) => {
    return labels[key] || { title: key, description: '' };
  };

  const getAllLabels = () => {
    return labels;
  };

  const getFormattedLabels = () => {
    return Object.entries(labels).map(([key, label]) => ({
      key,
      ...label
    }));
  };

  return {
    labels,
    getLabelForKey,
    getAllLabels,
    getFormattedLabels
  };
};

/**
 * useNotificationValidation - Custom hook for notification preference validation
 */
export const useNotificationValidation = () => {
  const validatePreferences = (preferences) => {
    const errors = {};
    const validKeys = ['service_update', 'marketing_update', 'is_whatsapp_checked'];

    if (typeof preferences !== 'object' || preferences === null) {
      errors.general = 'Preferences must be an object';
      return { isValid: false, errors };
    }

    // Check for invalid keys
    const invalidKeys = Object.keys(preferences).filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      errors.invalidKeys = `Invalid preference keys: ${invalidKeys.join(', ')}`;
    }

    // Validate boolean values
    validKeys.forEach(key => {
      if (preferences.hasOwnProperty(key) && typeof preferences[key] !== 'boolean') {
        errors[key] = `${key} must be a boolean value`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const getValidKeys = () => {
    return ['service_update', 'marketing_update', 'is_whatsapp_checked'];
  };

  const isValidKey = (key) => {
    return getValidKeys().includes(key);
  };

  const sanitizePreferences = (preferences) => {
    const validKeys = getValidKeys();
    const sanitized = {};

    validKeys.forEach(key => {
      if (preferences.hasOwnProperty(key)) {
        sanitized[key] = Boolean(preferences[key]);
      }
    });

    return sanitized;
  };

  return {
    validatePreferences,
    getValidKeys,
    isValidKey,
    sanitizePreferences
  };
};

export default useNotifications;
