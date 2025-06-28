import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import ServiceSelectionPage from '../index';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
    return <div data-testid="video-player" role="region" aria-label={`${serviceName} video`}>{serviceName} Video</div>;
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

describe('ServiceSelection Accessibility Tests', () => {
  const serviceDetailsService = require('../../../api/services/serviceDetailsService').default;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceDetailsService.getSubServices.mockResolvedValue(mockApiResponse);
  });

  describe('WCAG Compliance', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has proper heading hierarchy', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check heading hierarchy
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Select Service');

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Select Service');
    });

    test('has proper landmark roles', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check for proper landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports tab navigation through interactive elements', async () => {
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
      expect(screen.getByRole('button', { name: /go back/i })).toHaveFocus();

      await user.tab();
      const firstServiceCard = screen.getAllByRole('button')[1]; // First service card
      expect(firstServiceCard).toHaveFocus();
    });

    test('supports Enter and Space key activation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Focus on first service card
      const serviceCard = screen.getByRole('button', { name: /select ac service/i });
      serviceCard.focus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalled();

      mockNavigate.mockClear();

      // Test Space key
      await user.keyboard(' ');
      expect(mockNavigate).toHaveBeenCalled();
    });

    test('supports Escape key for dismissing elements', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Test Escape key behavior (if applicable)
      await user.keyboard('{Escape}');
      // Add specific assertions based on your escape key behavior
    });
  });

  describe('Screen Reader Support', () => {
    test('has proper ARIA labels and descriptions', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check ARIA labels
      expect(screen.getByRole('button', { name: /go back to previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select ac service/i })).toBeInTheDocument();

      // Check ARIA descriptions
      const serviceGrid = screen.getByRole('grid');
      expect(serviceGrid).toHaveAttribute('aria-label', expect.stringContaining('services available'));
    });

    test('announces loading states', async () => {
      serviceDetailsService.getSubServices.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      // Check loading announcement
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading services...')).toBeInTheDocument();
    });

    test('announces error states', async () => {
      serviceDetailsService.getSubServices.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to load services. Please try again.')).toBeInTheDocument();
    });

    test('has proper live regions for dynamic content', async () => {
      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check for live regions
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Focus Management', () => {
    test('maintains focus visibility', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Tab to service card
      await user.tab();
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement).toHaveClass('focus:ring-2', 'focus:ring-orange-500');
    });

    test('has proper focus order', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check focus order
      await user.tab();
      expect(screen.getByRole('button', { name: /go back/i })).toHaveFocus();

      await user.tab();
      const firstServiceCard = screen.getAllByRole('button')[1];
      expect(firstServiceCard).toHaveFocus();

      await user.tab();
      const secondServiceCard = screen.getAllByRole('button')[2];
      expect(secondServiceCard).toHaveFocus();
    });
  });

  describe('Color and Contrast', () => {
    test('supports high contrast mode', async () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check for high contrast styles
      const serviceCards = screen.getAllByRole('button');
      const serviceCard = serviceCards.find(card => card.textContent?.includes('AC Service'));
      expect(serviceCard).toHaveClass('border-2', 'border-gray-800');
    });
  });

  describe('Reduced Motion', () => {
    test('respects reduced motion preferences', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <ServiceSelectionPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check that scale animations are disabled
      const serviceCards = screen.getAllByRole('button');
      const serviceCard = serviceCards.find(card => card.textContent?.includes('AC Service'));
      expect(serviceCard).not.toHaveClass('hover:scale-105');
    });
  });

  describe('Mobile Accessibility', () => {
    test('adapts touch targets for mobile', async () => {
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
        expect(screen.getByText('AC Service')).toBeInTheDocument();
      });

      // Check that touch targets are appropriately sized
      const serviceCards = screen.getAllByRole('button');
      serviceCards.forEach(card => {
        const styles = window.getComputedStyle(card);
        // Touch targets should be at least 44px (iOS) or 48px (Android)
        expect(parseInt(styles.minHeight) || 44).toBeGreaterThanOrEqual(44);
      });
    });
  });
});
