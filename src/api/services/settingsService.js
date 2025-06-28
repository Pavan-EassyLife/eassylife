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
