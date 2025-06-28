import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ServiceDetails from '../index';
import { ServiceDetailsProvider } from '../../../contexts/ServiceDetailsContext';

// Mock API services
jest.mock('../../../api/services/serviceDetailsService', () => ({
  getServiceDetails: jest.fn(),
  getSubServices: jest.fn(),
  getServiceDetailsBySegment: jest.fn(),
  validateServiceDetailsResponse: jest.fn(data => data)
}));

// Mock hooks
jest.mock('../../../hooks/useServiceDetails', () => ({
  useServiceDetails: () => ({
    serviceDetails: mockServiceDetails,
    subServices: [],
    loading: false,
    error: null,
    hasSubcategories: false,
    showSubcategorySelection: false,
    fetchServiceDetails: jest.fn(),
    selectSubService: jest.fn()
  }),
  useServiceSegments: () => ({
    serviceSegments: mockServiceSegments,
    selectedSegment: mockServiceSegments[0],
    fetchServiceSegments: jest.fn(),
    selectSegment: jest.fn()
  }),
  useBookingState: () => ({
    selectedDate: null,
    timeFromValue: null,
    timeToValue: null,
    isBookingComplete: false,
    selectDate: jest.fn(),
    selectTimeFrom: jest.fn(),
    selectTimeTo: jest.fn()
  })
}));

// Mock data
const mockServiceDetails = {
  id: '1',
  name: 'Dog Training',
  service_time: '60 minutes',
  meta_description: 'Professional dog training service',
  image: 'https://example.com/dog-training.jpg',
  serviceVideos: {
    video_url: 'https://example.com/video.mp4'
  },
  attributes: {
    'attr1': {
      id: 'attr1',
      name: 'Session Type',
      options: {
        'basic': [
          { id: 'opt1', value: 'Basic Training', weight: 1 },
          { id: 'opt2', value: 'Advanced Training', weight: 2 }
        ]
      }
    }
  },
  includeItems: [
    { name: 'Training Manual', description: 'Comprehensive guide' }
  ],
  excludeItems: [
    { name: 'Dog Food', description: 'Not included in service' }
  ]
};

const mockServiceSegments = [
  {
    id: 'seg1',
    name: 'Basic Package',
    price: '₹1000',
    duration: '1 hour',
    description: 'Basic training session'
  },
  {
    id: 'seg2',
    name: 'Premium Package',
    price: '₹2000',
    duration: '2 hours',
    description: 'Comprehensive training session'
  }
];

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ServiceDetailsProvider>
      {children}
    </ServiceDetailsProvider>
  </BrowserRouter>
);

describe('ServiceDetails Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('1024px') ? false : true, // Default to mobile
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Page Loading and Rendering', () => {
    test('renders service details page with all components', async () => {
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Check for main components
      await waitFor(() => {
        expect(screen.getByText('Dog Training')).toBeInTheDocument();
        expect(screen.getByText('Professional dog training service')).toBeInTheDocument();
        expect(screen.getByText('60 minutes')).toBeInTheDocument();
      });
    });

    test('shows loading state initially', () => {
      // Mock loading state
      jest.doMock('../../../hooks/useServiceDetails', () => ({
        useServiceDetails: () => ({
          serviceDetails: null,
          loading: true,
          error: null
        })
      }));

      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      expect(screen.getByText('Loading service details...')).toBeInTheDocument();
    });

    test('shows error state when service fails to load', () => {
      // Mock error state
      jest.doMock('../../../hooks/useServiceDetails', () => ({
        useServiceDetails: () => ({
          serviceDetails: null,
          loading: false,
          error: 'Failed to load service'
        })
      }));

      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Failed to load service')).toBeInTheDocument();
    });
  });

  describe('Mobile vs Desktop Rendering', () => {
    test('renders mobile layout on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Mobile-specific elements should be present
      expect(screen.getByTestId('mobile-video-player')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-booking-panel')).toBeInTheDocument();
    });

    test('renders desktop layout on large screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Desktop-specific elements should be present
      expect(screen.getByTestId('desktop-service-details')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles attribute selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Session Type')).toBeInTheDocument();
      });

      const basicOption = screen.getByText('Basic Training');
      await user.click(basicOption);

      expect(basicOption).toHaveClass('bg-orange-500'); // Selected state
    });

    test('handles service segment selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Basic Package')).toBeInTheDocument();
      });

      const premiumPackage = screen.getByText('Premium Package');
      await user.click(premiumPackage);

      expect(premiumPackage.closest('div')).toHaveClass('border-orange-500'); // Selected state
    });

    test('handles date and time selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Open date picker
      const dateButton = screen.getByText('Select Date');
      await user.click(dateButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Select Date')).toBeInTheDocument();

      // Select a date
      const dateOption = screen.getByText('15');
      await user.click(dateOption);

      // Open time picker
      const timeButton = screen.getByText('Select Time');
      await user.click(timeButton);

      expect(screen.getByText('Morning')).toBeInTheDocument();
    });
  });

  describe('Booking Flow', () => {
    test('validates booking requirements', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Try to continue without selecting required fields
      const continueButton = screen.getByText('Continue to Provider Selection');
      await user.click(continueButton);

      // Should show validation errors
      expect(screen.getByText('Please complete the following:')).toBeInTheDocument();
      expect(screen.getByText('Please select a service package')).toBeInTheDocument();
      expect(screen.getByText('Please select a date')).toBeInTheDocument();
    });

    test('enables continue button when all requirements met', async () => {
      const user = userEvent.setup();
      
      // Mock complete booking state
      jest.doMock('../../../hooks/useServiceDetails', () => ({
        useBookingState: () => ({
          selectedDate: new Date(),
          timeFromValue: '10:00',
          timeToValue: '11:00',
          isBookingComplete: true
        })
      }));

      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      const continueButton = screen.getByText('Continue to Provider Selection');
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveTextContent('Dog Training'); // Main heading
      expect(headings[1]).toHaveTextContent('Customize Your Service'); // Section heading
    });

    test('has proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /play/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /mute/i })).toHaveFocus();
    });
  });

  describe('Performance', () => {
    test('lazy loads components', async () => {
      const { container } = render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      // Check for lazy loading indicators
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();

      // Wait for components to load
      await waitFor(() => {
        expect(screen.getByText('Dog Training')).toBeInTheDocument();
      });
    });

    test('tracks user interactions', async () => {
      const user = userEvent.setup();
      
      // Mock performance monitoring
      const mockTrackInteraction = jest.fn();
      jest.doMock('../../../hooks/usePerformanceMonitor', () => ({
        __esModule: true,
        default: () => ({
          trackInteraction: mockTrackInteraction
        })
      }));

      render(
        <TestWrapper>
          <ServiceDetails />
        </TestWrapper>
      );

      const segmentButton = screen.getByText('Basic Package');
      await user.click(segmentButton);

      expect(mockTrackInteraction).toHaveBeenCalledWith('segment_select', {
        segmentId: 'seg1'
      });
    });
  });
});
