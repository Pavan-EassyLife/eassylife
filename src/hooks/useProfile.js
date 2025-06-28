import { useEffect } from 'react';
import useProfileStore from '../stores/profileStore.js';

/**
 * useProfile - Custom hook for profile management
 * Provides easy access to profile state and actions
 */
export const useProfile = (options = {}) => {
  const {
    autoFetch = true,
    fetchOnMount = true
  } = options;

  // Get all profile state and actions
  const {
    user,
    loading,
    imageUploading,
    error,
    lastFetched,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    getUserInitials,
    getUserDisplayName,
    getProfileImageUrl,
    isProfileComplete,
    clearError,
    refresh,
    reset
  } = useProfileStore();

  // Auto-fetch profile on mount if enabled
  useEffect(() => {
    if (fetchOnMount && autoFetch && !user && !loading) {
      fetchProfile();
    }
  }, [fetchOnMount, autoFetch, user, loading, fetchProfile]);

  // Helper functions
  const handleUpdateProfile = async (profileData) => {
    clearError();
    const result = await updateProfile(profileData);
    return result;
  };

  const handleUploadImage = async (imageFile) => {
    clearError();
    const result = await uploadProfileImage(imageFile);
    return result;
  };

  const handleRefresh = async () => {
    clearError();
    await refresh();
  };

  // Computed values
  const isLoading = loading || imageUploading;
  const hasError = !!error;
  const isDataStale = lastFetched && (Date.now() - lastFetched) > (10 * 60 * 1000); // 10 minutes

  return {
    // State
    user,
    loading,
    imageUploading,
    error,
    isLoading,
    hasError,
    isDataStale,
    lastFetched,

    // Actions
    fetchProfile,
    updateProfile: handleUpdateProfile,
    uploadProfileImage: handleUploadImage,
    refresh: handleRefresh,
    clearError,
    reset,

    // Computed values
    userInitials: getUserInitials(),
    displayName: getUserDisplayName(),
    profileImageUrl: getProfileImageUrl(),
    isProfileComplete: isProfileComplete(),

    // Helper functions
    refetchProfile: () => fetchProfile(true),
    isRecentlyFetched: lastFetched && (Date.now() - lastFetched) < (5 * 60 * 1000) // 5 minutes
  };
};

/**
 * useProfileImage - Custom hook specifically for profile image management
 */
export const useProfileImage = () => {
  const {
    user,
    imageUploading,
    uploadProfileImage,
    getUserInitials,
    getProfileImageUrl
  } = useProfileStore();

  const handleImageUpload = async (imageFile) => {
    const result = await uploadProfileImage(imageFile);
    return result;
  };

  return {
    imageUrl: getProfileImageUrl(),
    initials: getUserInitials(),
    uploading: imageUploading,
    uploadImage: handleImageUpload,
    hasImage: !!getProfileImageUrl()
  };
};

/**
 * useProfileValidation - Custom hook for profile data validation
 */
export const useProfileValidation = () => {
  const { user } = useProfileStore();

  const validateProfileData = (data) => {
    const errors = {};

    // Validate first name
    if (!data.first_name || data.first_name.trim().length === 0) {
      errors.first_name = 'First name is required';
    } else if (data.first_name.length > 50) {
      errors.first_name = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(data.first_name)) {
      errors.first_name = 'First name can only contain letters and spaces';
    }

    // Validate last name (optional)
    if (data.last_name && data.last_name.length > 50) {
      errors.last_name = 'Last name must be less than 50 characters';
    } else if (data.last_name && !/^[a-zA-Z\s]*$/.test(data.last_name)) {
      errors.last_name = 'Last name can only contain letters and spaces';
    }

    // Validate email
    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate language preference
    if (data.preferred_language) {
      const validLanguages = ['en', 'hi', 'pu', 'mr'];
      if (!validLanguages.includes(data.preferred_language)) {
        errors.preferred_language = 'Please select a valid language';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const getRequiredFields = () => {
    return ['first_name', 'email'];
  };

  const getOptionalFields = () => {
    return ['last_name', 'preferred_language'];
  };

  const isFieldRequired = (fieldName) => {
    return getRequiredFields().includes(fieldName);
  };

  const getFieldValidationRules = (fieldName) => {
    const rules = {
      first_name: {
        required: true,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
        patternMessage: 'Only letters and spaces are allowed'
      },
      last_name: {
        required: false,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]*$/,
        patternMessage: 'Only letters and spaces are allowed'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please enter a valid email address'
      },
      preferred_language: {
        required: false,
        options: ['en', 'hi', 'pu', 'mr']
      }
    };

    return rules[fieldName] || {};
  };

  return {
    validateProfileData,
    getRequiredFields,
    getOptionalFields,
    isFieldRequired,
    getFieldValidationRules,
    currentUser: user
  };
};

export default useProfile;
