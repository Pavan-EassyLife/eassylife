import { useEffect, useRef, useCallback } from 'react';

/**
 * useMobilePerformance - Hook for monitoring and optimizing mobile performance
 * Features:
 * - Monitors component render times
 * - Tracks memory usage
 * - Provides performance metrics
 * - Optimizes for mobile devices
 */

export const useMobilePerformance = (componentName = 'Component') => {
  const renderStartTime = useRef(null);
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End performance measurement
  const endMeasurement = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      lastRenderTime.current = renderTime;
      renderCount.current += 1;

      // Log performance in development
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        console.log(`📱 ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
        
        // Warn about slow renders (>16ms for 60fps)
        if (renderTime > 16) {
          console.warn(`⚠️ ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
        }
      }
    }
  }, [componentName]);

  // Monitor component lifecycle (only in development)
  useEffect(() => {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      startMeasurement();
      return () => {
        endMeasurement();
      };
    }
  });

  // Get performance metrics
  const getMetrics = useCallback(() => {
    return {
      renderCount: renderCount.current,
      lastRenderTime: lastRenderTime.current,
      averageRenderTime: lastRenderTime.current,
      isSlowRender: lastRenderTime.current > 16
    };
  }, []);

  // Check if device is low-end mobile
  const isLowEndDevice = useCallback(() => {
    // Check for indicators of low-end devices
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = navigator.deviceMemory || 1;

    return hardwareConcurrency <= 2 || deviceMemory <= 2;
  }, []);

  // Optimize for mobile performance
  const optimizeForMobile = useCallback(() => {
    const isLowEnd = isLowEndDevice();

    return {
      shouldReduceAnimations: isLowEnd,
      shouldLazyLoad: true,
      shouldDebounceEvents: isLowEnd,
      maxConcurrentRequests: isLowEnd ? 2 : 4,
      animationDuration: isLowEnd ? 150 : 300
    };
  }, [isLowEndDevice]);

  return {
    startMeasurement,
    endMeasurement,
    getMetrics,
    isLowEndDevice,
    optimizeForMobile
  };
};

/**
 * useRenderOptimization - Hook for optimizing component re-renders
 */
export const useRenderOptimization = (dependencies = []) => {
  const previousDeps = useRef(dependencies);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    // Only check for unnecessary re-renders in development
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      // Check if dependencies actually changed
      const depsChanged = dependencies.some((dep, index) =>
        dep !== previousDeps.current[index]
      );

      if (!depsChanged && renderCount.current > 1) {
        console.warn('🔄 Unnecessary re-render detected - dependencies unchanged');
      }
    }

    previousDeps.current = dependencies;
  }, dependencies);

  return {
    renderCount: renderCount.current
  };
};

/**
 * useMemoryMonitor - Hook for monitoring memory usage
 */
export const useMemoryMonitor = () => {
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
      };
    }
    return null;
  }, []);

  const logMemoryUsage = useCallback((label = 'Memory Usage') => {
    // Only log memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const memory = checkMemoryUsage();
      if (memory) {
        console.log(`💾 ${label}:`, memory);

        // Warn about high memory usage
        if (memory.usage > 80) {
          console.warn(`⚠️ High memory usage: ${memory.usage}%`);
        }
      }
    }
  }, [checkMemoryUsage]);

  return {
    checkMemoryUsage,
    logMemoryUsage
  };
};

/**
 * useScrollPerformance - Hook for optimizing scroll performance
 */
export const useScrollPerformance = () => {
  const throttleScroll = useCallback((callback, delay = 16) => {
    let timeoutId;
    let lastExecTime = 0;
    
    return (...args) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        callback.apply(null, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          callback.apply(null, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  const debounceScroll = useCallback((callback, delay = 100) => {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(null, args), delay);
    };
  }, []);

  return {
    throttleScroll,
    debounceScroll
  };
};

export default useMobilePerformance;
