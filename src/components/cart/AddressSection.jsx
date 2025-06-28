import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import addressService from '../../api/services/addressService';
import cartService from '../../api/services/cartService';
import AddressSelectionModal from './AddressSelectionModal';
import { useToast } from '../ui/toast';

/**
 * Address Section Component
 * Matches Flutter addressWidgetBuilder implementation
 * Shows current delivery address with change functionality
 */
const AddressSection = React.memo(({ cartState }) => {
  const navigate = useNavigate();
  const { updateCartState, refreshCartData } = useCart();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressChanging, setIsAddressChanging] = useState(false);
  const [primaryAddress, setPrimaryAddress] = useState(null);
  const { showSuccess, showError } = useToast();

  const { cartData } = cartState;
  // FIX: Use correct API field name (delivery_address not deliveryAddress)
  const addressData = cartData?.delivery_address;

  // Debug logging for address data changes (only log once on mount)
  useEffect(() => {
    if (cartData) {
      console.log('🏠 AddressSection: Initial address data:', {
        addressData,
        cartDataExists: !!cartData,
        deliveryAddressExists: !!cartData?.delivery_address
      });
    }
  }, []); // Empty dependency array to run only once

  // Fetch primary address on component mount (matches Flutter logic)
  useEffect(() => {
    const fetchPrimaryAddress = async () => {
      try {
        const response = await addressService.getAddresses();
        if (response.success && response.data) {
          // Find primary address (matches Flutter logic: isPrimary == 1)
          const primary = response.data.find(address => address.isPrimary === 1 || address.isPrimary === '1');
          if (primary) {
            setPrimaryAddress(primary);
          } else {
            // Fallback: Use first address if no primary found
            const firstAddress = response.data[0];
            if (firstAddress) {
              setPrimaryAddress(firstAddress);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch primary address:', error);
      }
    };

    // Only fetch if no address data from cart and user is authenticated
    if (!addressData) {
      fetchPrimaryAddress();
    }
  }, [addressData]);

  // Handle address change button click (matches Flutter onTap)
  const handleAddressChange = React.useCallback(() => {
    setIsAddressModalOpen(true);

    // Analytics tracking (matches Flutter analytics)
    // analytics.track('address_change_initiated', {
    //   current_address_id: addressData?.id,
    //   cart_value: cartData?.totalPrice
    // });
  }, []);

  // Handle address selection from modal (matches Flutter ChangeAddressEvent)
  const handleAddressSelect = React.useCallback(async (selectedAddress) => {
    if (!selectedAddress || !selectedAddress.id) {
      showError('Invalid address selected');
      return;
    }

    try {
      setIsAddressChanging(true);

      console.log('🛒 AddressSection: Changing cart address to:', selectedAddress);

      // Call change address API (matches Flutter changeCartAddress implementation)
      const response = await cartService.updateCartAddress(selectedAddress.id);

      if (response.success) {
        console.log('✅ AddressSection: Cart address updated successfully');

        // Refresh cart data to get updated address (matches Flutter RefreshCartDataEvent)
        await refreshCartData();

        // Close modal
        setIsAddressModalOpen(false);

        // Show success message (matches Flutter showToast)
        showSuccess(response.message || 'Address updated successfully');

        // Analytics tracking (matches Flutter analytics)
        console.log('📊 AddressSection: Address change analytics:', {
          new_address_id: selectedAddress.id,
          cart_value: cartState.cartData?.totalPrice
        });
      } else {
        throw new Error(response.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('❌ AddressSection: Failed to update address:', error);
      showError(error.message || 'Failed to update address. Please try again.');

      // Analytics tracking for failure
      console.log('📊 AddressSection: Address change failed:', {
        error: error.message,
        address_id: selectedAddress.id
      });
    } finally {
      setIsAddressChanging(false);
    }
  }, [refreshCartData, showError, showSuccess, cartState.cartData?.totalPrice]);

  // Handle add new address
  const handleAddNewAddress = React.useCallback(() => {
    setIsAddressModalOpen(false);
    navigate('/address/add', {
      state: { returnTo: '/cart' }
    });
  }, [navigate]);

  // Format address display (matches Flutter address formatting)
  const formatAddress = (address) => {
    if (!address) return 'No address selected';

    // FIX: Handle API response field names (snake_case)
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

  // Get display address (cart address takes priority, fallback to primary)
  const getDisplayAddress = () => {
    return addressData || primaryAddress;
  };

  const displayAddress = getDisplayAddress();

  return (
    <>
      {/* Address Section Container */}
      <motion.div 
        className="mx-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gray-100 rounded-2xl p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Address</h3>
            <motion.button
              onClick={handleAddressChange}
              disabled={isAddressChanging}
              className="text-base font-semibold text-gray-900 underline hover:text-orange-600 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAddressChanging ? 'Changing...' : 'Change'}
            </motion.button>
          </div>

          {/* Address Content */}
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {displayAddress ? (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayAddress.address_type || displayAddress.addressType || 'Home'}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">
                    {formatAddress(displayAddress)}
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No delivery address selected</p>
                  <motion.button
                    onClick={handleAddressChange}
                    className="text-sm text-orange-600 font-medium hover:text-orange-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Address
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSelect={handleAddressSelect}
        onAddNewAddress={handleAddNewAddress}
        currentAddressId={addressData?.id}
        isLoading={isAddressChanging}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Re-render if cart data or delivery address changes
  const prevAddress = prevProps.cartState?.cartData?.delivery_address;
  const nextAddress = nextProps.cartState?.cartData?.delivery_address;

  // Compare address IDs to detect changes
  const prevAddressId = prevAddress?.id;
  const nextAddressId = nextAddress?.id;

  return prevAddressId === nextAddressId;
});

export default AddressSection;
