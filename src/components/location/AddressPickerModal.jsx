import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Search, Check, X, Edit3 } from 'lucide-react';
import { ModernModal } from '../ui/modern-modal';
import { AnimatedButton } from '../ui/animated-button';
import GoogleMapPicker from './GoogleMapPicker';
import PlacesAutocomplete from './PlacesAutocomplete';
import { useToast } from '../ui/toast';
import eassylifeLogo from '../../assets/images/eassylife_logo.png';
import loginBackground from '../../assets/images/loginBackground.png';

/**
 * Enhanced Address Picker Modal
 * Combines Google Maps and Places Autocomplete for comprehensive address selection
 * Implements Flutter app's address picker functionality
 */
const AddressPickerModal = ({
  isOpen,
  onClose,
  onAddressSelect,
  initialLocation = { lat: 19.0760, lng: 72.8777 },
  title = 'Select Your Location',
  subtitle = 'Choose your address from the map or search for a place'
}) => {
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const { showSuccess, showError } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentLocation(initialLocation);
      setCurrentAddress(null);
      setIsConfirming(false);
      setSearchMode(false);
    }
  }, [isOpen, initialLocation]);

  /**
   * Handle location change from map
   */
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
  };

  /**
   * Handle address change from map geocoding
   */
  const handleAddressChange = (addressData) => {
    setCurrentAddress(addressData);
  };

  /**
   * Handle place selection from autocomplete
   */
  const handlePlaceSelect = (placeData) => {
    const location = {
      lat: placeData.coordinates.latitude,
      lng: placeData.coordinates.longitude
    };

    setCurrentLocation(location);
    setCurrentAddress(placeData);
    setSearchMode(false);
  };

  /**
   * Get current user location
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by this browser');
      return;
    }

    setIsConfirming(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setIsConfirming(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        showError('Unable to get your current location');
        setIsConfirming(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0 // Force fresh location, don't use cached data
      }
    );
  };

  /**
   * Confirm address selection
   */
  const handleConfirmAddress = () => {
    if (!currentAddress) {
      showError('Please wait for the address to load');
      return;
    }

    setIsConfirming(true);

    try {
      const addressData = {
        coordinates: {
          latitude: currentLocation?.lat || 0,
          longitude: currentLocation?.lng || 0
        },
        formattedAddress: currentAddress.formattedAddress,
        streetAddress: currentAddress.streetAddress || '',
        city: currentAddress.city || '',
        state: currentAddress.state || '',
        country: currentAddress.country || 'India',
        postalCode: currentAddress.postalCode || '',
        subLocality: currentAddress.subLocality || ''
      };

      showSuccess('Address selected successfully!');
      onAddressSelect(addressData);
    } catch (error) {
      console.error('Error confirming address:', error);
      showError('Failed to confirm address. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="overflow-hidden"
      closeOnBackdropClick={false}
    >
      <div className="flex flex-col lg:flex-row min-h-[600px] max-h-[90vh]">
        {/* Left side with branding */}
        <motion.div
          className="w-full lg:w-2/5 p-8 flex flex-col justify-center items-center relative overflow-hidden"
          style={{
            backgroundColor: '#FFA301',
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative z-10 text-center">
            <motion.img
              src={eassylifeLogo}
              alt="EassyLife Logo"
              className="w-32 h-auto mx-auto mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />

            <motion.h2
              className="text-2xl font-bold text-gray-800 mb-4 text-center font-inter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {title}
            </motion.h2>

            <motion.p
              className="text-gray-700 text-center leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {subtitle}
            </motion.p>
          </div>
        </motion.div>

        {/* Right side with map and controls */}
        <motion.div
          className="w-full lg:w-3/5 bg-white flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Header with search toggle */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {searchMode ? 'Search Places' : 'Select on Map'}
              </h3>

              <div className="flex gap-2">
                <AnimatedButton
                  onClick={() => setSearchMode(!searchMode)}
                  variant={searchMode ? 'primary' : 'outline'}
                  size="sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </AnimatedButton>

                <AnimatedButton
                  onClick={getCurrentLocation}
                  variant="outline"
                  size="sm"
                  loading={isConfirming}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  My Location
                </AnimatedButton>
              </div>
            </div>

            {/* Search input */}
            <AnimatePresence>
              {searchMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlacesAutocomplete
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search for an address, landmark, or place..."
                    className="mb-4"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map container */}
          <div className="flex-1 p-6">
            <GoogleMapPicker
              initialLocation={currentLocation}
              onLocationChange={handleLocationChange}
              onAddressChange={handleAddressChange}
              height="300px"
              className="rounded-lg border border-gray-200"
            />
          </div>

          {/* Address confirmation */}
          <div className="p-6 border-t border-gray-200">
            {currentAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 mb-4"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-palette-orange mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Selected Address:
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentAddress.formattedAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {currentLocation?.lat?.toFixed(6) || '0.000000'}, {currentLocation?.lng?.toFixed(6) || '0.000000'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <AnimatedButton
                onClick={handleConfirmAddress}
                variant="primary"
                size="lg"
                loading={isConfirming}
                disabled={!currentAddress}
                className="flex-1"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirm Address
              </AnimatedButton>

              <AnimatedButton
                onClick={onClose}
                variant="outline"
                size="lg"
                className="px-6"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      </div>
    </ModernModal>
  );
};

export default AddressPickerModal;
