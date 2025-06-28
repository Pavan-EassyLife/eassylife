import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus } from 'lucide-react';
import addressService from '../../api/services/addressService';
import { useToast } from '../ui/toast';

/**
 * Address Selection Modal Component
 * Matches Flutter CartAddressBottomSheet implementation
 * Shows saved addresses with radio button selection
 */
const AddressSelectionModal = ({
  isOpen,
  onClose,
  onAddressSelect,
  onAddNewAddress,
  currentAddressId,
  isLoading
}) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();

  // Fetch addresses when modal opens (matches Flutter FetchAddressBottomSheetEvent)
  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      setError(null);

      console.log('🏠 AddressSelectionModal: Fetching addresses...');

      // Fetch real addresses from API (matches Flutter getAddresses implementation)
      const response = await addressService.getAddresses();

      if (response.success && response.data) {
        console.log('🏠 AddressSelectionModal: Addresses fetched successfully:', response.data);
        setAddresses(response.data);

        // Set current address as selected (matches Flutter selectedAddress logic)
        const currentAddress = response.data.find(addr => addr.id === currentAddressId);
        if (currentAddress) {
          setSelectedAddress(currentAddress);
          console.log('🏠 AddressSelectionModal: Current address selected:', currentAddress);
        } else if (response.data.length > 0) {
          // If no current address ID, select the primary address or first address
          const primaryAddress = response.data.find(addr =>
            addr.is_primary === 1 || addr.is_primary === '1' ||
            addr.isPrimary === 1 || addr.isPrimary === '1'
          );
          setSelectedAddress(primaryAddress || response.data[0]);
          console.log('🏠 AddressSelectionModal: Primary/first address selected:', primaryAddress || response.data[0]);
        }
      } else {
        console.warn('🏠 AddressSelectionModal: No addresses found or API error');
        setAddresses([]);
        setError('No addresses found. Please add an address first.');
      }
    } catch (error) {
      console.error('❌ AddressSelectionModal: Failed to fetch addresses:', error);
      setError(error.message || 'Failed to load addresses');
      showError('Failed to load addresses. Please try again.');
      setAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Handle address selection (matches Flutter SelectAddressEvent)
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  // Handle save button (matches Flutter ChangeAddressEvent)
  const handleSave = async () => {
    if (!selectedAddress) return;
    
    try {
      setIsSaving(true);
      await onAddressSelect(selectedAddress);
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Format address display (matches Flutter address formatting)
  const formatAddress = (address) => {
    if (!address) return '';

    // Handle both API response formats (snake_case and camelCase)
    const parts = [
      address.flat_no || address.flatNo || address.flatNumber,
      address.building_name || address.buildingName,
      address.street_address || address.streetAddress,
      address.city,
      address.state,
      address.postal_code || address.postalCode
    ].filter(Boolean);

    return parts.join(', ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-md bg-white rounded-t-3xl max-h-[80vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Address</h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
                  <p className="text-sm text-gray-500 mt-2">Loading addresses...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 px-6">
                  <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                  <motion.button
                    onClick={fetchAddresses}
                    className="text-sm text-orange-600 font-medium hover:text-orange-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Try Again
                  </motion.button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-6">
                  <p className="text-sm text-gray-500 text-center mb-4">No addresses found</p>
                  <motion.button
                    onClick={onAddNewAddress}
                    className="text-sm text-orange-600 font-medium hover:text-orange-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Your First Address
                  </motion.button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Address List */}
                  {addresses.map((address) => {
                    const isSelected = selectedAddress?.id === address.id;

                    return (
                      <motion.div
                        key={address.id}
                        className="flex items-start space-x-3 cursor-pointer"
                        onClick={() => handleAddressSelect(address)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Radio Button */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {/* Address Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {address.address_type || address.addressType || 'Home'}
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {formatAddress(address)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Add New Address Button */}
                  <motion.button
                    onClick={onAddNewAddress}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Address</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Save Button */}
            {selectedAddress && !isLoadingAddresses && (
              <div className="p-6 border-t border-gray-200">
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save'
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressSelectionModal;
