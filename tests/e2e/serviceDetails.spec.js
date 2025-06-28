import { test, expect } from '@playwright/test';

test.describe('Service Selection and Details E2E Tests', () => {
  test.describe('Service Selection Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to service selection page
      await page.goto('/service-selection/test-category-id');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
    });

    test('loads service selection page successfully', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/Select Service/);

      // Check main heading
      await expect(page.locator('h1')).toContainText('Select Service');

      // Check video player
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible();

      // Check service grid
      await expect(page.locator('.grid')).toBeVisible();
    });

    test('displays services in grid layout', async ({ page }) => {
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-card"]');

      // Check that services are displayed
      const serviceCards = page.locator('[data-testid="service-card"]');
      await expect(serviceCards).toHaveCount.greaterThan(0);

      // Check grid layout (4 columns on mobile)
      await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('navigates to service details on service selection', async ({ page }) => {
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-card"]');

      // Click on first service
      const firstService = page.locator('[data-testid="service-card"]').first();
      await firstService.click();

      // Should navigate to service details page
      await expect(page.url()).toContain('/service-details/');

      // Check that service details page loads
      await expect(page.locator('[data-testid="service-info"]')).toBeVisible();
    });

    test('handles back navigation from service selection', async ({ page }) => {
      // Click back button
      await page.click('[aria-label*="back"]');

      // Should navigate back to previous page
      await expect(page.url()).not.toContain('/service-selection/');
    });

    test('adapts to different viewport sizes', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('.grid-cols-4')).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('.grid-cols-2')).toBeVisible();
    });
  });

  test.describe('Service Details Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to service details page
      await page.goto('/service-details/test-service-id');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
    });

  test.describe('Page Loading and Navigation', () => {
    test('loads service details page successfully', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/Service Details/);
      
      // Check main heading
      await expect(page.locator('h1')).toBeVisible();
      
      // Check video player
      await expect(page.locator('video')).toBeVisible();
    });

    test('handles back navigation correctly', async ({ page }) => {
      // Navigate back
      await page.goBack();
      
      // Should return to previous page
      await expect(page.url()).not.toContain('/service/');
    });

    test('maintains state on page refresh', async ({ page }) => {
      // Select an attribute
      await page.click('[data-testid="attribute-option"]');
      
      // Refresh page
      await page.reload();
      
      // Check if selection is maintained (if implemented)
      await expect(page.locator('[data-testid="attribute-option"][aria-selected="true"]')).toBeVisible();
    });
  });

  test.describe('Video Player Functionality', () => {
    test('plays and pauses video', async ({ page }) => {
      const video = page.locator('video');
      const playButton = page.locator('[aria-label*="play"]');
      
      // Click play button
      await playButton.click();
      
      // Check if video is playing
      const isPlaying = await video.evaluate(el => !el.paused);
      expect(isPlaying).toBe(true);
      
      // Click pause button
      await page.locator('[aria-label*="pause"]').click();
      
      // Check if video is paused
      const isPaused = await video.evaluate(el => el.paused);
      expect(isPaused).toBe(true);
    });

    test('toggles mute/unmute', async ({ page }) => {
      const video = page.locator('video');
      const muteButton = page.locator('[aria-label*="mute"]');
      
      // Initial state should be muted
      const initialMuted = await video.evaluate(el => el.muted);
      expect(initialMuted).toBe(true);
      
      // Click unmute
      await muteButton.click();
      
      // Check if unmuted
      const isUnmuted = await video.evaluate(el => !el.muted);
      expect(isUnmuted).toBe(true);
    });

    test('seeks video using progress bar', async ({ page }) => {
      const video = page.locator('video');
      const progressBar = page.locator('[role="progressbar"]');
      
      // Wait for video to load
      await video.waitFor({ state: 'visible' });
      
      // Click on progress bar (middle)
      await progressBar.click({ position: { x: 100, y: 5 } });
      
      // Check if video time changed
      const currentTime = await video.evaluate(el => el.currentTime);
      expect(currentTime).toBeGreaterThan(0);
    });

    test('handles fullscreen mode', async ({ page }) => {
      const fullscreenButton = page.locator('[aria-label*="fullscreen"]');
      
      // Click fullscreen button
      await fullscreenButton.click();
      
      // Check if fullscreen API was called (mock or check DOM changes)
      await expect(page.locator('[aria-label*="exit fullscreen"]')).toBeVisible();
    });
  });

  test.describe('Service Selection and Attributes', () => {
    test('selects service attributes', async ({ page }) => {
      // Wait for attributes to load
      await page.waitForSelector('[data-testid="attribute-section"]');
      
      // Select first attribute option
      const firstOption = page.locator('[data-testid="attribute-option"]').first();
      await firstOption.click();
      
      // Check if option is selected
      await expect(firstOption).toHaveClass(/bg-orange-500/);
      
      // Check if segments update
      await page.waitForSelector('[data-testid="service-segments"]');
      await expect(page.locator('[data-testid="segment-card"]')).toBeVisible();
    });

    test('selects service segment', async ({ page }) => {
      // Wait for segments to load
      await page.waitForSelector('[data-testid="service-segments"]');
      
      // Select a segment
      const segment = page.locator('[data-testid="segment-card"]').first();
      await segment.click();
      
      // Check if segment is selected
      await expect(segment).toHaveClass(/border-orange-500/);
      
      // Check if booking panel updates
      await expect(page.locator('[data-testid="selected-segment-info"]')).toBeVisible();
    });

    test('shows include/exclude items', async ({ page }) => {
      // Check for include items
      await expect(page.locator('[data-testid="include-items"]')).toBeVisible();
      
      // Check for exclude items
      await expect(page.locator('[data-testid="exclude-items"]')).toBeVisible();
      
      // Verify items are displayed
      await expect(page.locator('[data-testid="include-item"]')).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Booking Flow', () => {
    test('opens date picker modal', async ({ page }) => {
      // Click date selection button
      await page.click('[data-testid="select-date-button"]');
      
      // Check if modal opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Select Date')).toBeVisible();
      
      // Check calendar is displayed
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
    });

    test('selects date from calendar', async ({ page }) => {
      // Open date picker
      await page.click('[data-testid="select-date-button"]');
      
      // Select a date (15th of current month)
      await page.click('text=15');
      
      // Confirm selection
      await page.click('text=Confirm');
      
      // Check if modal closes and date is selected
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="selected-date"]')).toContainText('15');
    });

    test('opens time picker modal', async ({ page }) => {
      // Click time selection button
      await page.click('[data-testid="select-time-button"]');
      
      // Check if modal opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Select Time')).toBeVisible();
      
      // Check time slots are displayed
      await expect(page.locator('[data-testid="time-slot"]')).toHaveCount.greaterThan(0);
    });

    test('selects time slot', async ({ page }) => {
      // Open time picker
      await page.click('[data-testid="select-time-button"]');
      
      // Select a time slot
      const timeSlot = page.locator('[data-testid="time-slot"]').first();
      await timeSlot.click();
      
      // Confirm selection
      await page.click('text=Confirm');
      
      // Check if modal closes and time is selected
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="selected-time"]')).toBeVisible();
    });

    test('validates booking completion', async ({ page }) => {
      // Try to continue without completing booking
      await page.click('[data-testid="continue-button"]');
      
      // Check for validation errors
      await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
      await expect(page.locator('text=Please select a service package')).toBeVisible();
      await expect(page.locator('text=Please select a date')).toBeVisible();
    });

    test('completes full booking flow', async ({ page }) => {
      // Select attribute
      await page.click('[data-testid="attribute-option"]');
      
      // Select segment
      await page.click('[data-testid="segment-card"]');
      
      // Select date
      await page.click('[data-testid="select-date-button"]');
      await page.click('text=15');
      await page.click('text=Confirm');
      
      // Select time
      await page.click('[data-testid="select-time-button"]');
      await page.click('[data-testid="time-slot"]');
      await page.click('text=Confirm');
      
      // Continue to next step
      await page.click('[data-testid="continue-button"]');
      
      // Should navigate to provider selection
      await expect(page.url()).toContain('/provider-selection');
    });
  });

  test.describe('Responsive Design', () => {
    test('adapts to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile-specific elements
      await expect(page.locator('[data-testid="mobile-video-player"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-booking-panel"]')).toBeVisible();
      
      // Check that desktop elements are hidden
      await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
    });

    test('adapts to desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 });
      
      // Check desktop-specific elements
      await expect(page.locator('[data-testid="desktop-service-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
      
      // Check side-by-side layout
      const mainContent = page.locator('[data-testid="main-content"]');
      const sidebar = page.locator('[data-testid="sidebar"]');
      
      const mainBox = await mainContent.boundingBox();
      const sidebarBox = await sidebar.boundingBox();
      
      // Main content should be on the left, sidebar on the right
      expect(mainBox.x).toBeLessThan(sidebarBox.x);
    });
  });

  test.describe('Accessibility', () => {
    test('supports keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[aria-label*="play"]:focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[aria-label*="mute"]:focus')).toBeVisible();
      
      // Test Enter key activation
      await page.keyboard.press('Enter');
      
      // Should trigger the focused element
      const video = page.locator('video');
      const isMuted = await video.evaluate(el => el.muted);
      expect(isMuted).toBe(false);
    });

    test('has proper ARIA labels and roles', async ({ page }) => {
      // Check for proper roles
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="button"]')).toHaveCount.greaterThan(0);
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
      
      // Check for ARIA labels
      await expect(page.locator('[aria-label*="play"]')).toBeVisible();
      await expect(page.locator('[aria-label*="mute"]')).toBeVisible();
    });

    test('announces changes to screen readers', async ({ page }) => {
      // Check for live regions
      await expect(page.locator('[aria-live="polite"]')).toBeVisible();
      
      // Trigger a state change
      await page.click('[data-testid="attribute-option"]');
      
      // Check if announcement is made (mock screen reader)
      await expect(page.locator('[aria-live="polite"]')).toContainText(/selected/i);
    });
  });

  test.describe('Performance', () => {
    test('loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/service-details/test-service-id');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('lazy loads components', async ({ page }) => {
      // Check for loading indicators
      await expect(page.locator('[data-testid="component-loader"]')).toBeVisible();

      // Wait for components to load
      await page.waitForSelector('[data-testid="service-info"]');

      // Loading indicators should be gone
      await expect(page.locator('[data-testid="component-loader"]')).not.toBeVisible();
    });
  });

  test.describe('Complete User Flow Integration', () => {
    test('completes full service selection to booking flow', async ({ page }) => {
      // Start from home page
      await page.goto('/');

      // Navigate to service selection (simulate category click)
      await page.goto('/service-selection/test-category-id');

      // Wait for service selection page to load
      await page.waitForSelector('[data-testid="service-card"]');

      // Select a service
      const firstService = page.locator('[data-testid="service-card"]').first();
      await firstService.click();

      // Should be on service details page
      await expect(page.url()).toContain('/service-details/');
      await page.waitForSelector('[data-testid="service-info"]');

      // Complete booking flow
      await page.click('[data-testid="attribute-option"]');
      await page.click('[data-testid="segment-card"]');

      // Select date
      await page.click('[data-testid="select-date-button"]');
      await page.click('text=15');
      await page.click('text=Confirm');

      // Select time
      await page.click('[data-testid="select-time-button"]');
      await page.click('[data-testid="time-slot"]');
      await page.click('text=Confirm');

      // Continue to next step
      await page.click('[data-testid="continue-button"]');

      // Should navigate to provider selection
      await expect(page.url()).toContain('/provider-selection');
    });

    test('handles error states gracefully throughout flow', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());

      // Navigate to service selection
      await page.goto('/service-selection/test-category-id');

      // Should show error state
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Try Again')).toBeVisible();

      // Restore network and retry
      await page.unroute('**/api/**');
      await page.click('text=Try Again');

      // Should load successfully
      await page.waitForSelector('[data-testid="service-card"]');
    });

    test('maintains performance across the entire flow', async ({ page }) => {
      const startTime = Date.now();

      // Complete full flow
      await page.goto('/service-selection/test-category-id');
      await page.waitForSelector('[data-testid="service-card"]');

      await page.click('[data-testid="service-card"]');
      await page.waitForSelector('[data-testid="service-info"]');

      await page.click('[data-testid="attribute-option"]');
      await page.click('[data-testid="segment-card"]');

      const totalTime = Date.now() - startTime;

      // Entire flow should complete within 10 seconds
      expect(totalTime).toBeLessThan(10000);
    });
  });
});
