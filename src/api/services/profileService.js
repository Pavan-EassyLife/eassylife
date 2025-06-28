import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * ProfileService - Handles all profile-related API operations
 * Based on Flutter app analysis and backend API structure
 */
class ProfileService {
  /**
   * Get complete user profile data
   * @returns {Promise<Object>} Profile data with user information
   */
  async getProfile() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROFILE);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.getProfile error:', error);
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  /**
   * Update user profile information (text data only)
   * @param {Object} profileData - Profile data to update
   * @param {string} profileData.first_name - User's first name
   * @param {string} profileData.last_name - User's last name (optional)
   * @param {string} profileData.email - User's email address
   * @param {string} profileData.preferred_language - Language preference (en|hi|pu|mr)
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      // Validate required fields
      if (!profileData.first_name || !profileData.email) {
        throw new Error('First name and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate language preference
      const validLanguages = ['en', 'hi', 'pu', 'mr'];
      if (profileData.preferred_language && !validLanguages.includes(profileData.preferred_language)) {
        throw new Error('Invalid language preference');
      }

      const response = await axiosInstance.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.updateProfile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Upload profile image
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Upload result with image URL
   */
  async uploadProfileImage(imageFile) {
    try {
      // Validate file
      if (!imageFile) {
        throw new Error('Please select an image file');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        throw new Error('Only JPEG, PNG, and WebP images are allowed');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axiosInstance.put(API_ENDPOINTS.UPLOAD_PROFILE_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.uploadProfileImage error:', error);
      throw new Error(error.message || 'Failed to upload profile image');
    }
  }

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Notification preferences
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
      console.error('❌ ProfileService.getNotificationPreferences error:', error);
      throw new Error(error.message || 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @param {boolean} preferences.service_update - Service alerts toggle
   * @param {boolean} preferences.marketing_update - Marketing updates toggle
   * @param {boolean} preferences.is_whatsapp_checked - WhatsApp notifications toggle
   * @returns {Promise<Object>} Updated preferences
   */
  async updateNotificationPreferences(preferences) {
    try {
      // Validate preferences object
      if (typeof preferences !== 'object' || preferences === null) {
        throw new Error('Invalid preferences data');
      }

      const response = await axiosInstance.post(API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCE, preferences);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.updateNotificationPreferences error:', error);
      throw new Error(error.message || 'Failed to update notification preferences');
    }
  }

  /**
   * Get wallet history
   * @returns {Promise<Object>} Wallet transaction history
   */
  async getWalletHistory() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.WALLET_HISTORY);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.getWalletHistory error:', error);
      throw new Error(error.message || 'Failed to fetch wallet history');
    }
  }

  /**
   * Delete user account
   * @returns {Promise<Object>} Account deletion result
   */
  async deleteAccount() {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.DEACTIVATE_ACCOUNT);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.deleteAccount error:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
  }

  /**
   * Get user favourites
   * @returns {Promise<Object>} User's favourite services/items
   */
  async getFavourites() {
    try {
      // Note: This endpoint might need to be added to the backend
      // For now, using a placeholder endpoint
      const response = await axiosInstance.get('favourites');

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.getFavourites error:', error);
      throw new Error(error.message || 'Failed to fetch favourites');
    }
  }

  /**
   * Get referral information
   * @returns {Promise<Object>} Referral data and earnings
   */
  async getReferralInfo() {
    try {
      // Note: This endpoint might need to be added to the backend
      // For now, using a placeholder endpoint
      const response = await axiosInstance.get('referral/info');

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ ProfileService.getReferralInfo error:', error);
      throw new Error(error.message || 'Failed to fetch referral information');
    }
  }

  /**
   * Validate profile data before submission
   * @param {Object} profileData - Profile data to validate
   * @returns {Object} Validation result
   */
  validateProfileData(profileData) {
    const errors = {};

    // Validate first name
    if (!profileData.first_name || profileData.first_name.trim().length === 0) {
      errors.first_name = 'First name is required';
    } else if (profileData.first_name.length > 50) {
      errors.first_name = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(profileData.first_name)) {
      errors.first_name = 'First name can only contain letters and spaces';
    }

    // Validate last name (optional)
    if (profileData.last_name && profileData.last_name.length > 50) {
      errors.last_name = 'Last name must be less than 50 characters';
    } else if (profileData.last_name && !/^[a-zA-Z\s]*$/.test(profileData.last_name)) {
      errors.last_name = 'Last name can only contain letters and spaces';
    }

    // Validate email
    if (!profileData.email || profileData.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate language preference
    if (profileData.preferred_language) {
      const validLanguages = ['en', 'hi', 'pu', 'mr'];
      if (!validLanguages.includes(profileData.preferred_language)) {
        errors.preferred_language = 'Please select a valid language';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new ProfileService();
