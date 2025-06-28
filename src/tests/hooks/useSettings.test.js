import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSettings } from '../../hooks/useSettings';
import settingsService from '../../api/services/settingsService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { mockApiResponses, mockErrorResponses } from '../utils/test-utils';

// Mock dependencies
vi.mock('../../api/services/settingsService');
vi.mock('../../utils/errorHandler');

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset default mocks
    settingsService.getCurrentSettings.mockResolvedValue(mockApiResponses.getCurrentSettings);
    settingsService.updateNotificationPreferences.mockResolvedValue(mockApiResponses.updateNotificationPreferences);
    settingsService.updateProfileSettings.mockResolvedValue(mockApiResponses.updateProfileSettings);
    settingsService.changePassword.mockResolvedValue(mockApiResponses.changePassword);
    settingsService.toggleTwoFactorAuth.mockResolvedValue(mockApiResponses.toggleTwoFactor);
    settingsService.deactivateAccount.mockResolvedValue(mockApiResponses.deactivateAccount);
    settingsService.exportUserData.mockResolvedValue(mockApiResponses.exportData);
  });

  it('initializes with default settings', () => {
    const { result } = renderHook(() => useSettings());
    
    expect(result.current.settings).toEqual({
      notifications: {
        email: true,
        sms: true,
        push: true,
        promotional: false,
        booking: true,
        payment: true
      },
      preferences: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        theme: 'light'
      },
      security: {
        twoFactorEnabled: false,
        activeSessions: []
      }
    });
    
    expect(result.current.loading).toBe(true);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('fetches settings on mount', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(settingsService.getCurrentSettings).toHaveBeenCalledTimes(1);
    expect(result.current.settings.notifications.email).toBe(true);
  });

  it('handles fetch settings error', async () => {
    settingsService.getCurrentSettings.mockResolvedValue(mockErrorResponses.networkError);
    
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Network error occurred');
    expect(handleError.settings).toHaveBeenCalled();
  });

  it('updates notification preferences successfully', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const newNotifications = {
      email: false,
      sms: true,
      push: true,
      promotional: true,
      booking: true,
      payment: true
    };
    
    const success = await result.current.updateNotifications(newNotifications);
    
    expect(success).toBe(true);
    expect(settingsService.updateNotificationPreferences).toHaveBeenCalledWith(newNotifications);
    expect(result.current.settings.notifications).toEqual(newNotifications);
    expect(handleSuccess).toHaveBeenCalledWith('Notification preferences updated successfully');
  });

  it('handles notification update error', async () => {
    settingsService.updateNotificationPreferences.mockResolvedValue(mockErrorResponses.validationError);
    
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const newNotifications = { email: false };
    const success = await result.current.updateNotifications(newNotifications);
    
    expect(success).toBe(false);
    expect(result.current.error).toBe('Validation failed');
    expect(handleError.settings).toHaveBeenCalled();
  });

  it('updates profile preferences successfully', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const newPreferences = {
      language: 'hi',
      timezone: 'Asia/Dubai',
      currency: 'USD',
      theme: 'dark'
    };
    
    const success = await result.current.updatePreferences(newPreferences);
    
    expect(success).toBe(true);
    expect(settingsService.updateProfileSettings).toHaveBeenCalledWith(newPreferences);
    expect(result.current.settings.preferences).toEqual(newPreferences);
    expect(handleSuccess).toHaveBeenCalledWith('Profile preferences updated successfully');
  });

  it('changes password successfully', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const success = await result.current.changePassword('oldPassword', 'newPassword');
    
    expect(success).toBe(true);
    expect(settingsService.changePassword).toHaveBeenCalledWith('oldPassword', 'newPassword');
    expect(handleSuccess).toHaveBeenCalledWith('Password changed successfully');
  });

  it('toggles two-factor authentication successfully', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const success = await result.current.toggleTwoFactor(true);
    
    expect(success).toBe(true);
    expect(settingsService.toggleTwoFactorAuth).toHaveBeenCalledWith(true);
    expect(result.current.settings.security.twoFactorEnabled).toBe(true);
    expect(handleSuccess).toHaveBeenCalledWith('Two-factor authentication enabled successfully');
  });

  it('deletes account successfully', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const success = await result.current.deleteAccount('Not satisfied', 'password123');
    
    expect(success).toBe(true);
    expect(settingsService.deactivateAccount).toHaveBeenCalledWith('Not satisfied', 'password123');
    expect(handleSuccess).toHaveBeenCalledWith('Account deletion initiated successfully');
  });

  it('exports data successfully', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const success = await result.current.exportData();
    
    expect(success).toBe(true);
    expect(settingsService.exportUserData).toHaveBeenCalledTimes(1);
    expect(handleSuccess).toHaveBeenCalledWith('Data export initiated. You will receive an email with your data.');
  });

  it('sets saving state during operations', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Start an async operation
    const updatePromise = result.current.updateNotifications({ email: false });
    
    // Check saving state is true during operation
    expect(result.current.saving).toBe(true);
    
    await updatePromise;
    
    // Check saving state is false after operation
    expect(result.current.saving).toBe(false);
  });

  it('clears error when clearError is called', async () => {
    settingsService.getCurrentSettings.mockResolvedValue(mockErrorResponses.networkError);
    
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.error).toBe('Network error occurred');
    });
    
    result.current.clearError();
    
    expect(result.current.error).toBe(null);
  });

  it('refreshes settings when refreshSettings is called', async () => {
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Clear the mock call count
    settingsService.getCurrentSettings.mockClear();
    
    result.current.refreshSettings();
    
    expect(settingsService.getCurrentSettings).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate API calls when already loading', async () => {
    const { result } = renderHook(() => useSettings());
    
    // Call refetch multiple times quickly
    result.current.refetch();
    result.current.refetch();
    result.current.refetch();
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should only call the API once (initial mount call)
    expect(settingsService.getCurrentSettings).toHaveBeenCalledTimes(1);
  });

  it('maps API response to settings structure correctly', async () => {
    const customApiResponse = {
      success: true,
      data: {
        email_notifications: false,
        sms_notifications: false,
        push_notifications: false,
        promotional_notifications: true,
        booking_notifications: false,
        payment_notifications: false,
        language: 'hi',
        timezone: 'Asia/Dubai',
        currency: 'USD',
        theme: 'dark',
        two_factor_enabled: true,
        active_sessions: [{ device: 'Test Device' }]
      }
    };
    
    settingsService.getCurrentSettings.mockResolvedValue(customApiResponse);
    
    const { result } = renderHook(() => useSettings());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.settings).toEqual({
      notifications: {
        email: false,
        sms: false,
        push: false,
        promotional: true,
        booking: false,
        payment: false
      },
      preferences: {
        language: 'hi',
        timezone: 'Asia/Dubai',
        currency: 'USD',
        theme: 'dark'
      },
      security: {
        twoFactorEnabled: true,
        activeSessions: [{ device: 'Test Device' }]
      }
    });
  });
});
