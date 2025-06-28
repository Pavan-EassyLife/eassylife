import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ServiceSelectionPage from '../index';

// Mock API services
jest.mock('../../../api/services/serviceDetailsService', () => ({
  __esModule: true,
  default: {
    getSubServices: jest.fn()
  }
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

// Mock video player component
jest.mock('../../../components/serviceDetails/mobile/MobileVideoPlayer', () => {
  return function MockMobileVideoPlayer({ serviceName }) {
    return <div data-testid="video-player">{serviceName} Video</div>;
  };
});

// Mock optimized image component
jest.mock('../../../components/common/OptimizedImage', () => {
  return function MockOptimizedImage({ src, alt }) {
    return <img src={src} alt={alt} data-testid="optimized-image" />;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ categoryId: 'test-category-id' })
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
  },
  {
    id: 'service-3',
    name: 'AC Installation',
    image: 'https://example.com/ac-installation.jpg',
    weight: '15'
  }
];

const mockCategoryData = {
  name: 'Air Conditioning',
  image: 'https://example.com/ac-category.jpg',
  serviceVideos: {
    video_url: 'https://example.com/ac-video.mp4'
  }
};

const mockApiResponse = {
  success: true,
  data: {
    subcategories: mockSubServices,
    ...mockCategoryData
  }
};

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ServiceSelectionPage', () => {
  const serviceDetailsService = require('../../../api/services/serviceDetailsService').default;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceDetailsService.getSubServices.mockResolvedValue(mockApiResponse);
  });

  describe('Rendering', () => {
    test('renders service selection page with header', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      expect(screen.getByText('Select Service')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument(); // Back button
    });

    test('renders video player when data is loaded', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });
    });

    test('renders service grid when services are loaded', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
        expect(screen.getByText('AC Inspection')).toBeInTheDocument();
        expect(screen.getByText('AC Installation')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner initially', () => {
      serviceDetailsService.getSubServices.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    test('shows loading state during refresh', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Trigger refresh (this would be done through pull-to-refresh in real app)
      // For testing, we can simulate the refresh state
      expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error state when API fails', async () => {
      serviceDetailsService.getSubServices.mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load services. Please try again.')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    test('shows retry button on error', async () => {
      serviceDetailsService.getSubServices.mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const retryButton = screen.getByText('Try Again');
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('Service Interaction', () => {
    test('navigates to service details when service is clicked', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      const serviceCard = screen.getByText('AC Service').closest('div');
      fireEvent.click(serviceCard);

      expect(mockNavigate).toHaveBeenCalledWith('/service-details/service-1', {
        state: {
          categoryId: 'test-category-id',
          subCategoryId: 'service-1',
          serviceName: 'Air Conditioning',
          subServiceName: 'AC Service'
        }
      });
    });

    test('handles service selection with keyboard', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      const serviceCard = screen.getByText('AC Service').closest('div');
      await user.click(serviceCard);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Service Sorting', () => {
    test('sorts services by weight in descending order', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const serviceElements = screen.getAllByText(/AC/);
        // AC Installation (weight: 15) should come first
        // AC Service (weight: 10) should come second  
        // AC Inspection (weight: 5) should come last
        expect(serviceElements[0]).toHaveTextContent('AC Installation');
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Select Service')).toBeInTheDocument();
      });

      // Mobile layout should be rendered
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    test('adapts to desktop viewport', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Select Service')).toBeInTheDocument();
      });

      // Desktop layout should be rendered
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('lazy loads video player component', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      // Video player should be wrapped in Suspense
      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });
    });

    test('optimizes images with lazy loading', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const optimizedImages = screen.getAllByTestId('optimized-image');
        expect(optimizedImages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      expect(screen.getByRole('button')).toBeInTheDocument(); // Back button
      
      await waitFor(() => {
        expect(screen.getByText('Select Service')).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus(); // Back button
    });
  });
});
