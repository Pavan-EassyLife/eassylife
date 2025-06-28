import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

/**
 * Custom render function that includes common providers
 */
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        {children}
        <Toaster />
      </HelmetProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

/**
 * Mock settings data for testing
 */
export const mockSettings = {
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
    activeSessions: [
      {
        device: 'Chrome on Windows',
        location: 'Mumbai, India',
        lastActive: '2 minutes ago',
        current: true
      },
      {
        device: 'Safari on iPhone',
        location: 'Mumbai, India',
        lastActive: '1 hour ago',
        current: false
      }
    ]
  }
};

/**
 * Mock useSettings hook
 */
export const mockUseSettings = {
  settings: mockSettings,
  loading: false,
  saving: false,
  error: null,
  updateNotifications: vi.fn().mockResolvedValue(true),
  updatePreferences: vi.fn().mockResolvedValue(true),
  changePassword: vi.fn().mockResolvedValue(true),
  toggleTwoFactor: vi.fn().mockResolvedValue(true),
  deleteAccount: vi.fn().mockResolvedValue(true),
  exportData: vi.fn().mockResolvedValue(true),
  clearError: vi.fn(),
  refreshSettings: vi.fn(),
  refetch: vi.fn()
};

/**
 * Mock API responses
 */
export const mockApiResponses = {
  getCurrentSettings: {
    success: true,
    data: {
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
      promotional_notifications: false,
      booking_notifications: true,
      payment_notifications: true,
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      theme: 'light',
      two_factor_enabled: false,
      active_sessions: []
    }
  },
  updateNotificationPreferences: {
    success: true,
    message: 'Notification preferences updated successfully'
  },
  updateProfileSettings: {
    success: true,
    message: 'Profile settings updated successfully'
  },
  changePassword: {
    success: true,
    message: 'Password changed successfully'
  },
  toggleTwoFactor: {
    success: true,
    message: 'Two-factor authentication enabled successfully'
  },
  deactivateAccount: {
    success: true,
    message: 'Account deactivated successfully'
  },
  exportData: {
    success: true,
    message: 'Data export initiated successfully'
  }
};

/**
 * Mock error responses
 */
export const mockErrorResponses = {
  networkError: {
    success: false,
    error: 'Network error occurred'
  },
  validationError: {
    success: false,
    error: 'Validation failed'
  },
  authError: {
    success: false,
    error: 'Authentication failed'
  }
};

/**
 * Helper function to wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Helper function to create mock event
 */
export const createMockEvent = (value) => ({
  target: { value },
  preventDefault: vi.fn(),
  stopPropagation: vi.fn()
});

/**
 * Helper function to mock router navigation
 */
export const mockNavigate = vi.fn();

/**
 * Helper to mock window.open
 */
export const mockWindowOpen = vi.fn();

// Setup global mocks
beforeEach(() => {
  vi.clearAllMocks();
  window.open = mockWindowOpen;
});
