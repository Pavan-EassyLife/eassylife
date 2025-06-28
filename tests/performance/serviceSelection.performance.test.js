import { test, expect } from '@playwright/test';

test.describe('Service Selection Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('service selection page loads within performance budget', async ({ page }) => {
      // Start performance monitoring
      const startTime = Date.now();
      
      // Navigate to service selection page
      await page.goto('/service-selection/test-category-id');
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 2 seconds for initial load
      expect(loadTime).toBeLessThan(2000);
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            if (lcpEntry) {
              resolve({
                lcp: lcpEntry.startTime,
                fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
              });
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });
      
      // LCP should be under 2.5 seconds
      expect(metrics.lcp).toBeLessThan(2500);
      
      // FCP should be under 1.8 seconds
      expect(metrics.fcp).toBeLessThan(1800);
    });

    test('video player lazy loads efficiently', async ({ page }) => {
      await page.goto('/service-selection/test-category-id');
      
      // Check that video player shows loading state initially
      await expect(page.locator('[data-testid="video-loading"]')).toBeVisible();
      
      // Wait for video player to load
      await page.waitForSelector('[data-testid="video-player"]');
      
      // Loading state should be gone
      await expect(page.locator('[data-testid="video-loading"]')).not.toBeVisible();
      
      // Video should be ready
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
    });

    test('service grid renders efficiently with many items', async ({ page }) => {
      // Mock API to return many services
      await page.route('**/api/sub-category/category/**', async route => {
        const services = Array.from({ length: 50 }, (_, i) => ({
          id: `service-${i}`,
          name: `Service ${i}`,
          image: `https://example.com/service-${i}.jpg`,
          weight: Math.floor(Math.random() * 100).toString()
        }));
        
        await route.fulfill({
          json: {
            success: true,
            data: {
              subcategories: services,
              name: 'Test Category'
            }
          }
        });
      });
      
      const startTime = Date.now();
      
      await page.goto('/service-selection/test-category-id');
      await page.waitForSelector('[data-testid="service-card"]');
      
      const renderTime = Date.now() - startTime;
      
      // Should render 50 services within 3 seconds
      expect(renderTime).toBeLessThan(3000);
      
      // Check that all services are rendered
      const serviceCards = page.locator('[data-testid="service-card"]');
      await expect(serviceCards).toHaveCount(50);
    });
  });

  test.describe('Image Loading Performance', () => {
    test('optimized images load progressively', async ({ page }) => {
      await page.goto('/service-selection/test-category-id');
      
      // Wait for service cards to appear
      await page.waitForSelector('[data-testid="service-card"]');
      
      // Check that images use lazy loading
      const images = page.locator('img[loading="lazy"]');
      await expect(images).toHaveCount.greaterThan(0);
      
      // Check that placeholder images are shown initially
      const placeholders = page.locator('[data-testid="image-placeholder"]');
      await expect(placeholders).toHaveCount.greaterThan(0);
    });

    test('images load only when in viewport', async ({ page }) => {
      await page.goto('/service-selection/test-category-id');
      
      // Scroll to bottom to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Wait for images to load
      await page.waitForTimeout(1000);
      
      // Check that images have loaded
      const loadedImages = page.locator('img[src*="example.com"]');
      await expect(loadedImages).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Memory Performance', () => {
    test('does not leak memory during navigation', async ({ page }) => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate between pages multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/service-selection/test-category-id');
        await page.waitForSelector('[data-testid="service-card"]');
        
        await page.click('[data-testid="service-card"]');
        await page.waitForSelector('[data-testid="service-info"]');
        
        await page.goBack();
        await page.waitForSelector('[data-testid="service-card"]');
      }
      
      // Force garbage collection
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Memory should not increase significantly (allow 50% increase)
      if (initialMemory > 0) {
        expect(finalMemory).toBeLessThan(initialMemory * 1.5);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('minimizes API calls during normal usage', async ({ page }) => {
      let apiCallCount = 0;
      
      // Monitor API calls
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiCallCount++;
        }
      });
      
      await page.goto('/service-selection/test-category-id');
      await page.waitForSelector('[data-testid="service-card"]');
      
      // Should make minimal API calls (1 for sub-services)
      expect(apiCallCount).toBeLessThanOrEqual(2);
    });

    test('handles slow network gracefully', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      const startTime = Date.now();
      
      await page.goto('/service-selection/test-category-id');
      
      // Should show loading state immediately
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // Wait for content to load
      await page.waitForSelector('[data-testid="service-card"]', { timeout: 10000 });
      
      const totalTime = Date.now() - startTime;
      
      // Should handle slow network within reasonable time
      expect(totalTime).toBeLessThan(5000);
    });
  });

  test.describe('Interaction Performance', () => {
    test('service selection responds quickly', async ({ page }) => {
      await page.goto('/service-selection/test-category-id');
      await page.waitForSelector('[data-testid="service-card"]');
      
      const startTime = Date.now();
      
      // Click on service
      await page.click('[data-testid="service-card"]');
      
      // Wait for navigation
      await page.waitForURL('**/service-details/**');
      
      const responseTime = Date.now() - startTime;
      
      // Navigation should be fast (under 500ms)
      expect(responseTime).toBeLessThan(500);
    });

    test('scroll performance is smooth', async ({ page }) => {
      await page.goto('/service-selection/test-category-id');
      await page.waitForSelector('[data-testid="service-card"]');
      
      // Measure scroll performance
      const scrollMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();
          
          function measureFrame() {
            frameCount++;
            if (frameCount < 60) { // Measure for 60 frames
              requestAnimationFrame(measureFrame);
            } else {
              const endTime = performance.now();
              const fps = 60 / ((endTime - startTime) / 1000);
              resolve({ fps, duration: endTime - startTime });
            }
          }
          
          // Start scrolling
          window.scrollBy(0, 10);
          requestAnimationFrame(measureFrame);
        });
      });
      
      // Should maintain at least 30 FPS during scroll
      expect(scrollMetrics.fps).toBeGreaterThan(30);
    });
  });

  test.describe('Bundle Size Performance', () => {
    test('initial bundle size is within budget', async ({ page }) => {
      // Monitor network requests
      const resources = [];
      
      page.on('response', response => {
        if (response.url().includes('.js') || response.url().includes('.css')) {
          resources.push({
            url: response.url(),
            size: response.headers()['content-length']
          });
        }
      });
      
      await page.goto('/service-selection/test-category-id');
      await page.waitForLoadState('networkidle');
      
      // Calculate total bundle size
      const totalSize = resources.reduce((sum, resource) => {
        return sum + (parseInt(resource.size) || 0);
      }, 0);
      
      // Bundle should be under 1MB
      expect(totalSize).toBeLessThan(1024 * 1024);
    });

    test('code splitting works effectively', async ({ page }) => {
      const loadedChunks = new Set();
      
      page.on('response', response => {
        if (response.url().includes('.js')) {
          const filename = response.url().split('/').pop();
          loadedChunks.add(filename);
        }
      });
      
      // Load service selection page
      await page.goto('/service-selection/test-category-id');
      await page.waitForSelector('[data-testid="service-card"]');
      
      const selectionChunks = new Set(loadedChunks);
      
      // Navigate to service details
      await page.click('[data-testid="service-card"]');
      await page.waitForSelector('[data-testid="service-info"]');
      
      const detailsChunks = new Set(loadedChunks);
      
      // Should load additional chunks for service details
      expect(detailsChunks.size).toBeGreaterThan(selectionChunks.size);
    });
  });
});
