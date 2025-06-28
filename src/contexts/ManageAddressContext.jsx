import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '../components/ui/toast';
import addressService from '../api/services/addressService';
import { useAuthContext } from './AuthContext';
import { useAddressContext } from './AddressContext';

/**
 * ManageAddressContext for managing address list state with optimized performance
 * Uses React.memo, useCallback, and useMemo to prevent unnecessary re-renders
 */
const ManageAddressContext = createContext();

export const useManageAddressContext = () => {
  const context = useContext(ManageAddressContext);
  if (!context) {
    throw new Error('useManageAddressContext must be used within a ManageAddressProvider');
  }
  return context;
};

export const ManageAddressProvider = React.memo(({ children }) => {
  const { showSuccess, showError } = useToast();
  const { fetchAddresses } = useAddressContext();

  // State management
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Load addresses on mount
  useEffect(() => {
    if (!initialized) {
      loadAddresses();
    }
  }, [initialized]);

  /**
   * Load all addresses with memoized callback
   */
  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📍 ManageAddressContext: Loading addresses...');

      const result = await addressService.getAddresses();
      
      if (result.success) {
        console.log('✅ ManageAddressContext: Addresses loaded:', result.data);
        setAddresses(result.data || []);
      } else {
        console.warn('⚠️ ManageAddressContext: Failed to load addresses:', result.message);
        setError(result.message || 'Failed to load addresses');
        setAddresses([]);
      }
    } catch (error) {
      console.error('❌ ManageAddressContext: Load addresses error:', error);
      setError(error.message || 'Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  /**
   * Refresh addresses (force reload)
   */
  const refreshAddresses = useCallback(async () => {
    console.log('🔄 ManageAddressContext: Refreshing addresses...');
    setInitialized(false); // Force reload
    await loadAddresses();
    
    // Also refresh address context data
    try {
      await fetchAddresses();
    } catch (error) {
      console.warn('⚠️ ManageAddressContext: Failed to refresh address data:', error);
    }
  }, [loadAddresses, fetchAddresses]);

  /**
   * Delete address with optimistic updates
   */
  const deleteAddress = useCallback(async (addressId) => {
    try {
      console.log('🗑️ ManageAddressContext: Deleting address:', addressId);
      
      // Set loading state for specific address
      setActionLoading(prev => ({ ...prev, [addressId]: 'delete' }));

      const result = await addressService.deleteAddress(addressId);

      if (result.success) {
        // Optimistic update - remove from local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        showSuccess('Address deleted successfully');
        
        // Refresh address context
        await fetchAddresses();
      } else {
        showError(result.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('❌ ManageAddressContext: Delete address error:', error);
      showError(error.message || 'Failed to delete address');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[addressId];
        return newState;
      });
    }
  }, [showSuccess, showError, fetchAddresses]);

  /**
   * Set address as primary with optimistic updates
   */
  const setAsPrimary = useCallback(async (addressId) => {
    try {
      console.log('🎯 ManageAddressContext: Setting address as primary:', addressId);
      
      // Set loading state for specific address
      setActionLoading(prev => ({ ...prev, [addressId]: 'setPrimary' }));

      const result = await addressService.setAsPrimary(addressId);

      if (result.success) {
        // Optimistic update - update local state
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isPrimary: addr.id === addressId ? 1 : 0,
          is_primary: addr.id === addressId ? 1 : 0
        })));
        
        showSuccess('Primary address updated successfully');

        // Update header address immediately with the new primary address
        const newPrimaryAddress = addresses.find(addr => addr.id === addressId);
        if (newPrimaryAddress) {
          const formattedAddress = formatAddressDisplay(newPrimaryAddress);
          updateSelectedAddress({
            formattedAddress,
            searchQuery: formattedAddress,
            coordinates: {
              latitude: newPrimaryAddress.latitude,
              longitude: newPrimaryAddress.longitude
            },
            placeId: null,
            addressId: newPrimaryAddress.id,
            isPrimary: true
          });
          console.log('📍 ManageAddressContext: Header address updated with new primary address');
        }

        // Refresh address context
        await fetchAddresses();
      } else {
        showError(result.message || 'Failed to set primary address');
      }
    } catch (error) {
      console.error('❌ ManageAddressContext: Set primary address error:', error);
      showError(error.message || 'Failed to set primary address');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[addressId];
        return newState;
      });
    }
  }, [showSuccess, showError, fetchAddresses]);

  /**
   * Get primary address from current list
   */
  const getPrimaryAddress = useCallback(() => {
    return addresses.find(addr => {
      const isPrimaryValue = addr.isPrimary ?? addr.is_primary;
      return isPrimaryValue?.toString() === '1';
    });
  }, [addresses]);

  /**
   * Check if address is primary
   */
  const isAddressPrimary = useCallback((addressId) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return false;
    
    const isPrimaryValue = address.isPrimary ?? address.is_primary;
    return isPrimaryValue?.toString() === '1';
  }, [addresses]);

  /**
   * Get address by ID
   */
  const getAddressById = useCallback((addressId) => {
    return addresses.find(addr => addr.id === addressId);
  }, [addresses]);

  /**
   * Format address for display
   */
  const formatAddressDisplay = useCallback((address) => {
    if (!address) return '';

    const parts = [
      address.flatNumber || address.flat_number || address.flat_no,
      address.buildingName || address.building_name,
      address.streetAddress || address.street_address,
      address.city,
      address.state,
      address.postalCode || address.postal_code
    ].filter(Boolean);

    return parts.join(', ');
  }, []);

  /**
   * Get address type icon
   */
  const getAddressTypeIcon = useCallback((addressType) => {
    switch (addressType?.toLowerCase()) {
      case 'home': return 'Home';
      case 'work': return 'Briefcase';
      default: return 'User';
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // State
    addresses,
    loading,
    actionLoading,
    error,
    initialized,
    
    // Actions
    loadAddresses,
    refreshAddresses,
    deleteAddress,
    setAsPrimary,
    
    // Getters
    getPrimaryAddress,
    isAddressPrimary,
    getAddressById,
    
    // Utilities
    formatAddressDisplay,
    getAddressTypeIcon,
    
    // Computed values
    hasAddresses: addresses.length > 0,
    addressCount: addresses.length
  }), [
    addresses,
    loading,
    actionLoading,
    error,
    initialized,
    loadAddresses,
    refreshAddresses,
    deleteAddress,
    setAsPrimary,
    getPrimaryAddress,
    isAddressPrimary,
    getAddressById,
    formatAddressDisplay,
    getAddressTypeIcon
  ]);

  return (
    <ManageAddressContext.Provider value={contextValue}>
      {children}
    </ManageAddressContext.Provider>
  );
});

ManageAddressProvider.displayName = 'ManageAddressProvider';

export default ManageAddressContext;
