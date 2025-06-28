import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import geocodingService from '../../api/services/geocodingService';
import { useToast } from '../ui/toast';

/**
 * Interactive Google Maps component for address selection
 * Implements Flutter app's map functionality with center marker and camera controls
 */
const GoogleMapPicker = forwardRef(({
  initialLocation = { lat: 19.0760, lng: 72.8777 }, // Default to Mumbai
  onLocationChange,
  onAddressChange, // Legacy prop name
  onAddressSelect, // New prop name (Flutter-aligned)
  height = '400px',
  zoom = 15,
  className = '',
  showCurrentLocationButton = true,
  showAddressDisplay = true,
  onCurrentLocationClick
}, ref) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const googleRef = useRef(null); // Store google object reference
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(() => {
    // Inline normalization for initial state
    if (!initialLocation) return { lat: 19.0760, lng: 72.8777 };

    const lat = initialLocation.lat || initialLocation.latitude;
    const lng = initialLocation.lng || initialLocation.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return { lat: 19.0760, lng: 72.8777 }; // Default to Mumbai if invalid
    }

    return { lat, lng };
  });
  const [currentAddress, setCurrentAddress] = useState('');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const { showError } = useToast();

  // Debug logging for initial state
  useEffect(() => {
    console.log('🗺️ GoogleMapPicker: Initial location set to:', initialLocation);
    console.log('🗺️ GoogleMapPicker: Current location state:', currentLocation);
  }, []);

  // Google Maps API configuration
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const useGoogleMaps = !!apiKey && apiKey !== 'your_google_maps_api_key_here';

  // Debug logging
  console.log('🗺️ GoogleMapPicker: API Key status:', {
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    useGoogleMaps,
    isPlaceholder: apiKey === 'your_google_maps_api_key_here'
  });

  /**
   * Helper function to ensure location object has proper lat/lng format
   */
  const normalizeLocation = (location) => {
    if (!location) return null;

    const lat = location.lat || location.latitude;
    const lng = location.lng || location.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.error('❌ Invalid location coordinates:', location);
      return null;
    }

    return { lat, lng };
  };

  /**
   * Initialize Google Maps
   */
  const initializeMap = useCallback(async () => {
    if (!useGoogleMaps) {
      setIsLoading(false);
      showError('Google Maps API key not configured');
      return;
    }

    try {
      console.log('🔄 GoogleMapPicker: Initializing Google Maps with API key:', apiKey ? 'Present' : 'Missing');

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
        // Add additional configuration for better reliability
        region: 'IN', // Set region to India for better performance
        language: 'en',
      });

      console.log('🔄 GoogleMapPicker: Loading Google Maps API...');
      const google = await loader.load();
      console.log('✅ GoogleMapPicker: Google Maps API loaded successfully');

      googleRef.current = google; // Store google reference

      if (!mapRef.current) return;

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add center marker
      const marker = new google.maps.Marker({
        position: currentLocation,
        map,
        draggable: true,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#FFA301" stroke="white" stroke-width="4"/>
              <circle cx="20" cy="20" r="8" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });

      markerRef.current = marker;

      // Handle map center changes (similar to Flutter's onCameraIdle)
      let geocodingTimeout;
      const handleCenterChanged = () => {
        const center = map.getCenter();
        const newLocation = {
          lat: center.lat(),
          lng: center.lng()
        };

        setCurrentLocation(newLocation);
        marker.setPosition(newLocation);

        // Debounce geocoding calls
        clearTimeout(geocodingTimeout);
        geocodingTimeout = setTimeout(() => {
          handleLocationChange(newLocation);
        }, 500);
      };

      // Handle marker drag
      const handleMarkerDrag = () => {
        const position = marker.getPosition();
        const newLocation = {
          lat: position.lat(),
          lng: position.lng()
        };

        setCurrentLocation(newLocation);
        map.setCenter(newLocation);

        clearTimeout(geocodingTimeout);
        geocodingTimeout = setTimeout(() => {
          handleLocationChange(newLocation);
        }, 500);
      };

      // Add event listeners
      map.addListener('center_changed', handleCenterChanged);
      marker.addListener('dragend', handleMarkerDrag);

      // Initial address lookup
      await handleLocationChange(currentLocation);

      setIsLoading(false);
    } catch (error) {
      console.error('❌ GoogleMapPicker: Failed to initialize Google Maps:', error);
      setIsLoading(false);

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to load map. Please try again.';

      if (error.message && error.message.includes('network')) {
        errorMessage = 'Network error loading Google Maps. Please check your internet connection.';
      } else if (error.message && error.message.includes('API key')) {
        errorMessage = 'Google Maps API key error. Please contact support.';
      } else if (error.message && error.message.includes('quota')) {
        errorMessage = 'Google Maps quota exceeded. Please try again later.';
      }

      showError(errorMessage);
    }
  }, [apiKey, currentLocation, zoom, useGoogleMaps, showError]);

  /**
   * Handle location changes and reverse geocoding (Flutter-aligned: prevent infinite loops)
   */
  const handleLocationChange = useCallback(async (location) => {
    // Validate location parameter
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.error('❌ GoogleMapPicker: Invalid location provided to handleLocationChange:', location);
      return;
    }

    // Prevent unnecessary calls if location hasn't actually changed
    if (currentLocation?.lat === location?.lat && currentLocation?.lng === location?.lng) {
      return;
    }

    console.log('🗺️ GoogleMapPicker: Location changed to:', location);
    console.log('🗺️ GoogleMapPicker: Current location before change:', currentLocation);
    setIsGeocodingLoading(true);

    try {
      console.log('🔄 GoogleMapPicker: Starting geocoding for:', location.lat, location.lng);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Geocoding timeout after 10 seconds')), 10000)
      );

      const geocodingPromise = geocodingService.getAddressFromCoordinates(
        location.lat,
        location.lng
      );

      const addressData = await Promise.race([geocodingPromise, timeoutPromise]);
      console.log('✅ GoogleMapPicker: Geocoding result:', addressData);

      if (addressData.success) {
        console.log('🗺️ GoogleMapPicker: Reverse geocoding successful:', addressData);
        console.log('🗺️ Address components available:', {
          formattedAddress: addressData.formattedAddress,
          streetAddress: addressData.streetAddress,
          city: addressData.city,
          state: addressData.state,
          postalCode: addressData.postalCode
        });

        setCurrentAddress(addressData.formattedAddress);

        // Update current location state
        setCurrentLocation(location);

        // Notify parent components ONLY when location actually changes
        if (onLocationChange) {
          onLocationChange(location);
        }
        // Support both prop names for backward compatibility
        if (onAddressSelect) {
          console.log('🗺️ GoogleMapPicker: Calling onAddressSelect with:', addressData);
          onAddressSelect(addressData);
        } else if (onAddressChange) {
          console.log('🗺️ GoogleMapPicker: Calling onAddressChange with:', addressData);
          onAddressChange(addressData);
        }
      } else {
        console.log('❌ GoogleMapPicker: Reverse geocoding failed:', addressData);
        setCurrentAddress('Address not available');
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('❌ GoogleMapPicker: Reverse geocoding failed:', error);
      console.error('❌ GoogleMapPicker: Error details:', error.message);

      // Provide a more user-friendly fallback address
      const lat = location?.lat ?? 0;
      const lng = location?.lng ?? 0;

      console.log('⚠️ GoogleMapPicker: Using fallback for coordinates:', lat, lng);

      if (lat === 0 && lng === 0) {
        setCurrentAddress('Location not available');
      } else {
        // Try to provide a basic location description
        setCurrentAddress(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }

      // Still update the location state even if geocoding fails
      setCurrentLocation(location);
    } finally {
      console.log('🔄 GoogleMapPicker: Geocoding completed, setting loading to false');
      setIsGeocodingLoading(false);
    }
  }, [currentLocation?.lat, currentLocation?.lng, onLocationChange, onAddressSelect, onAddressChange]);

  /**
   * Move map to specific location (Flutter-aligned: prevent infinite loops)
   */
  const moveToLocation = useCallback((location) => {
    // Validate location parameter
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.error('❌ GoogleMapPicker: Invalid location provided to moveToLocation:', location);
      return;
    }

    if (mapInstanceRef.current && markerRef.current && googleRef.current) {
      const normalizedLocation = normalizeLocation(location);
      if (!normalizedLocation) {
        console.error('❌ Cannot move to invalid location:', location);
        return;
      }

      // Only move if location is actually different
      if (currentLocation?.lat === normalizedLocation.lat && currentLocation?.lng === normalizedLocation.lng) {
        return;
      }

      console.log('🎯 GoogleMapPicker: Moving to location:', normalizedLocation);
      const newPosition = new googleRef.current.maps.LatLng(normalizedLocation.lat, normalizedLocation.lng);

      mapInstanceRef.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);

      setCurrentLocation(normalizedLocation);
      handleLocationChange(normalizedLocation);
    }
  }, [currentLocation?.lat, currentLocation?.lng, handleLocationChange, normalizeLocation]);

  /**
   * Get current user location
   */
  const getCurrentUserLocation = () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by this browser');
      return;
    }

    setIsGeocodingLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        moveToLocation(location);
        setIsGeocodingLoading(false);
      },
      (error) => {
        setIsGeocodingLoading(false);

        let errorMessage = 'Unable to get your current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your location settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An error occurred while getting your location. Please try again.';
        }
        showError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000 // 1 minute cache
      }
    );
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCurrentUserLocation,
    panTo: (location) => {
      if (mapInstanceRef.current && googleRef.current) {
        const normalizedLocation = normalizeLocation(location);
        if (!normalizedLocation) return;

        const newPosition = new googleRef.current.maps.LatLng(normalizedLocation.lat, normalizedLocation.lng);
        mapInstanceRef.current.panTo(newPosition);
        if (markerRef.current) {
          markerRef.current.setPosition(newPosition);
        }
        setCurrentLocation(normalizedLocation);
      }
    },
    setCenter: (location) => {
      if (mapInstanceRef.current && googleRef.current) {
        const normalizedLocation = normalizeLocation(location);
        if (!normalizedLocation) return;

        const newPosition = new googleRef.current.maps.LatLng(normalizedLocation.lat, normalizedLocation.lng);
        mapInstanceRef.current.setCenter(newPosition);
        if (markerRef.current) {
          markerRef.current.setPosition(newPosition);
        }
        setCurrentLocation(normalizedLocation);
      }
    },
    moveToLocation: (location) => moveToLocation(location),
    getMapInstance: () => mapInstanceRef.current,
    isMapReady: () => !!mapInstanceRef.current && !isLoading && !!googleRef.current
  }), [moveToLocation, isLoading, normalizeLocation]);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update map when initial location changes (Flutter-aligned: prevent infinite loops)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const normalizedInitialLocation = normalizeLocation(initialLocation);
      if (!normalizedInitialLocation) return;

      // Only update if the initial location is actually different from current location
      if (normalizedInitialLocation.lat !== currentLocation?.lat || normalizedInitialLocation.lng !== currentLocation?.lng) {
        console.log('🔄 GoogleMapPicker: Initial location changed, updating map');
        moveToLocation(normalizedInitialLocation);
      }
    }
  }, [initialLocation?.lat, initialLocation?.lng, currentLocation?.lat, currentLocation?.lng, moveToLocation, normalizeLocation]);

  if (!useGoogleMaps) {
    return (
      <div className={`relative bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Google Maps not available</p>
          <p className="text-sm text-gray-500 mb-4">
            {!apiKey ? 'Google Maps API key not configured' :
             apiKey === 'your_google_maps_api_key_here' ? 'Please replace placeholder API key' :
             'Invalid Google Maps API key'}
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
            <p className="text-sm text-orange-800 font-medium mb-2">To enable maps:</p>
            <ol className="text-xs text-orange-700 space-y-1">
              <li>1. Get API key from Google Cloud Console</li>
              <li>2. Enable Maps JavaScript API & Places API</li>
              <li>3. Update VITE_GOOGLE_MAPS_API_KEY in .env</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-palette-orange animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </motion.div>
      )}

      {/* Current location button */}
      {showCurrentLocationButton && (
        <motion.button
          onClick={onCurrentLocationClick || getCurrentUserLocation}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-medium p-3 hover:shadow-high transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isGeocodingLoading}
        >
          <Navigation className={`w-5 h-5 text-palette-orange ${isGeocodingLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      )}

      {/* Address display */}
      {showAddressDisplay && (
        <motion.div
          className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-medium p-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-palette-orange mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">Selected Location</p>
              {isGeocodingLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-palette-orange animate-spin" />
                  <span className="text-sm text-gray-500">Getting address...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed break-words">
                  {currentAddress || 'Address not available'}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {currentLocation?.lat?.toFixed(6) || '0.000000'}, {currentLocation?.lng?.toFixed(6) || '0.000000'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Center crosshair (optional visual aid) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 border-2 border-palette-orange rounded-full bg-white bg-opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-palette-orange rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>


    </div>
  );
});

GoogleMapPicker.displayName = 'GoogleMapPicker';

export default GoogleMapPicker;
