import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * NotificationService - Handles notification preferences and settings
 * Based on Flutter app notification management functionality
 */
class NotificationService {
  /**
   * Get current notification preferences
   * @returns {Promise<Object>} Current notification settings
   */
  async getNotificationPreferences() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ NotificationService.getNotificationPreferences error:', error);
      throw new Error(error.message || 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences to update
   * @param {boolean} preferences.service_update - Service alerts (booking updates, service notifications)
   * @param {boolean} preferences.marketing_update - Marketing updates (promotional offers, new features)
   * @param {boolean} preferences.is_whatsapp_checked - WhatsApp notifications master toggle
   * @returns {Promise<Object>} Updated notification preferences
   */
  async updateNotificationPreferences(preferences) {
    try {
      // Validate preferences object
      if (typeof preferences !== 'object' || preferences === null) {
        throw new Error('Invalid preferences data');
      }

      // Validate boolean values
      const validKeys = ['service_update', 'marketing_update', 'is_whatsapp_checked'];
      const invalidKeys = Object.keys(preferences).filter(key => !validKeys.includes(key));
      
      if (invalidKeys.length > 0) {
        console.warn('⚠️ Unknown preference keys:', invalidKeys);
      }

      // Ensure boolean values
      const sanitizedPreferences = {};
      validKeys.forEach(key => {
        if (preferences.hasOwnProperty(key)) {
          sanitizedPreferences[key] = Boolean(preferences[key]);
        }
      });

      const response = await axiosInstance.post(API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCE, sanitizedPreferences);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ NotificationService.updateNotificationPreferences error:', error);
      throw new Error(error.message || 'Failed to update notification preferences');
    }
  }

  /**
   * Update individual notification setting
   * @param {string} settingKey - The setting key to update
   * @param {boolean} value - The new value for the setting
   * @returns {Promise<Object>} Updated notification preferences
   */
  async updateIndividualSetting(settingKey, value) {
    try {
      const validKeys = ['service_update', 'marketing_update', 'is_whatsapp_checked'];
      
      if (!validKeys.includes(settingKey)) {
        throw new Error(`Invalid setting key: ${settingKey}`);
      }

      const preferences = {
        [settingKey]: Boolean(value)
      };

      return await this.updateNotificationPreferences(preferences);
    } catch (error) {
      console.error('❌ NotificationService.updateIndividualSetting error:', error);
      throw new Error(error.message || 'Failed to update notification setting');
    }
  }

  /**
   * Toggle WhatsApp notifications master switch
   * @param {boolean} enabled - Whether to enable or disable WhatsApp notifications
   * @returns {Promise<Object>} Updated notification preferences
   */
  async toggleWhatsAppNotifications(enabled) {
    try {
      const preferences = {
        is_whatsapp_checked: Boolean(enabled)
      };

      // If disabling WhatsApp, also disable individual settings
      if (!enabled) {
        preferences.service_update = false;
        preferences.marketing_update = false;
      }

      return await this.updateNotificationPreferences(preferences);
    } catch (error) {
      console.error('❌ NotificationService.toggleWhatsAppNotifications error:', error);
      throw new Error(error.message || 'Failed to toggle WhatsApp notifications');
    }
  }

  /**
   * Toggle service alerts (booking updates, service notifications)
   * @param {boolean} enabled - Whether to enable or disable service alerts
   * @returns {Promise<Object>} Updated notification preferences
   */
  async toggleServiceAlerts(enabled) {
    try {
      return await this.updateIndividualSetting('service_update', enabled);
    } catch (error) {
      console.error('❌ NotificationService.toggleServiceAlerts error:', error);
      throw new Error(error.message || 'Failed to toggle service alerts');
    }
  }

  /**
   * Toggle marketing updates (promotional offers, new features)
   * @param {boolean} enabled - Whether to enable or disable marketing updates
   * @returns {Promise<Object>} Updated notification preferences
   */
  async toggleMarketingUpdates(enabled) {
    try {
      return await this.updateIndividualSetting('marketing_update', enabled);
    } catch (error) {
      console.error('❌ NotificationService.toggleMarketingUpdates error:', error);
      throw new Error(error.message || 'Failed to toggle marketing updates');
    }
  }

  /**
   * Get default notification preferences
   * @returns {Object} Default notification settings
   */
  getDefaultPreferences() {
    return {
      is_whatsapp_checked: true,
      service_update: true,
      marketing_update: false
    };
  }

  /**
   * Validate notification preferences
   * @param {Object} preferences - Preferences to validate
   * @returns {Object} Validation result
   */
  validatePreferences(preferences) {
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
  }

  /**
   * Get notification preference labels for UI display
   * @returns {Object} Labels for notification preferences
   */
  getPreferenceLabels() {
    return {
      is_whatsapp_checked: {
        title: 'WhatsApp Notifications',
        description: 'Master toggle for all WhatsApp notifications'
      },
      service_update: {
        title: 'Service Alerts',
        description: 'Booking updates, service notifications, and important alerts'
      },
      marketing_update: {
        title: 'Marketing Updates',
        description: 'Promotional offers, new features, and marketing content'
      }
    };
  }

  /**
   * Check if user can receive notifications based on preferences
   * @param {Object} preferences - Current notification preferences
   * @param {string} notificationType - Type of notification to check
   * @returns {boolean} Whether user can receive this type of notification
   */
  canReceiveNotification(preferences, notificationType) {
    if (!preferences || !preferences.is_whatsapp_checked) {
      return false;
    }

    switch (notificationType) {
      case 'service':
        return preferences.service_update === true;
      case 'marketing':
        return preferences.marketing_update === true;
      default:
        return false;
    }
  }
}

export default new NotificationService();
