import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, MapPin, RefreshCw, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useManageAddressContext } from '../../contexts/ManageAddressContext';

/**
 * Individual Address Card Component with React.memo for optimization
 * Updated to match Flutter app UI exactly
 */
const AddressCard = React.memo(({
  address,
  onEdit,
  onDelete,
  onSetAsPrimary,
  isActionLoading,
  isPrimary
}) => {

  // Memoized handlers to prevent re-renders
  const handleEdit = useCallback(() => {
    onEdit(address);
  }, [onEdit, address]);

  const handleDelete = useCallback(() => {
    onDelete(address.id);
  }, [onDelete, address.id]);

  const handleSetAsPrimary = useCallback(() => {
    onSetAsPrimary(address.id);
  }, [onSetAsPrimary, address.id]);

  // Format address display
  const formatAddress = useCallback(() => {
    const parts = [
      address.flatNumber || address.flat_number || address.flat_no,
      address.buildingName || address.building_name,
      address.streetAddress || address.street_address,
      address.city,
      address.state,
      address.postalCode || address.postal_code
    ].filter(Boolean);

    return parts.join(', ');
  }, [address]);

  // Get user name from address or use default
  const getUserName = useCallback(() => {
    console.log('Address:', address);
    return address.name || address.userName ;
  }, [address]);

  // Get phone number from address or use default
  const getPhoneNumber = useCallback(() => {
    return address.phoneNumber || address.phone ;
  }, [address]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-all duration-300"
    >
      {/* Header with Name and Action Icons */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {getUserName()}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isActionLoading === 'delete'}
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            {isActionLoading === 'delete' ? (
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          {formatAddress()}
        </p>
        <p className="text-sm text-gray-600">
          {getPhoneNumber()}
        </p>
      </div>

      {/* Set As Default Section */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={handleSetAsPrimary}
          disabled={isActionLoading === 'setPrimary'}
          className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors duration-200"
        >
          {isPrimary ? (
            <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 border-2 border-gray-300 rounded-sm hover:border-orange-400 transition-colors duration-200" />
          )}
          <span className="text-sm text-gray-600">
            {isActionLoading === 'setPrimary' ? 'Setting...' : 'Set As Default'}
          </span>
        </button>
        <span className="text-sm text-gray-500">
          {address.addressType || address.address_type || 'home'}
        </span>
      </div>
    </motion.div>
  );
});

AddressCard.displayName = 'AddressCard';

/**
 * Main Manage Address Component with React.memo for optimization
 */
const ManageAddressComponent = React.memo(({ 
  onAddNewAddress,
  onEditAddress 
}) => {
  const {
    addresses,
    loading,
    actionLoading,
    error,
    hasAddresses,
    addressCount,
    deleteAddress,
    setAsPrimary,
    isAddressPrimary,
    refreshAddresses
  } = useManageAddressContext();

  // Memoized handlers to prevent re-renders
  const handleAddNewAddress = useCallback(() => {
    onAddNewAddress?.();
  }, [onAddNewAddress]);

  const handleEditAddress = useCallback((address) => {
    onEditAddress?.(address);
  }, [onEditAddress]);

  const handleDeleteAddress = useCallback(async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(addressId);
    }
  }, [deleteAddress]);

  const handleSetAsPrimary = useCallback(async (addressId) => {
    await setAsPrimary(addressId);
  }, [setAsPrimary]);

  const handleRefresh = useCallback(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading addresses...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!hasAddresses) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Addresses</h3>
        <p className="text-gray-600 mb-6">Add your first address to get started</p>
        <Button onClick={handleAddNewAddress} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Remove duplicate title, keep only address count and refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {addressCount} saved address{addressCount !== 1 ? 'es' : ''}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          title="Refresh addresses"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
            onSetAsPrimary={handleSetAsPrimary}
            isActionLoading={actionLoading[address.id]}
            isPrimary={isAddressPrimary(address.id)}
          />
        ))}
      </div>

      {/* Add New Address Button */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={handleAddNewAddress}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Address
        </Button>
      </div>
    </div>
  );
});

ManageAddressComponent.displayName = 'ManageAddressComponent';

export default ManageAddressComponent;
