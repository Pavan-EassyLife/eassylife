import { useEffect, useRef, useCallback } from 'react';

/**
 * usePerformanceMonitor Hook - Monitor and optimize performance
 * 
 * Features:
 * - Page load time tracking
 * - Component render time monitoring
 * - Memory usage tracking
 * - Network performance monitoring
 * - User interaction metrics
 */
const usePerformanceMonitor = (componentName = 'Unknown') => {
  const renderStartTime = useRef(performance.now());
  const renderCount = useRef(0);
  const interactionCount = useRef(0);

  // Track component render performance
  useEffect(() => {
    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    // Log slow renders (> 16ms for 60fps)
    if (renderDuration > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderDuration.toFixed(2)}ms`);
    }

    // Track render metrics
    if (window.gtag) {
      window.gtag('event', 'component_render', {
        component_name: componentName,
        render_duration: renderDuration,
        render_count: renderCount.current
      });
    }

    renderStartTime.current = performance.now();
  });

  // Monitor memory usage
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      const memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };

      // Warn if memory usage is high
      if (memoryUsage.used > 100) {
        console.warn(`High memory usage detected: ${memoryUsage.used}MB`);
      }

      return memoryUsage;
    }
    return null;
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((interactionType, details = {}) => {
    interactionCount.current += 1;
    
    if (window.gtag) {
      window.gtag('event', 'user_interaction', {
        component_name: componentName,
        interaction_type: interactionType,
        interaction_count: interactionCount.current,
        ...details
      });
    }
  }, [componentName]);

  // Measure Core Web Vitals
  const measureWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (window.gtag) {
            window.gtag('event', 'web_vital', {
              metric_name: 'LCP',
              metric_value: lastEntry.startTime,
              component_name: componentName
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (window.gtag) {
              window.gtag('event', 'web_vital', {
                metric_name: 'FID',
                metric_value: entry.processingStart - entry.startTime,
                component_name: componentName
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          if (window.gtag) {
            window.gtag('event', 'web_vital', {
              metric_name: 'CLS',
              metric_value: clsValue,
              component_name: componentName
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }, [componentName]);

  // Track network performance
  const trackNetworkPerformance = useCallback((url, startTime, endTime, success = true) => {
    const duration = endTime - startTime;
    
    if (window.gtag) {
      window.gtag('event', 'network_request', {
        url: url,
        duration: duration,
        success: success,
        component_name: componentName
      });
    }

    // Warn about slow network requests
    if (duration > 3000) {
      console.warn(`Slow network request detected: ${url} took ${duration}ms`);
    }
  }, [componentName]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions = [];
    const memory = checkMemoryUsage();

    if (renderCount.current > 10) {
      suggestions.push('Consider memoizing this component with React.memo()');
    }

    if (memory && memory.used > 50) {
      suggestions.push('High memory usage detected - check for memory leaks');
    }

    if (interactionCount.current > 100) {
      suggestions.push('High interaction count - consider debouncing user inputs');
    }

    return suggestions;
  }, [checkMemoryUsage]);

  // Initialize performance monitoring
  useEffect(() => {
    const cleanup = measureWebVitals();
    
    // Check memory usage periodically
    const memoryInterval = setInterval(checkMemoryUsage, 30000); // Every 30 seconds

    return () => {
      if (cleanup) cleanup();
      clearInterval(memoryInterval);
    };
  }, [measureWebVitals, checkMemoryUsage]);

  return {
    trackInteraction,
    checkMemoryUsage,
    trackNetworkPerformance,
    getOptimizationSuggestions,
    renderCount: renderCount.current,
    interactionCount: interactionCount.current
  };
};

export default usePerformanceMonitor;
