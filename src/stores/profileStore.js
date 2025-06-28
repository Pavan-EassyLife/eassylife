import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import profileService from '../api/services/profileService.js';
import toast from 'react-hot-toast';

/**
 * Profile Store - Manages user profile data and operations
 * Uses Zustand for state management with devtools integration
 */
const useProfileStore = create(
  devtools(
    (set, get) => ({
      // State
      user: null,
      loading: false,
      imageUploading: false,
      error: null,
      lastFetched: null,

      // Actions
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      
      setImageUploading: (imageUploading) => set({ imageUploading }, false, 'setImageUploading'),
      
      setError: (error) => set({ error }, false, 'setError'),
      
      setUser: (user) => set({ 
        user, 
        lastFetched: Date.now() 
      }, false, 'setUser'),

      clearError: () => set({ error: null }, false, 'clearError'),

      // Async Actions
      fetchProfile: async (force = false) => {
        const state = get();
        
        // Skip if already loading
        if (state.loading) return;

        // Skip if recently fetched (within 5 minutes) unless forced
        const fiveMinutes = 5 * 60 * 1000;
        if (!force && state.lastFetched && (Date.now() - state.lastFetched) < fiveMinutes) {
          return;
        }

        set({ loading: true, error: null }, false, 'fetchProfile:start');
        
        try {
          const response = await profileService.getProfile();
          
          if (response.success) {
            set({ 
              user: response.data, 
              loading: false,
              lastFetched: Date.now()
            }, false, 'fetchProfile:success');
          } else {
            throw new Error(response.message || 'Failed to fetch profile');
          }
        } catch (error) {
          console.error('❌ Profile fetch error:', error);
          set({ 
            error: error.message, 
            loading: false 
          }, false, 'fetchProfile:error');
          
          // Show error toast
          toast.error(error.message || 'Failed to load profile');
        }
      },

      updateProfile: async (profileData) => {
        const state = get();
        
        // Skip if already loading
        if (state.loading) return { success: false, error: 'Update in progress' };

        set({ loading: true, error: null }, false, 'updateProfile:start');
        
        try {
          // Validate data before sending
          const validation = profileService.validateProfileData(profileData);
          if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            throw new Error(errorMessage);
          }

          const response = await profileService.updateProfile(profileData);
          
          if (response.success) {
            // Update user data with new information
            const currentUser = state.user;
            const updatedUser = {
              ...currentUser,
              ...response.data,
              // Ensure we keep the full profile structure
              first_name: response.data.first_name || profileData.first_name,
              last_name: response.data.last_name || profileData.last_name,
              email: response.data.email || profileData.email,
              preferred_language: response.data.preferred_language || profileData.preferred_language
            };

            set({ 
              user: updatedUser, 
              loading: false,
              lastFetched: Date.now()
            }, false, 'updateProfile:success');

            // Show success toast
            toast.success('Profile updated successfully');
            
            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Failed to update profile');
          }
        } catch (error) {
          console.error('❌ Profile update error:', error);
          set({ 
            error: error.message, 
            loading: false 
          }, false, 'updateProfile:error');
          
          // Show error toast
          toast.error(error.message || 'Failed to update profile');
          
          return { success: false, error: error.message };
        }
      },

      uploadProfileImage: async (imageFile) => {
        const state = get();
        
        // Skip if already uploading
        if (state.imageUploading) return { success: false, error: 'Upload in progress' };

        set({ imageUploading: true, error: null }, false, 'uploadProfileImage:start');
        
        try {
          const response = await profileService.uploadProfileImage(imageFile);
          
          if (response.success) {
            // Update user data with new image
            const currentUser = state.user;
            const updatedUser = {
              ...currentUser,
              image: response.data.image || response.data.imageUrl
            };

            set({ 
              user: updatedUser, 
              imageUploading: false,
              lastFetched: Date.now()
            }, false, 'uploadProfileImage:success');

            // Show success toast
            toast.success('Profile picture updated successfully');
            
            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Failed to upload image');
          }
        } catch (error) {
          console.error('❌ Profile image upload error:', error);
          set({ 
            error: error.message, 
            imageUploading: false 
          }, false, 'uploadProfileImage:error');
          
          // Show error toast
          toast.error(error.message || 'Failed to upload profile picture');
          
          return { success: false, error: error.message };
        }
      },

      // Utility functions
      getUserInitials: () => {
        const state = get();
        if (!state.user) return 'U';

        const firstName = state.user.first_name || '';
        const lastName = state.user.last_name || '';
        const email = state.user.email || '';

        // Try to get initials from first and last name
        if (firstName && lastName) {
          return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }

        // If only first name, use first two characters or first char + 'U'
        if (firstName) {
          return firstName.length > 1
            ? `${firstName.charAt(0)}${firstName.charAt(1)}`.toUpperCase()
            : `${firstName.charAt(0)}U`.toUpperCase();
        }

        // If only last name, use first two characters or 'U' + first char
        if (lastName) {
          return lastName.length > 1
            ? `${lastName.charAt(0)}${lastName.charAt(1)}`.toUpperCase()
            : `U${lastName.charAt(0)}`.toUpperCase();
        }

        // Fallback to email initials
        if (email) {
          const emailName = email.split('@')[0];
          return emailName.length > 1
            ? `${emailName.charAt(0)}${emailName.charAt(1)}`.toUpperCase()
            : `${emailName.charAt(0)}U`.toUpperCase();
        }

        return 'U';
      },

      getUserDisplayName: () => {
        const state = get();
        if (!state.user) return 'User';
        
        const firstName = state.user.first_name || '';
        const lastName = state.user.last_name || '';
        
        return `${firstName} ${lastName}`.trim() || 'User';
      },

      getProfileImageUrl: () => {
        const state = get();
        return state.user?.image || null;
      },

      isProfileComplete: () => {
        const state = get();
        if (!state.user) return false;
        
        return !!(
          state.user.first_name &&
          state.user.email &&
          state.user.mobile
        );
      },

      // Reset store
      reset: () => set({
        user: null,
        loading: false,
        imageUploading: false,
        error: null,
        lastFetched: null
      }, false, 'reset'),

      // Refresh profile data
      refresh: async () => {
        return get().fetchProfile(true);
      }
    }),
    {
      name: 'profile-store',
      // Only enable devtools in development
      enabled: import.meta.env.DEV
    }
  )
);

export default useProfileStore;
