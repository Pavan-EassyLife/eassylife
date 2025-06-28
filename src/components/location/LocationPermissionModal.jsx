import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useLocation } from '../../hooks/useLocation';

/**
 * Location Permission Modal Component
 * Requests location access with clear messaging using shadcn/ui components
 * Enhanced with API integration for saving GPS location (Flutter-aligned)
 */
const LocationPermissionModal = ({
  isOpen,
  onClose,
  onAllowLocation,
  onSkipLocation,
  isLoading = false
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const { getCurrentLocation, getAddressFromCoordinates, saveLocation, checkLocationPermission } = useLocation();

  // Enhanced location permission handler with API integration
  const handleAllowLocationWithAPI = async () => {
    setInternalLoading(true);
    try {
      console.log('🔄 LocationPermissionModal: Requesting location permission...');

      // Get current location
      const location = await getCurrentLocation();
      console.log('✅ LocationPermissionModal: Location obtained:', location);

      // Get formatted address
      let formattedAddress = `${location.latitude}, ${location.longitude}`;
      try {
        const addressData = await getAddressFromCoordinates(location.latitude, location.longitude);
        formattedAddress = addressData.formattedAddress || formattedAddress;
        console.log('✅ LocationPermissionModal: Address formatted:', formattedAddress);
      } catch (geocodeError) {
        console.log('⚠️ LocationPermissionModal: Geocoding failed, using coordinates');
      }

      // Save location to backend (Flutter-aligned)
      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: formattedAddress,
        accuracy: location.accuracy,
        timestamp: location.timestamp || new Date().toISOString()
      };

      console.log('🚀 LocationPermissionModal: Saving location to backend:', locationData);
      const saveResult = await saveLocation(locationData);

      if (saveResult.success) {
        console.log('✅ LocationPermissionModal: Location saved successfully');
        // Mark location as captured
        localStorage.setItem('userLocation', JSON.stringify(locationData));

        // Call original callback if provided
        if (onAllowLocation) {
          onAllowLocation(locationData);
        }
      } else {
        console.error('❌ LocationPermissionModal: Failed to save location:', saveResult.message);
        // Still call callback with location data even if save fails
        if (onAllowLocation) {
          onAllowLocation(locationData);
        }
      }
    } catch (error) {
      console.error('❌ LocationPermissionModal: Location permission error:', error);
      // Call original callback to handle error
      if (onAllowLocation) {
        onAllowLocation(null, error);
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const isCurrentlyLoading = isLoading || internalLoading;
  return (
    <>
      {/* Add CSS animation keyframes */}
      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <MapPin className="h-8 w-8 text-orange-600" />
          </motion.div>
          
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Enable Location Access
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 mt-2">
            We need your location to provide accurate address suggestions and show nearby services.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Navigation className="h-5 w-5 text-orange-500 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Accurate Delivery</h4>
              <p className="text-sm text-gray-600">
                Help us deliver to your exact location
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Smart Suggestions</h4>
              <p className="text-sm text-gray-600">
                Get relevant address suggestions based on your area
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Privacy Protected</h4>
              <p className="text-sm text-gray-600">
                Your location data is secure and only used for delivery purposes
              </p>
            </div>
          </div>
        </motion.div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onSkipLocation}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Skip for now
          </Button>
          
          <Button
            onClick={handleAllowLocationWithAPI}
            disabled={isCurrentlyLoading}
            className="w-full sm:w-auto text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
              backgroundSize: '400% 400%',
              animation: 'gradient 8s ease infinite'
            }}
          >
            {isCurrentlyLoading ? (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Getting location...</span>
              </motion.div>
            ) : (
              'Allow Location Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default LocationPermissionModal;
