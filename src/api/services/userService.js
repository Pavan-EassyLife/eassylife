import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

class UserService {
  // Get complete user profile data
  async getProfile() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROFILE);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get user settings
  async getSettings() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update notification preferences
  async updateNotificationPreference(preferences) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCE, preferences);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get wallet history
  async getWalletHistory() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.WALLET_HISTORY);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Track campaign
  async trackCampaign(campaignData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CAMPAIGN_TRACK, campaignData);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new UserService();
