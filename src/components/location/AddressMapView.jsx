import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { AnimatedButton } from '../ui/animated-button';
import { useToast } from '../ui/toast';

/**
 * Enhanced Address Map View Component
 * Displays saved addresses on Google Maps with interactive features
 * Supports single address view and multiple address visualization
 */
const AddressMapView = ({
  addresses = [],
  selectedAddressId = null,
  onAddressSelect,
  height = '300px',
  zoom = 13,
  showControls = true,
  interactive = true,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai default
  
  const { showError } = useToast();

  // Google Maps API configuration
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const useGoogleMaps = !!apiKey;

  /**
   * Get address coordinates
   */
  const getAddressCoordinates = (address) => {
    const lat = address.latitude || address.lat || null;
    const lng = address.longitude || address.lng || null;
    
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return null;
  };

  /**
   * Format address for display
   */
  const formatAddressForDisplay = (address) => {
    const parts = [
      address.flat_no || address.flatNo,
      address.building_name || address.buildingName,
      address.street_address || address.streetAddress,
      address.city,
      address.state
    ].filter(Boolean);

    return parts.join(', ');
  };

  /**
   * Get marker icon based on address type and selection state
   */
  const getMarkerIcon = (address, isSelected = false) => {
    const addressType = address.address_type || address.addressType || 'other';
    const isPrimary = address.is_primary === 1 || address.is_primary === '1' || 
                     address.isPrimary === 1 || address.isPrimary === '1';
    
    let color = '#FFA301'; // Default orange
    if (isPrimary) color = '#10B981'; // Green for primary
    if (isSelected) color = '#3B82F6'; // Blue for selected
    
    const size = isSelected ? 50 : 40;
    const strokeWidth = isSelected ? 4 : 3;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth}" fill="${color}" stroke="white" stroke-width="${strokeWidth}"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="white"/>
          ${isPrimary ? `<circle cx="${size/2}" cy="${size/2}" r="${size/6}" fill="${color}"/>` : ''}
        </svg>
      `),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size/2, size/2)
    };
  };

  /**
   * Clear existing markers
   */
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  };

  /**
   * Add markers for addresses
   */
  const addMarkersForAddresses = useCallback((map, addressList) => {
    clearMarkers();

    if (!addressList || addressList.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    addressList.forEach((address) => {
      const coordinates = getAddressCoordinates(address);
      
      if (!coordinates) return;

      hasValidCoordinates = true;
      const isSelected = selectedAddressId === address.id;
      
      const marker = new google.maps.Marker({
        position: coordinates,
        map,
        title: formatAddressForDisplay(address),
        icon: getMarkerIcon(address, isSelected),
        animation: isSelected ? google.maps.Animation.BOUNCE : null
      });

      // Create info window content
      const infoContent = `
        <div style="padding: 12px; max-width: 250px; font-family: Inter, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; background: #FFA301; border-radius: 50%;"></div>
            <span style="font-weight: 600; color: #111827; text-transform: capitalize;">
              ${address.address_type || address.addressType || 'Address'}
            </span>
            ${(address.is_primary === 1 || address.isPrimary === 1) ? 
              '<span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px;">PRIMARY</span>' : 
              ''
            }
          </div>
          <p style="color: #374151; font-size: 14px; line-height: 1.4; margin: 0;">
            ${formatAddressForDisplay(address)}
          </p>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
            <span style="color: #6B7280; font-size: 12px;">
              📍 ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}
            </span>
          </div>
        </div>
      `;

      // Add click listener for marker
      marker.addListener('click', () => {
        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow();
        }
        
        infoWindowRef.current.setContent(infoContent);
        infoWindowRef.current.open(map, marker);
        
        if (onAddressSelect && interactive) {
          onAddressSelect(address);
        }
      });

      markersRef.current.push(marker);
      bounds.extend(coordinates);
    });

    // Fit map to show all markers
    if (hasValidCoordinates && addressList.length > 1) {
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    } else if (hasValidCoordinates && addressList.length === 1) {
      const coordinates = getAddressCoordinates(addressList[0]);
      map.setCenter(coordinates);
      map.setZoom(zoom);
    }
  }, [selectedAddressId, onAddressSelect, interactive, zoom]);

  /**
   * Initialize Google Maps
   */
  const initializeMap = useCallback(async () => {
    if (!useGoogleMaps) {
      setIsLoading(false);
      return;
    }

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });

      const google = await loader.load();

      if (!mapRef.current) return;

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom,
        zoomControl: showControls,
        mapTypeControl: false,
        scaleControl: showControls,
        streetViewControl: showControls,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: interactive ? 'cooperative' : 'none',
        disableDefaultUI: !showControls,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add markers for addresses
      if (addresses && addresses.length > 0) {
        addMarkersForAddresses(map, addresses);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      setIsLoading(false);
      showError('Failed to load map. Please try again.');
    }
  }, [apiKey, mapCenter, zoom, showControls, interactive, addresses, addMarkersForAddresses, useGoogleMaps, showError]);

  /**
   * Center map on user's current location
   */
  const centerOnCurrentLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      showError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
        setMapCenter(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        showError('Unable to get your current location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000
      }
    );
  };

  /**
   * Reset map view
   */
  const resetMapView = () => {
    if (mapInstanceRef.current && addresses.length > 0) {
      addMarkersForAddresses(mapInstanceRef.current, addresses);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 19.0760, lng: 72.8777 });
      mapInstanceRef.current.setZoom(13);
    }
  };

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update markers when addresses or selection changes
  useEffect(() => {
    if (mapInstanceRef.current && addresses) {
      addMarkersForAddresses(mapInstanceRef.current, addresses);
    }
  }, [addresses, selectedAddressId, addMarkersForAddresses]);

  if (!useGoogleMaps) {
    return (
      <div className={`relative bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Google Maps not available</p>
          <p className="text-sm text-gray-500">Please configure Google Maps API key</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`relative rounded-lg overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 bg-white shadow-2xl' : ''
      }`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
      layout
    >
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-palette-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls */}
      {showControls && !isLoading && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <AnimatedButton
            onClick={centerOnCurrentLocation}
            variant="secondary"
            size="sm"
            className="bg-white shadow-medium hover:shadow-high"
          >
            <Navigation className="w-4 h-4" />
          </AnimatedButton>
          
          <AnimatedButton
            onClick={resetMapView}
            variant="secondary"
            size="sm"
            className="bg-white shadow-medium hover:shadow-high"
          >
            <RotateCcw className="w-4 h-4" />
          </AnimatedButton>
          
          <AnimatedButton
            onClick={toggleFullscreen}
            variant="secondary"
            size="sm"
            className="bg-white shadow-medium hover:shadow-high"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </AnimatedButton>
        </div>
      )}

      {/* Address count indicator */}
      {!isLoading && addresses.length > 0 && (
        <motion.div
          className="absolute bottom-4 left-4 bg-white rounded-lg shadow-medium px-3 py-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-palette-orange" />
            <span className="text-sm font-medium text-gray-900">
              {addresses.length} address{addresses.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </motion.div>
      )}

      {/* No addresses message */}
      {!isLoading && addresses.length === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center p-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No addresses to display</p>
            <p className="text-sm text-gray-500">Add addresses with coordinates to see them on the map</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddressMapView;
