import { useState, useCallback } from 'react';
import addressService from '../api/services/addressService';

/**
 * Simple location hook for getting user's current location
 * No complex permission handling - just basic geolocation
 */
export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        const errorMessage = 'Geolocation is not supported by this browser';
        setError(errorMessage);
        setLoading(false);
        reject(new Error(errorMessage));
        return;
      }

      // Get current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          console.log('📍 Location obtained:', locationData);
          setLocation(locationData);
          setLoading(false);
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Failed to get location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location';
              break;
          }

          console.error('❌ Location error:', errorMessage, error);
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds timeout
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Check if location permission has been granted
  const checkLocationPermission = useCallback(async () => {
    console.log('🔍 checkLocationPermission: Checking current permission state...');

    if (!navigator.geolocation) {
      console.log('❌ checkLocationPermission: Geolocation not supported');
      return false;
    }

    try {
      // Check if permissions API is available
      if (!navigator.permissions) {
        console.log('⚠️ checkLocationPermission: Permissions API not available, assuming prompt state');
        return false;
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' });
      const hasPermission = permission.state === 'granted';

      console.log('🔍 checkLocationPermission: Permission state:', permission.state);
      return hasPermission;
    } catch (error) {
      console.error('❌ checkLocationPermission: Error checking permission:', error);
      return false;
    }
  }, []);

  // Save address functionality (for compatibility)
  const saveAddress = useCallback(async (addressData) => {
    console.log('💾 useLocation: saveAddress called with:', addressData);

    try {
      // Call the actual address service
      const result = await addressService.saveAddress(addressData);
      console.log('💾 useLocation: Address service result:', result);

      return result;
    } catch (error) {
      console.error('💥 useLocation: Error saving address:', error);
      return { success: false, message: error.message || 'Failed to save address' };
    }
  }, []);

  return {
    // State
    loading,
    error,
    location,

    // Actions
    getCurrentLocation,
    clearError,
    clearLocation,
    checkLocationPermission,
    saveAddress,

    // Computed values
    hasLocation: !!location,
    coordinates: location ? { lat: location.latitude, lng: location.longitude } : null
  };
};
