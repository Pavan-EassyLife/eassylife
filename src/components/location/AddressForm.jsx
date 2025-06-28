import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, Briefcase, User, Check, AlertCircle, Map, Eye, EyeOff } from 'lucide-react';
import { FloatingLabelInput } from '../ui/floating-label-input';
import { FloatingLabelSelect } from '../ui/floating-label-select';
import { AnimatedButton } from '../ui/animated-button';
import { useToast } from '../ui/toast';
import AddressMapView from './AddressMapView';

/**
 * Comprehensive Address Form Component
 * Implements Flutter app's address form with validation and type selection
 */
const AddressForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    flatNo: '',
    buildingName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'home',
    isPrimary: false,
    latitude: null,
    longitude: null,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showMapPreview, setShowMapPreview] = useState(false);

  const { showError } = useToast();

  // Address type options
  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Briefcase },
    { value: 'other', label: 'Other', icon: User }
  ];

  // Indian states for dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  /**
   * Validation rules (Flutter-aligned)
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'flatNo':
        return !value.trim() ? 'Flat/House number is required' : '';

      case 'buildingName':
        return !value.trim() ? 'Building name is required' : '';

      case 'streetAddress':
        return !value.trim() ? 'Street address is required' : '';

      case 'city':
        return !value.trim() ? 'City is required' : '';

      case 'state':
        return !value.trim() ? 'State is required' : '';

      case 'postalCode':
        if (!value.trim()) return 'Postal code is required';
        if (!/^\d{6}$/.test(value)) return 'Please enter a valid 6-digit postal code';
        return '';

      default:
        return '';
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle input blur (validation)
   */
  const handleInputBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const requiredFields = ['flatNo', 'buildingName', 'streetAddress', 'city', 'state', 'postalCode'];
    const newErrors = {};

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    // Format data for API (Flutter-aligned)
    const addressData = {
      flatNo: formData.flatNo.trim(),
      buildingName: formData.buildingName.trim(),
      streetAddress: formData.streetAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country,
      addressType: formData.addressType,
      isPrimary: formData.isPrimary ? 1 : 0,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    onSubmit(addressData);
  };

  /**
   * Check if address has valid coordinates for map display
   */
  const hasValidCoordinates = () => {
    return formData.latitude && formData.longitude &&
           !isNaN(parseFloat(formData.latitude)) && !isNaN(parseFloat(formData.longitude));
  };

  /**
   * Create address object for map display
   */
  const getAddressForMap = () => {
    if (!hasValidCoordinates()) return [];

    return [{
      id: 'preview',
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      address_type: formData.addressType,
      is_primary: formData.isPrimary ? 1 : 0,
      flat_no: formData.flatNo,
      building_name: formData.buildingName,
      street_address: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode
    }];
  };

  /**
   * Update form data when initialData changes
   */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));

      // Auto-show map preview if coordinates are available
      if (initialData.latitude && initialData.longitude) {
        setShowMapPreview(true);
      }
    }
  }, [initialData]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Address Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Address Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {addressTypes.map(({ value, label, icon: Icon }) => (
            <motion.button
              key={value}
              type="button"
              onClick={() => handleInputChange('addressType', value)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                formData.addressType === value
                  ? 'border-palette-orange bg-palette-orange bg-opacity-10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                formData.addressType === value ? 'text-palette-orange' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                formData.addressType === value ? 'text-palette-orange' : 'text-gray-600'
              }`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Address Fields Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Flat/House Number"
          value={formData.flatNo}
          onChange={(e) => handleInputChange('flatNo', e.target.value)}
          onBlur={() => handleInputBlur('flatNo')}
          error={touched.flatNo ? errors.flatNo : ''}
          required
          placeholder="e.g., 101, A-23"
        />

        <FloatingLabelInput
          label="Building Name"
          value={formData.buildingName}
          onChange={(e) => handleInputChange('buildingName', e.target.value)}
          onBlur={() => handleInputBlur('buildingName')}
          error={touched.buildingName ? errors.buildingName : ''}
          required
          placeholder="e.g., Sunrise Apartments"
        />
      </div>

      {/* Street Address */}
      <FloatingLabelInput
        label="Street Address"
        value={formData.streetAddress}
        onChange={(e) => handleInputChange('streetAddress', e.target.value)}
        onBlur={() => handleInputBlur('streetAddress')}
        error={touched.streetAddress ? errors.streetAddress : ''}
        required
        placeholder="e.g., Sector 18, Near Metro Station"
      />

      {/* Address Fields Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="City"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          onBlur={() => handleInputBlur('city')}
          error={touched.city ? errors.city : ''}
          required
          placeholder="e.g., New Delhi"
        />

        <FloatingLabelSelect
          label="State"
          value={formData.state}
          onChange={(value) => handleInputChange('state', value)}
          onBlur={() => handleInputBlur('state')}
          error={touched.state ? errors.state : ''}
          required
          options={indianStates.map(state => ({ value: state, label: state }))}
          placeholder="Select State"
        />
      </div>

      {/* Postal Code and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Postal Code"
          value={formData.postalCode}
          onChange={(e) => handleInputChange('postalCode', e.target.value)}
          onBlur={() => handleInputBlur('postalCode')}
          error={touched.postalCode ? errors.postalCode : ''}
          required
          placeholder="e.g., 110001"
          maxLength={6}
          pattern="[0-9]{6}"
        />

        <FloatingLabelInput
          label="Country"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          disabled
          placeholder="India"
        />
      </div>

      {/* Set as Primary Address */}
      <motion.div
        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
        whileHover={{ backgroundColor: 'rgba(255, 163, 1, 0.05)' }}
      >
        <button
          type="button"
          onClick={() => handleInputChange('isPrimary', !formData.isPrimary)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
            formData.isPrimary
              ? 'bg-palette-orange border-palette-orange'
              : 'border-gray-300 hover:border-palette-orange'
          }`}
        >
          {formData.isPrimary && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Set as primary address</p>
          <p className="text-xs text-gray-600">This will be your default delivery address</p>
        </div>
      </motion.div>

      {/* Map Preview Section */}
      {hasValidCoordinates() && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {/* Map Preview Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Location Available</p>
                <p className="text-xs text-blue-700">
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            <AnimatedButton
              type="button"
              onClick={() => setShowMapPreview(!showMapPreview)}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {showMapPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Map
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View on Map
                </>
              )}
            </AnimatedButton>
          </div>

          {/* Map Preview */}
          <AnimatePresence>
            {showMapPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-lg"
              >
                <AddressMapView
                  addresses={getAddressForMap()}
                  selectedAddressId="preview"
                  height="250px"
                  zoom={16}
                  showControls={true}
                  interactive={false}
                  className="border border-gray-200"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Coordinates Display (fallback for no map) */}
      {formData.latitude && formData.longitude && !hasValidCoordinates() && (
        <motion.div
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Invalid Coordinates</span>
          </div>
          <p className="text-xs text-yellow-700">
            Please check the coordinate values: {formData.latitude}, {formData.longitude}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <AnimatedButton
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="flex-1"
        >
          <Check className="w-5 h-5 mr-2" />
          {mode === 'edit' ? 'Update Address' : 'Save Address'}
        </AnimatedButton>

        <AnimatedButton
          type="button"
          onClick={onCancel}
          variant="outline"
          size="lg"
          className="px-8"
        >
          Cancel
        </AnimatedButton>
      </div>
    </motion.form>
  );
};

export default AddressForm;
