import { describe, it, expect, vi, beforeEach } from 'vitest';
import settingsService from '../../api/services/settingsService';
import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/config';

// Mock axios instance
vi.mock('../../api/axiosInstance');

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentSettings', () => {
    it('fetches settings successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Settings fetched successfully',
          data: {
            email_notifications: true,
            sms_notifications: true,
            language: 'en',
            timezone: 'Asia/Kolkata'
          }
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await settingsService.getCurrentSettings();

      expect(axiosInstance.get).toHaveBeenCalledWith(API_ENDPOINTS.SETTINGS);
      expect(result).toEqual({
        success: true,
        message: 'Settings fetched successfully',
        data: mockResponse.data.data
      });
    });

    it('handles API error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Settings not found'
          }
        }
      };

      axiosInstance.get.mockRejectedValue(mockError);

      const result = await settingsService.getCurrentSettings();

      expect(result).toEqual({
        success: false,
        error: 'Settings not found'
      });
    });

    it('handles network error', async () => {
      const mockError = new Error('Network Error');
      axiosInstance.get.mockRejectedValue(mockError);

      const result = await settingsService.getCurrentSettings();

      expect(result).toEqual({
        success: false,
        error: 'Network Error'
      });
    });
  });

  describe('updateNotificationPreferences', () => {
    it('updates notification preferences successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Notification preferences updated successfully'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const preferences = {
        email: true,
        sms: false,
        push: true,
        promotional: false,
        booking: true,
        payment: true
      };

      const result = await settingsService.updateNotificationPreferences(preferences);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCE,
        {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          promotional_notifications: false,
          booking_notifications: true,
          payment_notifications: true
        }
      );

      expect(result).toEqual({
        success: true,
        message: 'Notification preferences updated successfully',
        data: mockResponse.data
      });
    });

    it('handles validation error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid notification preferences'
          }
        }
      };

      axiosInstance.post.mockRejectedValue(mockError);

      const preferences = { email: true };
      const result = await settingsService.updateNotificationPreferences(preferences);

      expect(result).toEqual({
        success: false,
        error: 'Invalid notification preferences'
      });
    });
  });

  describe('updateProfileSettings', () => {
    it('updates profile settings successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Profile settings updated successfully'
        }
      };

      axiosInstance.put.mockResolvedValue(mockResponse);

      const settings = {
        language: 'hi',
        timezone: 'Asia/Dubai',
        currency: 'USD',
        theme: 'dark'
      };

      const result = await settingsService.updateProfileSettings(settings);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        API_ENDPOINTS.UPDATE_PROFILE,
        settings
      );

      expect(result).toEqual({
        success: true,
        message: 'Profile settings updated successfully',
        data: mockResponse.data
      });
    });
  });

  describe('deactivateAccount', () => {
    it('deactivates account successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Account deactivated successfully'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await settingsService.deactivateAccount('Not satisfied', 'password123');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        API_ENDPOINTS.DEACTIVATE_ACCOUNT,
        {
          reason: 'Not satisfied',
          password: 'password123',
          confirmation: true
        }
      );

      expect(result).toEqual({
        success: true,
        message: 'Account deactivated successfully',
        data: mockResponse.data
      });
    });

    it('handles incorrect password error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Incorrect password'
          }
        }
      };

      axiosInstance.post.mockRejectedValue(mockError);

      const result = await settingsService.deactivateAccount('Not satisfied', 'wrongpassword');

      expect(result).toEqual({
        success: false,
        error: 'Incorrect password'
      });
    });
  });

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Password changed successfully'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await settingsService.changePassword('oldPassword', 'newPassword');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `${API_ENDPOINTS.PROFILE}/change-password`,
        {
          current_password: 'oldPassword',
          new_password: 'newPassword',
          confirm_password: 'newPassword'
        }
      );

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
        data: mockResponse.data
      });
    });
  });

  describe('toggleTwoFactorAuth', () => {
    it('enables two-factor authentication successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Two-factor authentication enabled successfully'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await settingsService.toggleTwoFactorAuth(true);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `${API_ENDPOINTS.PROFILE}/two-factor`,
        { enabled: true }
      );

      expect(result).toEqual({
        success: true,
        message: 'Two-factor authentication enabled successfully',
        data: mockResponse.data
      });
    });

    it('disables two-factor authentication successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Two-factor authentication disabled successfully'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await settingsService.toggleTwoFactorAuth(false);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `${API_ENDPOINTS.PROFILE}/two-factor`,
        { enabled: false }
      );

      expect(result).toEqual({
        success: true,
        message: 'Two-factor authentication disabled successfully',
        data: mockResponse.data
      });
    });
  });

  describe('getActiveSessions', () => {
    it('fetches active sessions successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          sessions: [
            { device: 'Chrome on Windows', location: 'Mumbai' },
            { device: 'Safari on iPhone', location: 'Delhi' }
          ]
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await settingsService.getActiveSessions();

      expect(axiosInstance.get).toHaveBeenCalledWith(`${API_ENDPOINTS.PROFILE}/sessions`);
      expect(result).toEqual({
        success: true,
        message: 'Active sessions fetched successfully',
        data: mockResponse.data.sessions
      });
    });
  });

  describe('exportUserData', () => {
    it('initiates data export successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Data export initiated successfully'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await settingsService.exportUserData();

      expect(axiosInstance.post).toHaveBeenCalledWith(`${API_ENDPOINTS.PROFILE}/export-data`);
      expect(result).toEqual({
        success: true,
        message: 'Data export initiated successfully',
        data: mockResponse.data
      });
    });
  });

  describe('error handling', () => {
    it('handles response without status field', async () => {
      const mockResponse = {
        data: {
          email_notifications: true
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await settingsService.getCurrentSettings();

      expect(result).toEqual({
        success: true,
        message: 'Settings fetched successfully',
        data: mockResponse.data
      });
    });

    it('handles error without response', async () => {
      const mockError = new Error('Network timeout');
      axiosInstance.get.mockRejectedValue(mockError);

      const result = await settingsService.getCurrentSettings();

      expect(result).toEqual({
        success: false,
        error: 'Network timeout'
      });
    });

    it('handles error with empty response', async () => {
      const mockError = {
        response: {
          data: {}
        }
      };

      axiosInstance.get.mockRejectedValue(mockError);

      const result = await settingsService.getCurrentSettings();

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch settings'
      });
    });
  });
});
