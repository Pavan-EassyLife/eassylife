// Jest setup file for testing configuration
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: jest.fn(),
});

// Mock HTMLMediaElement properties
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: false,
});

Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
});

Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
  writable: true,
  value: 100,
});

Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
  writable: true,
  value: true,
});

Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
  writable: true,
  value: 1,
});

// Mock Fullscreen API
Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 200,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 200,
  x: 0,
  y: 0,
  toJSON: jest.fn()
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
    readText: jest.fn().mockImplementation(() => Promise.resolve(''))
  },
  writable: true,
});

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn().mockImplementation((success) => 
      success({
        coords: {
          latitude: 51.1,
          longitude: 45.3
        }
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  },
  writable: true,
});

// Mock Web Share API
Object.defineProperty(navigator, 'share', {
  value: jest.fn().mockImplementation(() => Promise.resolve()),
  writable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 200000000
    },
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => [])
  },
  writable: true,
});

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
global.testUtils = {
  // Mock service data
  mockServiceDetails: {
    id: '1',
    name: 'Test Service',
    service_time: '60 minutes',
    meta_description: 'Test service description',
    image: 'https://example.com/image.jpg',
    serviceVideos: {
      video_url: 'https://example.com/video.mp4'
    },
    attributes: {},
    includeItems: [],
    excludeItems: []
  },

  // Mock user data
  mockUser: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    addresses: [
      {
        id: '1',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345'
      }
    ]
  },

  // Test helpers
  createMockEvent: (type, properties = {}) => ({
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    ...properties
  }),

  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
};

// Suppress specific warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('React Router Future Flag Warning') ||
     args[0].includes('deprecated'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
