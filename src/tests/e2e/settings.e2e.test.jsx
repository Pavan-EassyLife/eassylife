import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import SettingsPage from '../../pages/Settings/index';
import { useSettings } from '../../hooks/useSettings';
import { mockUseSettings, mockSettings } from '../utils/test-utils';

// Mock the useSettings hook
vi.mock('../../hooks/useSettings');

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Settings Page E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue(mockUseSettings);
  });

  it('renders complete settings page correctly', async () => {
    render(<SettingsPage />);
    
    // Check page title and meta
    expect(document.title).toBe('Settings - EassyLife');
    
    // Check header
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    
    // Check all sections are present
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Account Preferences')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Security')).toBeInTheDocument();
    expect(screen.getByText('Account Actions')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    useSettings.mockReturnValue({
      ...mockUseSettings,
      loading: true
    });
    
    render(<SettingsPage />);
    
    // Should show skeleton loader instead of content
    expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
  });

  it('shows error state correctly', () => {
    useSettings.mockReturnValue({
      ...mockUseSettings,
      error: 'Failed to load settings'
    });
    
    render(<SettingsPage />);
    
    expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
  });

  it('handles back navigation', () => {
    render(<SettingsPage />);
    
    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('complete notification settings flow', async () => {
    const mockUpdateNotifications = vi.fn().mockResolvedValue(true);
    useSettings.mockReturnValue({
      ...mockUseSettings,
      updateNotifications: mockUpdateNotifications
    });
    
    render(<SettingsPage />);
    
    // Find and toggle email notifications
    const emailToggle = screen.getAllByRole('switch')[0];
    expect(emailToggle).toHaveAttribute('aria-checked', 'true');
    
    fireEvent.click(emailToggle);
    
    // Wait for the auto-save to trigger
    await waitFor(() => {
      expect(mockUpdateNotifications).toHaveBeenCalledWith({
        ...mockSettings.notifications,
        email: false
      });
    }, { timeout: 1000 });
  });

  it('complete account preferences flow', async () => {
    const mockUpdatePreferences = vi.fn().mockResolvedValue(true);
    useSettings.mockReturnValue({
      ...mockUseSettings,
      updatePreferences: mockUpdatePreferences
    });
    
    render(<SettingsPage />);
    
    // Find language dropdown
    const languageSelect = screen.getByDisplayValue('English');
    fireEvent.change(languageSelect, { target: { value: 'hi' } });
    
    // Wait for the auto-save to trigger
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockSettings.preferences,
        language: 'hi'
      });
    }, { timeout: 1000 });
  });

  it('complete privacy & security flow', async () => {
    const mockChangePassword = vi.fn().mockResolvedValue(true);
    const mockToggleTwoFactor = vi.fn().mockResolvedValue(true);
    
    useSettings.mockReturnValue({
      ...mockUseSettings,
      changePassword: mockChangePassword,
      toggleTwoFactor: mockToggleTwoFactor
    });
    
    render(<SettingsPage />);
    
    // Test change password
    const changePasswordButton = screen.getByText('Change');
    fireEvent.click(changePasswordButton);
    
    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });
    
    // Fill password form
    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    
    fireEvent.change(currentPasswordInput, { target: { value: 'oldPassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    
    // Submit form
    const submitButton = screen.getByText('Change Password');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('oldPassword', 'newPassword123');
    });
    
    // Test two-factor toggle
    const twoFactorToggle = screen.getByLabelText(/Two-Factor Authentication/);
    fireEvent.click(twoFactorToggle);
    
    await waitFor(() => {
      expect(mockToggleTwoFactor).toHaveBeenCalledWith(true);
    });
  });

  it('complete account actions flow', async () => {
    const mockExportData = vi.fn().mockResolvedValue(true);
    const mockDeleteAccount = vi.fn().mockResolvedValue(true);
    
    useSettings.mockReturnValue({
      ...mockUseSettings,
      exportData: mockExportData,
      deleteAccount: mockDeleteAccount
    });
    
    render(<SettingsPage />);
    
    // Test export data
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockExportData).toHaveBeenCalled();
    });
    
    // Test delete account flow
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
    
    // Select reason
    const reasonRadio = screen.getByLabelText('Not satisfied with services');
    fireEvent.click(reasonRadio);
    
    // Continue to confirmation
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    // Fill confirmation form
    await waitFor(() => {
      expect(screen.getByText('Final Confirmation')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Enter your password to confirm');
    const confirmationInput = screen.getByPlaceholderText('DELETE');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });
    
    // Submit deletion
    const deleteAccountButton = screen.getByText('Delete Account');
    fireEvent.click(deleteAccountButton);
    
    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledWith('Not satisfied with services', 'password123');
    });
  });

  it('shows saving states correctly', () => {
    useSettings.mockReturnValue({
      ...mockUseSettings,
      saving: true
    });
    
    render(<SettingsPage />);
    
    // Header should show saving state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // All toggles should be disabled
    const toggles = screen.getAllByRole('switch');
    toggles.forEach(toggle => {
      expect(toggle).toBeDisabled();
    });
    
    // All buttons should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      if (button.textContent !== 'Saving...') {
        expect(button).toBeDisabled();
      }
    });
  });

  it('handles keyboard navigation correctly', () => {
    render(<SettingsPage />);
    
    // Test tab navigation through toggles
    const toggles = screen.getAllByRole('switch');
    
    toggles[0].focus();
    expect(toggles[0]).toHaveFocus();
    
    // Test space key activation
    fireEvent.keyDown(toggles[0], { key: ' ' });
    expect(mockUseSettings.updateNotifications).toHaveBeenCalled();
    
    // Test enter key activation
    fireEvent.keyDown(toggles[1], { key: 'Enter' });
    expect(mockUseSettings.updateNotifications).toHaveBeenCalled();
  });

  it('handles responsive design correctly', () => {
    // Mock window.matchMedia for mobile
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(<SettingsPage />);
    
    // Check that the grid layout adapts
    const settingsGrid = screen.getByRole('main').querySelector('.grid');
    expect(settingsGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('maintains accessibility standards', () => {
    render(<SettingsPage />);
    
    // Check ARIA labels
    const toggles = screen.getAllByRole('switch');
    toggles.forEach(toggle => {
      expect(toggle).toHaveAttribute('aria-checked');
      expect(toggle).toHaveAttribute('aria-label');
    });
    
    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Settings');
    
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(4); // Four main sections
    
    // Check focus management
    const backButton = screen.getByLabelText('Go back');
    expect(backButton).toHaveAttribute('aria-label');
  });
});
