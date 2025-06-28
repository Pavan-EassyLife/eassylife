import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Home, Briefcase, User, Edit3, Trash2,
  Star, Plus, Navigation, Check, AlertCircle, Map, Eye
} from 'lucide-react';
import { AnimatedButton } from '../ui/animated-button';
import { useToast } from '../ui/toast';
import addressService from '../../api/services/addressService';
import AddressMapView from './AddressMapView';

/**
 * Address List Management Component
 * Implements Flutter app's address list with CRUD operations
 */
const AddressListManager = ({
  onAddAddress,
  onEditAddress,
  onSelectAddress,
  selectionMode = false,
  selectedAddressId = null,
  showMapView = false,
  onToggleMapView,
  className = ''
}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [viewMode, setViewMode] = useState(showMapView ? 'map' : 'list'); // 'list' or 'map'

  const { showSuccess, showError } = useToast();

  // Address type icons
  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return User;
    }
  };

  // Address type colors
  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'home': return 'text-green-600 bg-green-100';
      case 'work': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Load addresses from API
   */
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await addressService.getAddresses();

      if (result.success) {
        setAddresses(result.data || []);
      } else {
        showError(result.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      showError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set address as primary
   */
  const handleSetPrimary = async (addressId) => {
    try {
      setActionLoading(prev => ({ ...prev, [addressId]: 'primary' }));

      const result = await addressService.setDefaultAddress(addressId);

      if (result.success) {
        showSuccess('Primary address updated');
        await loadAddresses(); // Refresh list
      } else {
        showError(result.message || 'Failed to set primary address');
      }
    } catch (error) {
      console.error('Error setting primary address:', error);
      showError('Failed to set primary address');
    } finally {
      setActionLoading(prev => ({ ...prev, [addressId]: null }));
    }
  };

  /**
   * Delete address
   */
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [addressId]: 'delete' }));

      const result = await addressService.deleteAddress(addressId);

      if (result.success) {
        showSuccess('Address deleted successfully');
        await loadAddresses(); // Refresh list
      } else {
        showError(result.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showError('Failed to delete address');
    } finally {
      setActionLoading(prev => ({ ...prev, [addressId]: null }));
    }
  };

  /**
   * Format address for display
   */
  const formatAddress = (address) => {
    const parts = [
      address.flat_no || address.flatNo,
      address.building_name || address.buildingName,
      address.street_address || address.streetAddress,
      address.city,
      address.state,
      address.postal_code || address.postalCode
    ].filter(Boolean);

    return parts.join(', ');
  };

  /**
   * Check if address is primary
   */
  const isPrimaryAddress = (address) => {
    return address.is_primary === 1 || address.is_primary === '1' ||
           address.isPrimary === 1 || address.isPrimary === '1';
  };

  /**
   * Check if address has valid coordinates
   */
  const hasValidCoordinates = (address) => {
    const lat = address.latitude || address.lat;
    const lng = address.longitude || address.lng;
    return lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  };

  /**
   * Get addresses with valid coordinates for map view
   */
  const getAddressesWithCoordinates = () => {
    return addresses.filter(hasValidCoordinates);
  };

  /**
   * Toggle between list and map view
   */
  const toggleViewMode = () => {
    const newMode = viewMode === 'list' ? 'map' : 'list';
    setViewMode(newMode);
    if (onToggleMapView) {
      onToggleMapView(newMode === 'map');
    }
  };

  /**
   * Handle address selection from map
   */
  const handleMapAddressSelect = (address) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <motion.div
        className={`text-center py-12 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses found</h3>
        <p className="text-gray-600 mb-6">Add your first address to get started</p>

        <AnimatedButton
          onClick={onAddAddress}
          variant="primary"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Address
        </AnimatedButton>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectionMode ? 'Select Address' : 'Saved Addresses'}
          </h3>

          {/* Address count and coordinates info */}
          {addresses.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{addresses.length} address{addresses.length !== 1 ? 'es' : ''}</span>
              {getAddressesWithCoordinates().length > 0 && (
                <>
                  <span>•</span>
                  <span>{getAddressesWithCoordinates().length} with location</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {addresses.length > 0 && getAddressesWithCoordinates().length > 0 && (
            <AnimatedButton
              onClick={toggleViewMode}
              variant="outline"
              size="sm"
              className={viewMode === 'map' ? 'bg-palette-orange text-white border-palette-orange' : ''}
            >
              {viewMode === 'list' ? (
                <>
                  <Map className="w-4 h-4 mr-2" />
                  Map View
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  List View
                </>
              )}
            </AnimatedButton>
          )}

          {!selectionMode && (
            <AnimatedButton
              onClick={onAddAddress}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </AnimatedButton>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AddressMapView
              addresses={getAddressesWithCoordinates()}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleMapAddressSelect}
              height="400px"
              zoom={12}
              showControls={true}
              interactive={true}
              className="border border-gray-200 rounded-lg"
            />

            {/* Map view info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Map View</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Click on markers to view address details.
                {selectionMode ? ' Select an address by clicking on its marker.' : ' Use the controls to navigate the map.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Address List */}
            <div className="space-y-3">
              <AnimatePresence>
          {addresses.map((address, index) => {
            const TypeIcon = getAddressTypeIcon(address.address_type || address.addressType);
            const isSelected = selectedAddressId === address.id;
            const isPrimary = isPrimaryAddress(address);
            const isActionLoading = actionLoading[address.id];

            return (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white border-2 rounded-lg p-4 transition-all duration-300 ${
                  selectionMode
                    ? isSelected
                      ? 'border-palette-orange bg-palette-orange bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={selectionMode ? () => onSelectAddress(address) : undefined}
                whileHover={{ scale: selectionMode ? 1.02 : 1 }}
              >
                {/* Primary badge */}
                {isPrimary && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-palette-orange text-white text-xs px-2 py-1 rounded-full">
                      <Star className="w-3 h-3" />
                      Primary
                    </div>
                  </div>
                )}

                {/* Selection indicator */}
                {selectionMode && (
                  <div className="absolute top-4 right-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-palette-orange border-palette-orange'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Address type icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAddressTypeColor(address.address_type || address.addressType)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  {/* Address details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {address.address_type || address.addressType || 'Address'}
                      </h4>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                      {formatAddress(address)}
                    </p>

                    {/* Coordinates (if available) */}
                    {(address.latitude || address.lat) && (address.longitude || address.lng) && (
                      <p className="text-xs text-gray-500">
                        📍 {(address.latitude || address.lat)}, {(address.longitude || address.lng)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!selectionMode && (
                    <div className="flex items-center gap-2">
                      {/* View on Map button (only if coordinates available) */}
                      {hasValidCoordinates(address) && (
                        <AnimatedButton
                          onClick={() => {
                            setViewMode('map');
                            // Small delay to ensure map is rendered before selecting
                            setTimeout(() => handleMapAddressSelect(address), 100);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                          title="View on Map"
                        >
                          <Eye className="w-4 h-4" />
                        </AnimatedButton>
                      )}

                      {!isPrimary && (
                        <AnimatedButton
                          onClick={() => handleSetPrimary(address.id)}
                          variant="ghost"
                          size="sm"
                          loading={isActionLoading === 'primary'}
                          className="text-palette-orange hover:bg-palette-orange hover:bg-opacity-10"
                          title="Set as Primary"
                        >
                          <Star className="w-4 h-4" />
                        </AnimatedButton>
                      )}

                      <AnimatedButton
                        onClick={() => onEditAddress(address)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                        title="Edit Address"
                      >
                        <Edit3 className="w-4 h-4" />
                      </AnimatedButton>

                      <AnimatedButton
                        onClick={() => handleDeleteAddress(address.id)}
                        variant="ghost"
                        size="sm"
                        loading={isActionLoading === 'delete'}
                        className="text-red-600 hover:bg-red-50"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </AnimatedButton>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
              </AnimatePresence>
            </div>

            {/* Footer info for list view */}
            {selectionMode && (
              <motion.div
                className="text-center text-sm text-gray-500 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Tap on an address to select it for delivery
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressListManager;
