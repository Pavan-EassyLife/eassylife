import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Settings Service - Flutter-aligned API integration
 * Handles all settings related API calls including notifications, preferences, security, etc.
 * Following the existing API patterns from homePageService and authService
 */
class SettingsService {
  /**
   * Get all current user settings
   * This matches the Flutter app's settings data fetching
   * @returns {Promise<Object>} Complete settings data
   */
  async getCurrentSettings() {
    try {
      console.log('🚀 SettingsService: Fetching current settings...');

      const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS);

      console.log('✅ SettingsService: Settings fetched successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Settings fetched successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error fetching settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch settings'
      };
    }
  }

  /**
   * Get application settings including phone numbers
   * Calls the new v2.0.0 settings endpoint
   * @returns {Promise<Object>} Application settings data
   */
  async getApplicationSettings() {
    try {
      console.log('🔧 SettingsService: Fetching application settings...');

      const response = await axiosInstance.get('/settings');

      console.log('🔧 SettingsService: Application settings response:', response.data);
      console.log('🔧 SettingsService: Response status:', response.data?.status);
      console.log('🔧 SettingsService: Response data length:', response.data?.data?.length);

      if (response.data?.status && response.data?.data) {
        const settings = response.data.data;

        // Process settings to extract phone numbers and other relevant data
        const processedSettings = {
          phoneNumbers: [],
          otherSettings: {}
        };

        // Extract phone numbers from the settings array
        if (Array.isArray(settings)) {
          settings.forEach(setting => {
            console.log('🔧 Processing setting:', setting.attribute_name, '=', setting.attribute_value);

            if (setting.attribute_name === 'CALLING_NUMBER') {
              console.log('📞 Found CALLING_NUMBER:', setting.attribute_value);
              processedSettings.phoneNumbers.push({
                id: setting.id,
                number: setting.attribute_value,
                type: 'calling'
              });
            } else {
              // Store other settings
              processedSettings.otherSettings[setting.attribute_name] = {
                id: setting.id,
                value: setting.attribute_value
              };
            }
          });
        }

        console.log('📞 Final phone numbers found:', processedSettings.phoneNumbers);

        console.log('🔧 SettingsService: Processed application settings:', processedSettings);

        return {
          success: true,
          data: processedSettings,
          rawData: settings
        };
      } else {
        throw new Error('Invalid response format from settings API');
      }
    } catch (error) {
      console.error('❌ SettingsService: Error fetching application settings:', error);

      return {
        success: false,
        error: error.message || 'Failed to fetch application settings',
        data: {
          phoneNumbers: [],
          otherSettings: {}
        }
      };
    }
  }

  /**
   * Get the primary phone number for calling
   * @returns {Promise<string|null>} Primary phone number or null
   */
  async getPrimaryPhoneNumber() {
    try {
      const settingsResponse = await this.getApplicationSettings();

      if (settingsResponse.success && settingsResponse.data.phoneNumbers.length > 0) {
        // Return the first phone number as primary
        return settingsResponse.data.phoneNumbers[0].number;
      }

      return null;
    } catch (error) {
      console.error('❌ SettingsService: Error getting primary phone number:', error);
      return null;
    }
  }

  /**
   * Format phone number for display
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';

    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format Indian phone numbers (10 digits)
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    // Format if already includes country code
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }

    // Return as-is if format doesn't match expected patterns
    return phoneNumber;
  }

  /**
   * Initiate a phone call
   * @param {string} phoneNumber - Phone number to call
   */
  initiateCall(phoneNumber) {
    if (!phoneNumber) {
      console.warn('⚠️ SettingsService: No phone number provided for call');
      return;
    }

    // Clean the phone number for tel: link
    const cleaned = phoneNumber.replace(/\D/g, '');
    const telLink = `tel:+91${cleaned.length === 10 ? cleaned : cleaned.slice(-10)}`;

    console.log('📞 SettingsService: Initiating call to:', telLink);

    // Open tel: link
    window.location.href = telLink;
  }

  /**
   * Update notification preferences
   * Matches Flutter app's notification preference update
   * @param {Object} preferences - Notification preferences object
   * @returns {Promise<Object>} Update result
   */
  async updateNotificationPreferences(preferences) {
    try {
      console.log('🔔 SettingsService: Updating notification preferences:', preferences);
      
      const response = await axiosInstance.post(API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCE, {
        email_notifications: preferences.email,
        sms_notifications: preferences.sms,
        push_notifications: preferences.push,
        promotional_notifications: preferences.promotional,
        booking_notifications: preferences.booking,
        payment_notifications: preferences.payment
      });
      
      console.log('✅ SettingsService: Notification preferences updated successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Notification preferences updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error updating notification preferences:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update notification preferences'
      };
    }
  }

  /**
   * Update profile settings (language, timezone, currency, theme)
   * @param {Object} settings - Profile settings object
   * @returns {Promise<Object>} Update result
   */
  async updateProfileSettings(settings) {
    try {
      console.log('⚙️ SettingsService: Updating profile settings:', settings);
      
      const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_PROFILE, {
        language: settings.language,
        timezone: settings.timezone,
        currency: settings.currency,
        theme: settings.theme
      });
      
      console.log('✅ SettingsService: Profile settings updated successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Profile settings updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error updating profile settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile settings'
      };
    }
  }

  /**
   * Deactivate user account
   * Matches Flutter app's account deactivation flow
   * @param {string} reason - Reason for deactivation
   * @param {string} password - User password for confirmation
   * @returns {Promise<Object>} Deactivation result
   */
  async deactivateAccount(reason, password) {
    try {
      console.log('🗑️ SettingsService: Deactivating account with reason:', reason);
      
      const response = await axiosInstance.post(API_ENDPOINTS.DEACTIVATE_ACCOUNT, {
        reason: reason,
        password: password,
        confirmation: true
      });
      
      console.log('✅ SettingsService: Account deactivated successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Account deactivated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error deactivating account:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to deactivate account'
      };
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔑 SettingsService: Changing password...');
      
      const response = await axiosInstance.post(`${API_ENDPOINTS.PROFILE}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword
      });
      
      console.log('✅ SettingsService: Password changed successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Password changed successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error changing password:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to change password'
      };
    }
  }

  /**
   * Toggle two-factor authentication
   * @param {boolean} enabled - Whether to enable or disable 2FA
   * @returns {Promise<Object>} 2FA toggle result
   */
  async toggleTwoFactorAuth(enabled) {
    try {
      console.log('🛡️ SettingsService: Toggling two-factor authentication:', enabled);
      
      const response = await axiosInstance.post(`${API_ENDPOINTS.PROFILE}/two-factor`, {
        enabled: enabled
      });
      
      console.log('✅ SettingsService: Two-factor authentication toggled successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error toggling two-factor authentication:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to toggle two-factor authentication'
      };
    }
  }

  /**
   * Get active sessions
   * @returns {Promise<Object>} Active sessions data
   */
  async getActiveSessions() {
    try {
      console.log('📱 SettingsService: Fetching active sessions...');
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.PROFILE}/sessions`);
      
      console.log('✅ SettingsService: Active sessions fetched successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Active sessions fetched successfully',
        data: response.data.data || response.data.sessions || [],
      };
    } catch (error) {
      console.error('❌ SettingsService: Error fetching active sessions:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch active sessions'
      };
    }
  }

  /**
   * Export user data
   * @returns {Promise<Object>} Data export result
   */
  async exportUserData() {
    try {
      console.log('📥 SettingsService: Exporting user data...');
      
      const response = await axiosInstance.post(`${API_ENDPOINTS.PROFILE}/export-data`);
      
      console.log('✅ SettingsService: User data export initiated successfully');
      return {
        success: response.data.status || true,
        message: response.data.message || 'Data export initiated successfully. You will receive an email with your data.',
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ SettingsService: Error exporting user data:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to export user data'
      };
    }
  }
}

export default new SettingsService();
