import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

class AddressService {
  // Get all user addresses (Flutter-aligned method name)
  async getAddresses() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_ADDRESSES);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data || [],
      };
    } catch (error) {
      console.error('Get addresses error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch addresses');
    }
  }

  // Alias for backward compatibility
  async getUserAddresses() {
    return this.getAddresses();
  }

  // Save a new address
  async saveAddress(addressData) {
    try {
      const payload = {
        flat_no: addressData.flat_no || addressData.flatNo || '',
        building_name: addressData.building_name || addressData.buildingName || '',
        street_address: addressData.street_address || addressData.streetAddress || addressData.address || '',
        city: addressData.city || '',
        state: addressData.state || '',
        postal_code: addressData.postal_code || addressData.postalCode || '',
        country: addressData.country || 'India',
        address_type: addressData.address_type || addressData.addressType || 'home',
        latitude: addressData.latitude || null,
        longitude: addressData.longitude || null,
        is_primary: addressData.is_primary || addressData.isPrimary || 1, // Set as primary by default
      };

      const response = await axiosInstance.post(API_ENDPOINTS.ADD_ADDRESS, payload);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Save address error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to save address');
    }
  }

  // Alias for backward compatibility
  async addAddress(addressData) {
    return this.saveAddress(addressData);
  }

  // Update an existing address
  async updateAddress(addressId, addressData) {
    try {
      const payload = {
        flat_no: addressData.flatNo || '',
        building_name: addressData.buildingName || '',
        street_address: addressData.streetAddress || addressData.address || '',
        city: addressData.city || '',
        state: addressData.state || '',
        postal_code: addressData.postalCode || '',
        country: addressData.country || 'India',
        address_type: addressData.addressType || 'home',
        latitude: addressData.latitude || null,
        longitude: addressData.longitude || null,
        is_primary: addressData.isPrimary || 0,
      };

      const response = await axiosInstance.put(`/user/addresses/${addressId}`, payload);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Update address error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update address');
    }
  }

  // Delete an address
  async deleteAddress(addressId) {
    try {
      const response = await axiosInstance.delete(`/user/addresses/${addressId}`);

      return {
        success: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Delete address error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete address');
    }
  }

  // Set an address as default/primary
  async setDefaultAddress(addressId) {
    try {
      const response = await axiosInstance.put(`/user/addresses/${addressId}/set-default`);

      return {
        success: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Set default address error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to set default address');
    }
  }

  // Set address as primary (Flutter-aligned method name)
  async setAsPrimary(addressId) {
    try {
      console.log('🎯 AddressService: Setting address as primary:', addressId);

      // Use the same endpoint as setDefaultAddress but with Flutter-aligned naming
      const response = await axiosInstance.put(`/user/addresses/${addressId}/set-default`);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Set as primary address error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to set address as primary');
    }
  }

  // Parse address string into components (helper method)
  parseAddressString(addressString) {
    // Basic address parsing - can be enhanced based on requirements
    const parts = addressString.split(',').map(part => part.trim());

    return {
      streetAddress: parts[0] || '',
      city: parts[parts.length - 3] || '',
      state: parts[parts.length - 2] || '',
      postalCode: parts[parts.length - 1] || '',
      country: 'India'
    };
  }

  // Save location from GPS modal (Enhanced Flutter-aligned)
  async saveLocationFromGPS(locationData) {
    try {
      console.log('🚀 AddressService: Saving GPS location with Flutter-aligned approach:', locationData);

      // Enhanced address parsing with Flutter-style components
      let addressComponents = {};
      if (typeof locationData.address === 'string') {
        addressComponents = this.parseAddressString(locationData.address);
      } else if (locationData.addressComponents) {
        // Use enhanced address components if available
        addressComponents = {
          streetAddress: locationData.addressComponents.streetAddress || '',
          city: locationData.addressComponents.city || '',
          state: locationData.addressComponents.state || '',
          postalCode: locationData.addressComponents.postalCode || '',
          country: locationData.addressComponents.country || 'India',
          subLocality: locationData.addressComponents.subLocality || ''
        };
      }

      // Flutter-aligned GPS location payload
      const addressPayload = {
        flat_no: '', // Empty for GPS location
        building_name: '', // Empty for GPS location
        street_address: locationData.address || `${locationData.latitude}, ${locationData.longitude}`,
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        postal_code: addressComponents.postalCode || '',
        country: addressComponents.country || 'India',
        address_type: 'home', // Default to home
        latitude: locationData.latitude?.toString(),
        longitude: locationData.longitude?.toString(),
        is_primary: 1, // First address is primary
        source: 'gps', // Mark as GPS source
        accuracy: locationData.accuracy?.toString(),
        timestamp: locationData.timestamp || new Date().toISOString()
      };

      console.log('📍 AddressService: GPS location payload:', addressPayload);
      return await this.saveAddress(addressPayload);
    } catch (error) {
      console.error('❌ Save GPS location error:', error);
      throw error;
    }
  }

  // Find primary address from address list (Flutter-aligned)
  findPrimaryAddress(addresses) {
    if (!addresses || !Array.isArray(addresses)) {
      return null;
    }

    // Exact Flutter pattern: element.isPrimary.toString() == '1'
    return addresses.find(address => {
      const isPrimaryValue = address.isPrimary ?? address.is_primary;
      return isPrimaryValue?.toString() === '1';
    });
  }

  // Format address for display (Flutter-aligned)
  formatAddressForDisplay(address) {
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
  }

  // Get and set primary address (Flutter-aligned method)
  async getAndSetPrimaryAddress() {
    try {
      const result = await this.getAddresses();

      if (result.success && result.data) {
        const primaryAddress = this.findPrimaryAddress(result.data);

        if (primaryAddress) {
          // Store in global state or context
          const formattedAddress = this.formatAddressForDisplay(primaryAddress);

          return {
            success: true,
            primaryAddress,
            formattedAddress,
            data: result.data
          };
        }
      }

      return {
        success: true,
        primaryAddress: null,
        formattedAddress: null,
        data: result.data || []
      };
    } catch (error) {
      console.error('Get and set primary address error:', error);
      throw error;
    }
  }
}

export default new AddressService();
