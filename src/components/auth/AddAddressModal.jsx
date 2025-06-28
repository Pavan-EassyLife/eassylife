import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Home, Briefcase, Navigation, Map } from 'lucide-react';
import { ModernModal } from '../ui/modern-modal';
import { AnimatedButton } from '../ui/animated-button';
import { FloatingLabelInput } from '../ui/floating-label-input';
import { useToast } from '../ui/toast';
import { useLocation } from '../../hooks/useLocation';

const AddAddressModal = ({ isOpen, onClose, onAddressSaved, initialLocation = null }) => {
  const [formData, setFormData] = useState({
    flatNo: '',
    buildingName: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    addressType: 'home'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const { showSuccess, showError } = useToast();
  const { saveLocation } = useLocation();

  // Auto-fill form if location is provided
  useEffect(() => {
    if (initialLocation && initialLocation.address) {
      // Parse the address string to fill form fields
      const addressParts = initialLocation.address.split(',').map(part => part.trim());
      
      setFormData(prev => ({
        ...prev,
        address: initialLocation.address,
        city: addressParts[addressParts.length - 3] || 'Mumbai',
        state: addressParts[addressParts.length - 2] || 'Maharashtra',
        pinCode: addressParts[addressParts.length - 1]?.replace(/\D/g, '') || ''
      }));
      
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      addressType: type
    }));
  };

  const handleDetectLocation = async () => {
    setIsLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Failed to get address');
      
      const data = await response.json();
      const detectedAddress = data.display_name || `${latitude}, ${longitude}`;
      
      // Parse and fill form
      const addressParts = detectedAddress.split(',').map(part => part.trim());
      setFormData(prev => ({
        ...prev,
        address: detectedAddress,
        city: addressParts[addressParts.length - 3] || 'Mumbai',
        state: addressParts[addressParts.length - 2] || 'Maharashtra',
        pinCode: addressParts[addressParts.length - 1]?.replace(/\D/g, '') || ''
      }));
      
      setCurrentLocation({ latitude, longitude, address: detectedAddress });
      showSuccess('Location detected successfully!');
      
    } catch (error) {
      console.error('Location detection error:', error);
      showError('Failed to detect location. Please enter manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.address.trim()) {
      showError('Please enter your address');
      return;
    }

    setIsLoading(true);
    try {
      const addressData = {
        flatNo: formData.flatNo,
        buildingName: formData.buildingName,
        streetAddress: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.pinCode,
        addressType: formData.addressType,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
        isPrimary: 1
      };

      await saveLocation(addressData);
      showSuccess('Address saved successfully!');
      onAddressSaved(addressData);
      
    } catch (error) {
      console.error('Error saving address:', error);
      showError('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
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
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Address</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="h-48 bg-gray-100 border-b border-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Map View</p>
              {currentLocation && (
                <p className="text-xs text-gray-500 mt-1">
                  {currentLocation.latitude?.toFixed(6)}, {currentLocation.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          {/* Detect Location Button */}
          <div className="absolute top-4 right-4">
            <AnimatedButton
              onClick={handleDetectLocation}
              loading={isLoading}
              size="sm"
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Detect Location
            </AnimatedButton>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Flat No and Building Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat No
                </label>
                <FloatingLabelInput
                  label=""
                  value={formData.flatNo}
                  onChange={(e) => handleInputChange('flatNo', e.target.value)}
                  placeholder="Flat No"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building Name
                </label>
                <FloatingLabelInput
                  label=""
                  value={formData.buildingName}
                  onChange={(e) => handleInputChange('buildingName', e.target.value)}
                  placeholder="Building Name"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-palette-orange z-10" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  placeholder="Type your address here!"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-orange focus:border-palette-orange transition-all duration-300 resize-none"
                  required
                />
              </div>
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <FloatingLabelInput
                  label=""
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <FloatingLabelInput
                  label=""
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            {/* Pin Code and Save As */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code
                </label>
                <FloatingLabelInput
                  label=""
                  value={formData.pinCode}
                  onChange={(e) => handleInputChange('pinCode', e.target.value)}
                  placeholder="400101"
                  type="text"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Save As
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddressTypeChange('home')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-300 ${
                      formData.addressType === 'home'
                        ? 'bg-palette-orange text-white border-palette-orange'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-palette-orange'
                    }`}
                  >
                    <Home className="w-4 h-4 mx-auto" />
                    <span className="text-sm mt-1 block">Home</span>
                  </button>
                  <button
                    onClick={() => handleAddressTypeChange('work')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-300 ${
                      formData.addressType === 'work'
                        ? 'bg-palette-orange text-white border-palette-orange'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-palette-orange'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mx-auto" />
                    <span className="text-sm mt-1 block">Work</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <AnimatedButton
            onClick={handleSave}
            loading={isLoading}
            disabled={!formData.address.trim()}
            className="w-full bg-palette-orange hover:bg-palette-orange/90 text-white py-3"
            size="lg"
          >
            Save
          </AnimatedButton>
        </div>
      </div>
    </ModernModal>
  );
};

export default AddAddressModal;
