import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { GoogleMapPicker, LocationPermissionModal } from '../location';
import { useToast } from '../ui/toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useLocation } from '../../hooks/useLocation';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAddressContext } from '../../contexts/AddressContext';
import { useManageAddressContext } from '../../contexts/ManageAddressContext';
import AddressSearchBox from '../location/AddressSearchBox';
import ManageAddressComponent from './ManageAddressComponent';
import addressService from '../../api/services/addressService';

/**
 * AddressPageContent - Inner component that has access to ManageAddressContext
 * This component handles the address management flow with proper context integration
 */
const AddressPageContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { saveAddress, checkLocationPermission, getCurrentLocation } = useLocation();
  const { addresses } = useAddressContext();
  const { refreshAddresses } = useManageAddressContext(); // Access to refresh function
  const mapRef = useRef(null);

  // Calculate hasAddress from addresses array
  const hasAddress = addresses && addresses.length > 0;

  // Check current route to determine initial view
  const currentPath = window.location.pathname;
  const isAddRoute = currentPath === '/address/add';

  // View state management
  const [currentView, setCurrentView] = useState(isAddRoute ? 'add' : 'auto'); // 'auto', 'manage', 'add', 'edit'
  const [editingAddress, setEditingAddress] = useState(null);

  // Form state
  const [addressForm, setAddressForm] = useState({
    flat_no: '',
    building_name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'Home'
  });

  const [formErrors, setFormErrors] = useState({});
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 19.0760,
    lng: 72.8777
  });
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // View management handlers with refresh integration
  const handleAddNewAddress = useCallback(() => {
    setCurrentView('add');
    setEditingAddress(null);
    // Reset form for new address
    setAddressForm({
      flat_no: '',
      building_name: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      address_type: 'Home'
    });
    setFormErrors({});
  }, []);

  const handleEditAddress = useCallback((address) => {
    setCurrentView('edit');
    setEditingAddress(address);
    // Populate form with address data
    setAddressForm({
      flat_no: address.flatNumber || address.flat_number || address.flat_no || '',
      building_name: address.buildingName || address.building_name || '',
      street_address: address.streetAddress || address.street_address || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postalCode || address.postal_code || '',
      address_type: (address.addressType || address.address_type || 'home').charAt(0).toUpperCase() + (address.addressType || address.address_type || 'home').slice(1)
    });
    // Set location if available
    if (address.latitude && address.longitude) {
      setSelectedLocation({
        lat: parseFloat(address.latitude),
        lng: parseFloat(address.longitude)
      });
    }
    setFormErrors({});
  }, []);

  const handleBackToManage = useCallback(async () => {
    console.log('🔄 AddressPageContent: Navigating back to manage view and refreshing addresses...');
    setCurrentView('manage');
    setEditingAddress(null);
    setFormErrors({});
    
    // Refresh the address list to show updated data
    try {
      await refreshAddresses();
      console.log('✅ AddressPageContent: Address list refreshed successfully');
    } catch (error) {
      console.error('⚠️ AddressPageContent: Error refreshing address list:', error);
    }
  }, [refreshAddresses]);

  // Determine current view based on user state and manual overrides
  const getCurrentView = useCallback(() => {
    // If we're on the /address/add route, always show add view
    if (isAddRoute) {
      return 'add';
    }
    if (currentView === 'add' || currentView === 'edit') {
      return currentView;
    }
    if (currentView === 'manage') {
      return 'manage';
    }
    // Auto mode - determine based on user's address status
    return hasAddress ? 'manage' : 'add';
  }, [currentView, hasAddress, isAddRoute]);

  // Handle save address with proper refresh
  const handleSaveAddress = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Validate required fields
      const errors = {};
      if (!addressForm.flat_no.trim()) errors.flat_no = 'Flat number is required';
      if (!addressForm.building_name.trim()) errors.building_name = 'Building name is required';
      if (!addressForm.street_address.trim()) errors.street_address = 'Street address is required';
      if (!addressForm.city.trim()) errors.city = 'City is required';
      if (!addressForm.state.trim()) errors.state = 'State is required';
      if (!addressForm.postal_code.trim()) errors.postal_code = 'Postal code is required';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setIsSubmitting(false);
        showError('Please fill in all required fields');
        return;
      }

      console.log('🚀 AddressPageContent: Saving address...');

      // Prepare address data
      const addressData = {
        flatNo: addressForm.flat_no.trim(),
        buildingName: addressForm.building_name.trim(),
        streetAddress: addressForm.street_address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postal_code.trim(),
        addressType: addressForm.address_type.toLowerCase(),
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        isPrimary: saveAsDefault ? 1 : 0
      };

      // Save or update address
      let result;
      if (editingAddress) {
        result = await addressService.updateAddress(editingAddress.id, addressData);
      } else {
        result = await saveAddress(addressData);
      }

      if (result.success) {
        console.log('✅ AddressPageContent: Address saved successfully');
        showSuccess(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!');

        // Refresh address data
        try {
          await refreshAddresses();
        } catch (error) {
          console.error('⚠️ AddressPageContent: Error refreshing address data:', error);
        }

        // Navigate back based on context
        if (isAddRoute) {
          // Check if we came from cart (via state or URL params)
          const returnTo = searchParams.get('returnTo') || (window.history.state?.returnTo);
          if (returnTo === '/cart') {
            console.log('🛒 AddressPageContent: Address saved, returning to cart...');
            navigate('/cart');
          } else {
            console.log('📍 AddressPageContent: Address saved from add route, returning to manage...');
            navigate('/address');
          }
        } else if (editingAddress) {
          console.log('📝 AddressPageContent: Address edited, returning to manage view...');
          await handleBackToManage();
        } else if (hasAddress) {
          console.log('📍 AddressPageContent: New address added, returning to manage view...');
          await handleBackToManage();
        } else {
          console.log('🎯 AddressPageContent: First address saved, navigating to manage view...');
          localStorage.setItem('addressSetupComplete', 'true');
          await handleBackToManage();
        }
      } else {
        console.error('❌ AddressPageContent: Failed to save address:', result.message);
        showError(result.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('💥 AddressPageContent: Error saving address:', error);
      showError(error.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Other handlers (location, input changes, etc.)
  const handleInputChange = useCallback((field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const handleAddressTypeChange = useCallback((type) => {
    setAddressForm(prev => ({ ...prev, address_type: type }));
  }, []);

  const handleLocationChange = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleAddressSelect = useCallback((addressData) => {
    console.log('🏠 Address select - received data:', addressData);
    console.log('🏠 Available address components:', {
      formattedAddress: addressData.formattedAddress,
      streetAddress: addressData.streetAddress,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      coordinates: addressData.coordinates,
      location: addressData.location
    });

    // Handle location coordinates
    if (addressData.location || addressData.coordinates) {
      const locationData = addressData.location || addressData.coordinates;
      const transformedLocation = {
        lat: locationData.latitude || locationData.lat,
        lng: locationData.longitude || locationData.lng
      };
      console.log('🗺️ Address select - transformed location:', transformedLocation);
      setSelectedLocation(transformedLocation);
    }

    // Update form with all available address components
    setAddressForm(prev => {
      const updatedForm = { ...prev };

      // Street address from formatted address or street address
      if (addressData.formattedAddress) {
        updatedForm.street_address = addressData.formattedAddress;
        console.log('✅ Updated street_address from formattedAddress:', addressData.formattedAddress);
      } else if (addressData.streetAddress) {
        updatedForm.street_address = addressData.streetAddress;
        console.log('✅ Updated street_address from streetAddress:', addressData.streetAddress);
      }

      // City
      if (addressData.city) {
        updatedForm.city = addressData.city;
        console.log('✅ Updated city:', addressData.city);
      } else {
        console.log('⚠️ No city data available');
      }

      // State
      if (addressData.state) {
        updatedForm.state = addressData.state;
        console.log('✅ Updated state:', addressData.state);
      } else {
        console.log('⚠️ No state data available');
      }

      // Postal code
      if (addressData.postalCode) {
        updatedForm.postal_code = addressData.postalCode;
        console.log('✅ Updated postal_code:', addressData.postalCode);
      } else {
        console.log('⚠️ No postal code data available');
      }

      console.log('🏠 Final updated address form:', updatedForm);
      return updatedForm;
    });
  }, []);

  const handleSearchAddressSelect = useCallback((addressData) => {
    handleAddressSelect(addressData);
  }, [handleAddressSelect]);

  const handleCurrentLocationClick = useCallback(async () => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setShowLocationModal(true);
        return;
      }
      const location = await getCurrentLocation();
      if (location) {
        // Transform location object to match GoogleMapPicker expected format
        const transformedLocation = {
          lat: location.latitude || location.lat,
          lng: location.longitude || location.lng
        };
        console.log('🗺️ Transformed location for map:', transformedLocation);
        setSelectedLocation(transformedLocation);
      }
    } catch (error) {
      console.error('Current location error:', error);
      showError('Failed to get current location');
    }
  }, [checkLocationPermission, getCurrentLocation, showError]);

  const handleLocationPermissionGranted = useCallback(async () => {
    setShowLocationModal(false);
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Transform location object to match GoogleMapPicker expected format
        const transformedLocation = {
          lat: location.latitude || location.lat,
          lng: location.longitude || location.lng
        };
        console.log('🗺️ Transformed location for map:', transformedLocation);
        setSelectedLocation(transformedLocation);
      }
    } catch (error) {
      console.error('Location permission granted but failed to get location:', error);
      showError('Failed to get current location');
    }
  }, [getCurrentLocation, showError]);

  // Get current view to render
  const viewToRender = getCurrentView();

  // Dynamic page title based on current view
  const getPageTitle = () => {
    switch (viewToRender) {
      case 'manage':
        return 'Manage Addresses';
      case 'edit':
        return 'Edit Address';
      case 'add':
      default:
        return 'Add Your Address';
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ options, value, onChange }) => {
    return (
      <div className="relative bg-gray-100 rounded-lg p-1 flex">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              relative flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ease-in-out
              ${value === option
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            style={value === option ? {
              background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
              backgroundSize: '400% 400%',
              animation: 'gradient 8s ease infinite'
            } : {}}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onAllowLocation={handleLocationPermissionGranted}
        onSkipLocation={() => setShowLocationModal(false)}
        isLoading={false}
      />

      {/* Page Title Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (viewToRender === 'manage') {
                    navigate(-1);
                  } else if (isAddRoute) {
                    // Check if we came from cart
                    const returnTo = searchParams.get('returnTo') || (window.history.state?.returnTo);
                    if (returnTo === '/cart') {
                      navigate('/cart');
                    } else {
                      navigate('/address');
                    }
                  } else {
                    handleBackToManage();
                  }
                }}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewToRender === 'manage' ? (
          /* Manage Address View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <ManageAddressComponent
              onAddNewAddress={handleAddNewAddress}
              onEditAddress={handleEditAddress}
            />
          </motion.div>
        ) : (
          /* Add/Edit Address Form View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                {/* Form Title */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Address Details</h2>
                  <p className="text-sm sm:text-base text-gray-600">Please provide your address to continue using our services</p>
                </div>

                {/* Address Search Box */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Address
                  </label>
                  <AddressSearchBox
                    onAddressSelect={handleSearchAddressSelect}
                    onCurrentLocationClick={handleCurrentLocationClick}
                    placeholder="Search for area, street name..."
                    className="w-full"
                    initialValue={addressForm.street_address || ""}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Search for your address or use current location, then fill in the details below
                  </p>
                </div>

                {/* Address Form */}
                <div className="space-y-6">
                  {/* Flat Number and Building Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.6 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flat/House Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={addressForm.flat_no}
                        onChange={(e) => handleInputChange('flat_no', e.target.value)}
                        placeholder="e.g., 101, A-1"
                        className={`transition-all duration-300 ease-in-out ${
                          formErrors.flat_no
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                      {formErrors.flat_no && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.flat_no}</p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.6 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building/Society Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={addressForm.building_name}
                        onChange={(e) => handleInputChange('building_name', e.target.value)}
                        placeholder="e.g., ABC Apartments"
                        className={`transition-all duration-300 ease-in-out ${
                          formErrors.building_name
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                      {formErrors.building_name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.building_name}</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Street Address */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={addressForm.street_address}
                      onChange={(e) => handleInputChange('street_address', e.target.value)}
                      placeholder="e.g., Main Street, Sector 1"
                      className={`transition-all duration-300 ease-in-out ${
                        formErrors.street_address
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'focus:border-orange-500 focus:ring-orange-500'
                      }`}
                    />
                    {formErrors.street_address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.street_address}</p>
                    )}
                  </motion.div>

                  {/* City, State, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.6 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="e.g., Mumbai"
                        className={`transition-all duration-300 ease-in-out ${
                          formErrors.city
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="e.g., Maharashtra"
                        className={`transition-all duration-300 ease-in-out ${
                          formErrors.state
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.6 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={addressForm.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        placeholder="e.g., 400001"
                        className={`transition-all duration-300 ease-in-out ${
                          formErrors.postal_code
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                      {formErrors.postal_code && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.postal_code}</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Address Type Toggle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Save As
                    </label>
                    <ToggleSwitch
                      options={['Home', 'Work']}
                      value={addressForm.address_type}
                      onChange={handleAddressTypeChange}
                    />
                  </motion.div>

                  {/* Save as Default Toggle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.6 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Set as Default Address
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Use this address for future orders
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSaveAsDefault(!saveAsDefault)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out
                        ${saveAsDefault ? 'bg-orange-500' : 'bg-gray-300'}
                      `}
                    >
                      <motion.span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out"
                        animate={{
                          x: saveAsDefault ? 24 : 4
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    </button>
                  </motion.div>

                  {/* Save Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="pt-4"
                  >
                    <Button
                      onClick={handleSaveAddress}
                      disabled={isSubmitting}
                      className="w-full py-3 text-white font-semibold rounded-lg transition-all duration-500 ease-in-out shadow-md hover:shadow-lg relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
                        backgroundSize: '400% 400%',
                        animation: 'gradient 8s ease infinite'
                      }}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Saving Address...
                        </motion.div>
                      ) : (
                        editingAddress ? 'Update Address' : 'Save Address'
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Map Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCurrentLocationClick}
                        className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <Navigation className="w-4 h-4" />
                        Current Location
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Pin your exact location on the map
                  </p>
                </div>

                {/* Map Container */}
                <div className="h-[400px] lg:h-[600px]">
                  <GoogleMapPicker
                    ref={mapRef}
                    initialLocation={selectedLocation}
                    onLocationChange={handleLocationChange}
                    onAddressSelect={handleAddressSelect}
                    className="w-full h-full"
                    zoom={15}
                    showCurrentLocationButton={false}
                    showAddressDisplay={true}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Global CSS Styles */}
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

        /* Smooth transitions for form inputs */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus states */
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
        }

        /* Smooth hover effects */
        .smooth-hover {
          transition: all 0.3s ease-in-out;
        }

        .smooth-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        /* Button hover effects */
        .button-hover {
          transition: all 0.3s ease-in-out;
        }

        .button-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(251, 146, 60, 0.3);
        }

        /* Card hover effects */
        .card-hover {
          transition: all 0.3s ease-in-out;
        }

        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .smooth-hover:hover,
          .card-hover:hover,
          .button-hover:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AddressPageContent;
