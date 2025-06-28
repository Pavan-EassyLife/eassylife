/**
 * Location Debugging Utility
 * Helps identify and diagnose location accuracy issues
 */

export class LocationDebugger {
  constructor() {
    this.logs = [];
    this.isDebugging = import.meta.env.VITE_DEBUG === 'true';
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    
    this.logs.push(logEntry);
    
    if (this.isDebugging) {
      console.log(`🔍 LocationDebugger [${timestamp}]: ${message}`, data || '');
    }
  }

  /**
   * Test geolocation capabilities and accuracy
   */
  async testGeolocation() {
    this.log('Starting comprehensive geolocation test...');
    
    const results = {
      browserSupport: false,
      permissionState: 'unknown',
      positions: [],
      errors: [],
      recommendations: []
    };

    // Test 1: Browser Support
    if (!navigator.geolocation) {
      results.errors.push('Geolocation is not supported by this browser');
      results.recommendations.push('Use a modern browser that supports HTML5 Geolocation');
      return results;
    }
    
    results.browserSupport = true;
    this.log('✅ Browser supports geolocation');

    // Test 2: Permission State
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        results.permissionState = permission.state;
        this.log(`Permission state: ${permission.state}`);
      }
    } catch (error) {
      this.log('Could not check permission state', error);
    }

    // Test 3: Multiple location requests with different options
    const testConfigs = [
      {
        name: 'Quick Location',
        options: {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        }
      },
      {
        name: 'High Accuracy',
        options: {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000
        }
      },
      {
        name: 'Fresh Location',
        options: {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      }
    ];

    for (const config of testConfigs) {
      try {
        this.log(`Testing ${config.name}...`);
        const position = await this.getPositionWithTimeout(config.options);
        
        const positionData = {
          name: config.name,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date(position.timestamp).toISOString(),
          options: config.options
        };
        
        results.positions.push(positionData);
        this.log(`✅ ${config.name} successful`, positionData);
        
        // Analyze accuracy
        if (position.coords.accuracy > 1000) {
          results.recommendations.push(`${config.name}: Very low accuracy (${Math.round(position.coords.accuracy)}m). Check GPS settings.`);
        } else if (position.coords.accuracy > 100) {
          results.recommendations.push(`${config.name}: Low accuracy (${Math.round(position.coords.accuracy)}m). Consider enabling high accuracy mode.`);
        }
        
      } catch (error) {
        this.log(`❌ ${config.name} failed`, error);
        results.errors.push(`${config.name}: ${error.message}`);
      }
    }

    // Test 4: Analyze results
    this.analyzeResults(results);
    
    return results;
  }

  /**
   * Get position with promise wrapper
   */
  getPositionWithTimeout(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Analyze test results and provide recommendations
   */
  analyzeResults(results) {
    if (results.positions.length === 0) {
      results.recommendations.push('No successful location requests. Check browser permissions and GPS settings.');
      return;
    }

    // Check for consistency between positions
    if (results.positions.length > 1) {
      const firstPos = results.positions[0];
      const lastPos = results.positions[results.positions.length - 1];
      
      const distance = this.calculateDistance(
        firstPos.latitude, firstPos.longitude,
        lastPos.latitude, lastPos.longitude
      );
      
      if (distance > 1000) { // More than 1km difference
        results.recommendations.push(`Large distance between location readings (${Math.round(distance)}m). This may indicate GPS accuracy issues.`);
      }
    }

    // Check accuracy trends
    const accuracies = results.positions.map(p => p.accuracy);
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    
    if (avgAccuracy > 500) {
      results.recommendations.push('Average accuracy is poor. Ensure GPS is enabled and you are not indoors or in an area with poor signal.');
    }

    // Check for altitude data
    const hasAltitude = results.positions.some(p => p.altitude !== null);
    if (!hasAltitude) {
      results.recommendations.push('No altitude data available. This may indicate limited GPS capabilities.');
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Get device and browser information
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      geolocationSupported: !!navigator.geolocation,
      permissionsSupported: !!navigator.permissions,
      secureContext: window.isSecureContext,
      protocol: window.location.protocol,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export debug report
   */
  exportReport() {
    return {
      deviceInfo: this.getDeviceInfo(),
      logs: this.logs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear debug logs
   */
  clearLogs() {
    this.logs = [];
  }
}

// Create singleton instance
export const locationDebugger = new LocationDebugger();

/**
 * Quick debug function for testing location
 */
export const debugLocation = async () => {
  console.log('🔍 Starting location debugging...');
  
  const debugger = new LocationDebugger();
  const results = await debugger.testGeolocation();
  
  console.log('📊 Location Debug Results:', results);
  console.log('📱 Device Info:', debugger.getDeviceInfo());
  
  return results;
};
