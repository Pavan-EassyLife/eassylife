import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import NotificationSettings from '../../../components/settings/NotificationSettings';
import { mockSettings } from '../../utils/test-utils';

describe('NotificationSettings', () => {
  const defaultProps = {
    notifications: mockSettings.notifications,
    onUpdate: vi.fn(),
    saving: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification preferences correctly', () => {
    render(<NotificationSettings {...defaultProps} />);
    
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Communication Channels')).toBeInTheDocument();
    expect(screen.getByText('Service Updates')).toBeInTheDocument();
    expect(screen.getByText('Marketing & Promotions')).toBeInTheDocument();
  });

  it('displays all notification types', () => {
    render(<NotificationSettings {...defaultProps} />);
    
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Booking Notifications')).toBeInTheDocument();
    expect(screen.getByText('Payment Notifications')).toBeInTheDocument();
    expect(screen.getByText('Promotional Alerts')).toBeInTheDocument();
  });

  it('shows correct initial toggle states', () => {
    render(<NotificationSettings {...defaultProps} />);
    
    const toggles = screen.getAllByRole('switch');
    
    // Based on mockSettings.notifications
    expect(toggles[0]).toHaveAttribute('aria-checked', 'true'); // email
    expect(toggles[1]).toHaveAttribute('aria-checked', 'true'); // sms
    expect(toggles[2]).toHaveAttribute('aria-checked', 'true'); // push
    expect(toggles[3]).toHaveAttribute('aria-checked', 'true'); // booking
    expect(toggles[4]).toHaveAttribute('aria-checked', 'true'); // payment
    expect(toggles[5]).toHaveAttribute('aria-checked', 'false'); // promotional
  });

  it('calls onUpdate when notification is toggled', async () => {
    const onUpdate = vi.fn();
    render(<NotificationSettings {...defaultProps} onUpdate={onUpdate} />);
    
    const emailToggle = screen.getAllByRole('switch')[0];
    fireEvent.click(emailToggle);
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        ...mockSettings.notifications,
        email: false
      });
    }, { timeout: 1000 });
  });

  it('shows saving state correctly', () => {
    render(<NotificationSettings {...defaultProps} saving={true} />);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    const toggles = screen.getAllByRole('switch');
    toggles.forEach(toggle => {
      expect(toggle).toBeDisabled();
    });
  });

  it('shows changes pending indicator', async () => {
    render(<NotificationSettings {...defaultProps} />);
    
    const emailToggle = screen.getAllByRole('switch')[0];
    fireEvent.click(emailToggle);
    
    await waitFor(() => {
      expect(screen.getByText('Changes pending')).toBeInTheDocument();
    });
  });

  it('enables all notifications when Enable All is clicked', () => {
    const onUpdate = vi.fn();
    render(<NotificationSettings {...defaultProps} onUpdate={onUpdate} />);
    
    const enableAllButton = screen.getByText('Enable All');
    fireEvent.click(enableAllButton);
    
    expect(onUpdate).toHaveBeenCalledWith({
      email: true,
      sms: true,
      push: true,
      promotional: true,
      booking: true,
      payment: true
    });
  });

  it('disables all notifications when Disable All is clicked', () => {
    const onUpdate = vi.fn();
    render(<NotificationSettings {...defaultProps} onUpdate={onUpdate} />);
    
    const disableAllButton = screen.getByText('Disable All');
    fireEvent.click(disableAllButton);
    
    expect(onUpdate).toHaveBeenCalledWith({
      email: false,
      sms: false,
      push: false,
      promotional: false,
      booking: false,
      payment: false
    });
  });

  it('disables Enable All and Disable All buttons when saving', () => {
    render(<NotificationSettings {...defaultProps} saving={true} />);
    
    const enableAllButton = screen.getByText('Enable All');
    const disableAllButton = screen.getByText('Disable All');
    
    expect(enableAllButton).toHaveClass('disabled:opacity-50');
    expect(disableAllButton).toHaveClass('disabled:opacity-50');
  });

  it('renders with empty notifications object', () => {
    render(<NotificationSettings notifications={{}} onUpdate={vi.fn()} />);
    
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    
    const toggles = screen.getAllByRole('switch');
    // Should use default values
    expect(toggles[0]).toHaveAttribute('aria-checked', 'true'); // email default
    expect(toggles[5]).toHaveAttribute('aria-checked', 'false'); // promotional default
  });

  it('handles notification descriptions correctly', () => {
    render(<NotificationSettings {...defaultProps} />);
    
    expect(screen.getByText('Receive booking updates and important information via email')).toBeInTheDocument();
    expect(screen.getByText('Get SMS alerts for bookings and urgent updates')).toBeInTheDocument();
    expect(screen.getByText('Browser push notifications for real-time updates')).toBeInTheDocument();
    expect(screen.getByText('Updates about your service bookings and appointments')).toBeInTheDocument();
    expect(screen.getByText('Transaction confirmations and payment reminders')).toBeInTheDocument();
    expect(screen.getByText('Special offers, discounts, and marketing updates')).toBeInTheDocument();
  });

  it('groups notifications by category correctly', () => {
    render(<NotificationSettings {...defaultProps} />);
    
    // Communication group
    const communicationSection = screen.getByText('Communication Channels').closest('.bg-gray-50\\/50');
    expect(communicationSection).toContainElement(screen.getByText('Email Notifications'));
    expect(communicationSection).toContainElement(screen.getByText('SMS Notifications'));
    expect(communicationSection).toContainElement(screen.getByText('Push Notifications'));
    
    // Service group
    const serviceSection = screen.getByText('Service Updates').closest('.bg-blue-50\\/30');
    expect(serviceSection).toContainElement(screen.getByText('Booking Notifications'));
    expect(serviceSection).toContainElement(screen.getByText('Payment Notifications'));
    
    // Marketing group
    const marketingSection = screen.getByText('Marketing & Promotions').closest('.bg-purple-50\\/30');
    expect(marketingSection).toContainElement(screen.getByText('Promotional Alerts'));
  });
});
