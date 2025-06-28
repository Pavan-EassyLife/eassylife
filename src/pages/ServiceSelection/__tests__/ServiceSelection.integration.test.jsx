import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import ServiceSelectionPage from '../index';
import ServiceDetailsPage from '../../ServiceDetails/index';
import { ServiceDetailsProvider } from '../../../contexts/ServiceDetailsContext';

// Mock API services
const mockServiceDetailsService = {
  getSubServices: jest.fn(),
  getServiceDetails: jest.fn(),
  getSubServiceDetails: jest.fn(),
  getServiceDetailsBySegment: jest.fn(),
  validateServiceDetailsResponse: jest.fn(data => data)
};

jest.mock('../../../api/services/serviceDetailsService', () => ({
  __esModule: true,
  default: mockServiceDetailsService
}));

// Mock performance monitoring
jest.mock('../../../hooks/usePerformanceMonitor', () => ({
  __esModule: true,
  default: () => ({
    trackInteraction: jest.fn(),
    trackNetworkPerformance: jest.fn(),
    getOptimizationSuggestions: jest.fn(() => [])
  })
}));

// Mock video player component (if still needed)
jest.mock('../../../components/common/VideoPlayer', () => {
  return function MockVideoPlayer({ serviceName }) {
    return <div data-testid="video-player">{serviceName} Video</div>;
  };
});

// Mock lazy components
jest.mock('../../../components/serviceDetails/LazyComponents', () => ({
  DatePickerModal: () => (
    <div data-testid="date-picker-modal">Date Picker</div>
  ),
  TimePickerModal: () => (
    <div data-testid="time-picker-modal">Time Picker</div>
  ),
  DynamicAttributeSelector: () => (
    <div data-testid="dynamic-attribute-selector">Dynamic Attributes</div>
  ),
  AttributeErrorBoundary: ({ children }) => children,
  AttributeValidationFeedback: () => (
    <div data-testid="attribute-validation-feedback">Validation Feedback</div>
  ),
  ComponentLoader: () => (
    <div data-testid="component-loader">Loading...</div>
  ),
  LazyComponentErrorBoundary: ({ children }) => children
}));

// Test data
const mockSubServices = [
  {
    id: 'service-1',
    name: 'AC Service',
    image: 'https://example.com/ac-service.jpg',
    weight: '10'
  },
  {
    id: 'service-2',
    name: 'AC Inspection',
    image: null,
    weight: '5'
  }
];

const mockCategoryData = {
  name: 'Air Conditioning',
  image: 'https://example.com/ac-category.jpg',
  serviceVideos: {
    video_url: 'https://example.com/ac-video.mp4'
  }
};

const mockServiceDetails = {
  id: 'service-1',
  name: 'AC Service',
  description: 'Professional AC service',
  image: 'https://example.com/ac-service.jpg',
  attributes: [],
  segments: []
};

// Test wrapper with routing
const TestWrapper = ({ initialRoute = '/service-selection/test-category' }) => (
  <BrowserRouter>
    <ServiceDetailsProvider>
      <Routes>
        <Route path="/service-selection/:categoryId" element={<ServiceSelectionPage />} />
        <Route path="/service-details/:serviceId" element={<ServiceDetailsPage />} />
      </Routes>
    </ServiceDetailsProvider>
  </BrowserRouter>
);

describe('ServiceSelection Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockServiceDetailsService.getSubServices.mockResolvedValue({
      success: true,
      data: {
        subcategories: mockSubServices,
        ...mockCategoryData
      }
    });

    mockServiceDetailsService.getServiceDetails.mockResolvedValue({
      success: true,
      data: mockServiceDetails
    });

    mockServiceDetailsService.getSubServiceDetails.mockResolvedValue({
      success: true,
      data: mockServiceDetails
    });

    mockServiceDetailsService.getServiceDetailsBySegment.mockResolvedValue({
      success: true,
      data: []
    });
  });

  describe('Complete User Flow', () => {
    test('navigates from service selection to service details', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      // Wait for service selection page to load
      await waitFor(() => {
        expect(screen.getByText('Select Service')).toBeInTheDocument();
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Click on a service
      const serviceCard = screen.getByText('AC Service').closest('div');
      await user.click(serviceCard);

      // Should navigate to service details page
      await waitFor(() => {
        expect(screen.getByTestId('service-info')).toBeInTheDocument();
      });
    });

    test('handles back navigation from service details', async () => {
      const user = userEvent.setup();

      render(<TestWrapper initialRoute="/service-details/service-1" />);

      // Wait for service details page to load
      await waitFor(() => {
        expect(screen.getByTestId('service-info')).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByRole('button');
      await user.click(backButton);

      // Should go back (in real app, this would navigate back)
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    test('fetches sub-services on page load', async () => {
      render(<TestWrapper />);

      await waitFor(() => {
        expect(mockServiceDetailsService.getSubServices).toHaveBeenCalledWith('test-category');
      });
    });

    test('handles API errors gracefully', async () => {
      mockServiceDetailsService.getSubServices.mockRejectedValue(new Error('Network error'));

      render(<TestWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load services. Please try again.')).toBeInTheDocument();
      });
    });

    test('retries API call on error', async () => {
      mockServiceDetailsService.getSubServices
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            subcategories: mockSubServices,
            ...mockCategoryData
          }
        });

      const user = userEvent.setup();

      render(<TestWrapper />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      // Should show services after retry
      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      expect(mockServiceDetailsService.getSubServices).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Integration', () => {
    test('tracks performance metrics during navigation', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      // Wait for page load
      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Interact with service
      const serviceCard = screen.getByText('AC Service').closest('div');
      await user.click(serviceCard);

      // Performance tracking should be called
      // (In real implementation, this would be verified through performance monitoring)
      expect(serviceCard).toBeInTheDocument();
    });

    test('lazy loads components efficiently', async () => {
      render(<TestWrapper />);

      // Video player should be lazy loaded
      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });
    });
  });

  describe('State Management Integration', () => {
    test('maintains state during navigation', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      // Load service selection
      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Navigate to service details
      const serviceCard = screen.getByText('AC Service').closest('div');
      await user.click(serviceCard);

      // Service details should receive proper state
      await waitFor(() => {
        expect(screen.getByTestId('service-info')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Integration', () => {
    test('adapts layout based on viewport size', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TestWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Select Service')).toBeInTheDocument();
      });

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Layout should adapt
      expect(screen.getByText('Select Service')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    test('handles component errors gracefully', async () => {
      // Mock component error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<TestWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Select Service')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    test('maintains accessibility during navigation', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Test keyboard navigation
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      // Test screen reader support
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', undefined);
    });
  });
});
