import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import notificationService from '../api/services/notificationService.js';
import toast from 'react-hot-toast';

/**
 * Notification Store - Manages notification preferences and settings
 * Uses Zustand for state management with devtools integration
 */
const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // State
      preferences: {
        is_whatsapp_checked: true,
        service_update: true,
        marketing_update: false
      },
      loading: false,
      updating: false,
      error: null,
      lastFetched: null,

      // Actions
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      
      setUpdating: (updating) => set({ updating }, false, 'setUpdating'),
      
      setError: (error) => set({ error }, false, 'setError'),
      
      setPreferences: (preferences) => set({ 
        preferences, 
        lastFetched: Date.now() 
      }, false, 'setPreferences'),

      clearError: () => set({ error: null }, false, 'clearError'),

      // Async Actions
      fetchNotificationPreferences: async (force = false) => {
        const state = get();
        
        // Skip if already loading
        if (state.loading) return;

        // Skip if recently fetched (within 2 minutes) unless forced
        const twoMinutes = 2 * 60 * 1000;
        if (!force && state.lastFetched && (Date.now() - state.lastFetched) < twoMinutes) {
          return;
        }

        set({ loading: true, error: null }, false, 'fetchNotificationPreferences:start');
        
        try {
          const response = await notificationService.getNotificationPreferences();
          
          if (response.success && response.data) {
            // Extract notification preferences from response
            const preferences = {
              is_whatsapp_checked: response.data.is_whatsapp_checked ?? true,
              service_update: response.data.service_update ?? true,
              marketing_update: response.data.marketing_update ?? false
            };

            set({ 
              preferences, 
              loading: false,
              lastFetched: Date.now()
            }, false, 'fetchNotificationPreferences:success');
          } else {
            // Use default preferences if no data
            const defaultPreferences = notificationService.getDefaultPreferences();
            set({ 
              preferences: defaultPreferences, 
              loading: false,
              lastFetched: Date.now()
            }, false, 'fetchNotificationPreferences:default');
          }
        } catch (error) {
          console.error('❌ Notification preferences fetch error:', error);
          
          // Use default preferences on error
          const defaultPreferences = notificationService.getDefaultPreferences();
          set({ 
            preferences: defaultPreferences,
            error: error.message, 
            loading: false 
          }, false, 'fetchNotificationPreferences:error');
          
          // Don't show error toast for fetch failures - use defaults silently
          console.warn('Using default notification preferences due to fetch error');
        }
      },

      updateNotificationPreferences: async (newPreferences) => {
        const state = get();
        
        // Skip if already updating
        if (state.updating) return { success: false, error: 'Update in progress' };

        set({ updating: true, error: null }, false, 'updateNotificationPreferences:start');
        
        try {
          // Validate preferences
          const validation = notificationService.validatePreferences(newPreferences);
          if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            throw new Error(errorMessage);
          }

          const response = await notificationService.updateNotificationPreferences(newPreferences);
          
          if (response.success) {
            // Update local preferences
            const updatedPreferences = {
              ...state.preferences,
              ...newPreferences
            };

            set({ 
              preferences: updatedPreferences, 
              updating: false,
              lastFetched: Date.now()
            }, false, 'updateNotificationPreferences:success');

            // Show success toast
            toast.success('Notification preferences updated');
            
            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Failed to update notification preferences');
          }
        } catch (error) {
          console.error('❌ Notification preferences update error:', error);
          set({ 
            error: error.message, 
            updating: false 
          }, false, 'updateNotificationPreferences:error');
          
          // Show error toast
          toast.error(error.message || 'Failed to update notification preferences');
          
          return { success: false, error: error.message };
        }
      },

      // Individual preference toggles
      toggleWhatsAppNotifications: async (enabled) => {
        const state = get();
        
        try {
          const newPreferences = {
            is_whatsapp_checked: enabled
          };

          // If disabling WhatsApp, also disable individual settings
          if (!enabled) {
            newPreferences.service_update = false;
            newPreferences.marketing_update = false;
          }

          return await get().updateNotificationPreferences(newPreferences);
        } catch (error) {
          console.error('❌ Toggle WhatsApp notifications error:', error);
          return { success: false, error: error.message };
        }
      },

      toggleServiceAlerts: async (enabled) => {
        const state = get();
        
        try {
          // If enabling service alerts, ensure WhatsApp is enabled
          const newPreferences = {
            service_update: enabled
          };

          if (enabled && !state.preferences.is_whatsapp_checked) {
            newPreferences.is_whatsapp_checked = true;
          }

          return await get().updateNotificationPreferences(newPreferences);
        } catch (error) {
          console.error('❌ Toggle service alerts error:', error);
          return { success: false, error: error.message };
        }
      },

      toggleMarketingUpdates: async (enabled) => {
        const state = get();
        
        try {
          // If enabling marketing updates, ensure WhatsApp is enabled
          const newPreferences = {
            marketing_update: enabled
          };

          if (enabled && !state.preferences.is_whatsapp_checked) {
            newPreferences.is_whatsapp_checked = true;
          }

          return await get().updateNotificationPreferences(newPreferences);
        } catch (error) {
          console.error('❌ Toggle marketing updates error:', error);
          return { success: false, error: error.message };
        }
      },

      // Utility functions
      canReceiveNotifications: (type) => {
        const state = get();
        return notificationService.canReceiveNotification(state.preferences, type);
      },

      getPreferenceLabels: () => {
        return notificationService.getPreferenceLabels();
      },

      isAllNotificationsEnabled: () => {
        const state = get();
        return state.preferences.is_whatsapp_checked;
      },

      hasAnyIndividualPreferenceEnabled: () => {
        const state = get();
        return state.preferences.service_update || state.preferences.marketing_update;
      },

      // Reset store
      reset: () => {
        const defaultPreferences = notificationService.getDefaultPreferences();
        set({
          preferences: defaultPreferences,
          loading: false,
          updating: false,
          error: null,
          lastFetched: null
        }, false, 'reset');
      },

      // Refresh preferences
      refresh: async () => {
        return get().fetchNotificationPreferences(true);
      }
    }),
    {
      name: 'notification-store',
      // Only enable devtools in development
      enabled: import.meta.env.DEV
    }
  )
);

export default useNotificationStore;
