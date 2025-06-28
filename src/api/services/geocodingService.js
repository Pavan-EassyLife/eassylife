import { Loader } from '@googlemaps/js-api-loader';

/**
 * Enhanced Geocoding Service for React Frontend
 * Implements Flutter app's geocoding functionality using Google Maps API
 * Provides reverse geocoding, place search, and address parsing
 */
class GeocodingService {
  constructor() {
    this.googleMapsLoader = null;
    this.geocoder = null;
    this.placesService = null;
    this.autocompleteService = null;
    this.isInitialized = false;

    // Google Maps API configuration
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.libraries = ['places', 'geometry'];

    // Fallback to OpenStreetMap if Google Maps API key is not available
    this.useGoogleMaps = !!this.apiKey;
  }

  /**
   * Initialize Google Maps API
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    if (!this.useGoogleMaps) {
      console.warn('Google Maps API key not found, using OpenStreetMap fallback');
      this.isInitialized = true;
      return true;
    }

    try {
      console.log('🔄 GeocodingService: Initializing with API key:', this.apiKey ? 'Present' : 'Missing');

      this.googleMapsLoader = new Loader({
        apiKey: this.apiKey,
        version: 'weekly',
        libraries: this.libraries,
        // Add additional configuration for better reliability
        region: 'IN', // Set region to India for better performance
        language: 'en',
      });

      console.log('🔄 GeocodingService: Loading Google Maps API...');
      const google = await this.googleMapsLoader.load();
      console.log('✅ GeocodingService: Google Maps API loaded successfully');

      this.geocoder = new google.maps.Geocoder();
      this.autocompleteService = new google.maps.places.AutocompleteService();

      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(dummyDiv);

      this.isInitialized = true;
      console.log('✅ Google Maps API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps API:', error);
      this.useGoogleMaps = false;
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Reverse geocoding - Convert coordinates to address
   * Implements Flutter's getAddressFromCoordinates method
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Address details
   */
  async getAddressFromCoordinates(latitude, longitude) {
    await this.initialize();

    if (this.useGoogleMaps && this.geocoder) {
      return this.googleReverseGeocode(latitude, longitude);
    } else {
      return this.openStreetMapReverseGeocode(latitude, longitude);
    }
  }

  /**
   * Google Maps reverse geocoding
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Address details
   */
  async googleReverseGeocode(latitude, longitude) {
    try {
      const response = await new Promise((resolve, reject) => {
        this.geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      const result = response[0];
      const addressComponents = this.parseGoogleAddressComponents(result.address_components);

      return {
        success: true,
        formattedAddress: result.formatted_address,
        ...addressComponents,
        coordinates: {
          latitude,
          longitude
        }
      };
    } catch (error) {
      console.error('Google reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * OpenStreetMap reverse geocoding (fallback)
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Address details
   */
  async openStreetMapReverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('OpenStreetMap geocoding service unavailable');
      }

      const data = await response.json();

      if (!data || !data.display_name) {
        throw new Error('No address found');
      }

      const addressComponents = this.parseOpenStreetMapAddress(data);

      return {
        success: true,
        formattedAddress: data.display_name,
        ...addressComponents,
        coordinates: {
          latitude,
          longitude
        }
      };
    } catch (error) {
      console.error('OpenStreetMap reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Parse Google Maps address components
   * Implements Flutter's address component parsing logic (Enhanced)
   * @param {Array} components
   * @returns {Object} Parsed address components
   */
  parseGoogleAddressComponents(components) {
    const addressData = {
      streetNumber: '',
      route: '',
      subLocality: '',
      subLocalityLevel1: '',
      subLocalityLevel2: '',
      locality: '',
      administrativeAreaLevel1: '',
      administrativeAreaLevel2: '',
      country: '',
      postalCode: '',
      premise: '',
      establishment: ''
    };

    components.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        addressData.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        addressData.route = component.long_name;
      } else if (types.includes('premise')) {
        addressData.premise = component.long_name;
      } else if (types.includes('establishment')) {
        addressData.establishment = component.long_name;
      } else if (types.includes('sublocality_level_1')) {
        addressData.subLocalityLevel1 = component.long_name;
        if (!addressData.subLocality) addressData.subLocality = component.long_name;
      } else if (types.includes('sublocality_level_2')) {
        addressData.subLocalityLevel2 = component.long_name;
      } else if (types.includes('sublocality')) {
        addressData.subLocality = component.long_name;
      } else if (types.includes('locality')) {
        addressData.locality = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        addressData.administrativeAreaLevel1 = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        addressData.administrativeAreaLevel2 = component.long_name;
      } else if (types.includes('country')) {
        addressData.country = component.long_name;
      } else if (types.includes('postal_code')) {
        addressData.postalCode = component.long_name;
      }
    });

    // Flutter-aligned address formatting
    // Format: "street, subLocality, locality, administrativeArea, country"
    const streetParts = [addressData.streetNumber, addressData.route].filter(Boolean);
    const street = streetParts.join(' ').trim();

    const addressParts = [
      street,
      addressData.subLocality || addressData.subLocalityLevel1,
      addressData.locality,
      addressData.administrativeAreaLevel1,
      addressData.country
    ].filter(Boolean);

    return {
      // Individual components
      streetAddress: street,
      subLocality: addressData.subLocality || addressData.subLocalityLevel1,
      city: addressData.locality,
      state: addressData.administrativeAreaLevel1,
      country: addressData.country,
      postalCode: addressData.postalCode,

      // Flutter-style formatted address
      flutterFormattedAddress: addressParts.join(', '),

      // Additional components for detailed parsing
      streetNumber: addressData.streetNumber,
      route: addressData.route,
      premise: addressData.premise,
      establishment: addressData.establishment,
      subLocalityLevel1: addressData.subLocalityLevel1,
      subLocalityLevel2: addressData.subLocalityLevel2,
      administrativeAreaLevel2: addressData.administrativeAreaLevel2
    };
  }

  /**
   * Parse OpenStreetMap address data
   * @param {Object} data
   * @returns {Object} Parsed address components
   */
  parseOpenStreetMapAddress(data) {
    const address = data.address || {};

    return {
      streetAddress: `${address.house_number || ''} ${address.road || ''}`.trim(),
      subLocality: address.suburb || address.neighbourhood || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      country: address.country || '',
      postalCode: address.postcode || ''
    };
  }

  /**
   * Get place predictions for autocomplete
   * Implements Flutter's Google Places autocomplete functionality
   * @param {string} input
   * @param {Object} options
   * @returns {Promise<Array>} Place predictions
   */
  async getPlacePredictions(input, options = {}) {
    await this.initialize();

    // Try Google Maps API first
    if (this.useGoogleMaps && this.autocompleteService) {
      try {
        return await this.getGooglePlacePredictions(input, options);
      } catch (error) {
        console.warn('Google Places API failed, trying backend fallback:', error);
        return await this.getBackendPlacePredictions(input, options);
      }
    } else {
      console.log('Using backend API for places search');
      return await this.getBackendPlacePredictions(input, options);
    }
  }

  /**
   * Get place predictions using Google Maps API directly
   */
  async getGooglePlacePredictions(input, options = {}) {

    const defaultOptions = {
      input,
      componentRestrictions: { country: 'in' }, // Restrict to India
      types: ['address'],
      ...options
    };

    try {
      const predictions = await new Promise((resolve, reject) => {
        this.autocompleteService.getPlacePredictions(
          defaultOptions,
          (predictions, status) => {
            if (status === 'OK' && predictions) {
              resolve(predictions);
            } else if (status === 'ZERO_RESULTS') {
              resolve([]);
            } else {
              reject(new Error(`Places API error: ${status}`));
            }
          }
        );
      });

      const formattedPredictions = predictions.map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting?.main_text || '',
        secondaryText: prediction.structured_formatting?.secondary_text || '',
        types: prediction.types
      }));


      return formattedPredictions;
    } catch (error) {
      console.error('Google Places autocomplete error:', error);
      throw error;
    }
  }

  /**
   * Get place predictions using backend API (fallback)
   */
  async getBackendPlacePredictions(input) {
    try {


      // Use a simple HTTP request to Google Places API via backend or direct
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}&components=country:in&types=address`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        const formattedPredictions = data.predictions.map(prediction => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting?.main_text || '',
          secondaryText: prediction.structured_formatting?.secondary_text || '',
          types: prediction.types
        }));


        return formattedPredictions;
      } else if (data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        throw new Error(`Backend Places API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Backend Places API error:', error);
      throw error;
    }
  }

  /**
   * Get place details by place ID
   * @param {string} placeId
   * @returns {Promise<Object>} Place details with coordinates
   */
  async getPlaceDetails(placeId) {
    await this.initialize();

    // Try Google Maps API first
    if (this.useGoogleMaps && this.placesService) {
      try {
        return await this.getGooglePlaceDetails(placeId);
      } catch (error) {
        console.warn('Google Place Details API failed, trying backend fallback:', error);
        return await this.getBackendPlaceDetails(placeId);
      }
    } else {
      console.log('Using backend API for place details');
      return await this.getBackendPlaceDetails(placeId);
    }
  }

  /**
   * Get place details using Google Maps API directly
   */
  async getGooglePlaceDetails(placeId) {

    try {
      const place = await new Promise((resolve, reject) => {
        this.placesService.getDetails(
          {
            placeId,
            fields: ['geometry', 'formatted_address', 'address_components', 'name']
          },
          (place, status) => {
            if (status === 'OK' && place) {
              resolve(place);
            } else {
              reject(new Error(`Place details error: ${status}`));
            }
          }
        );
      });

      const location = place.geometry.location;
      const addressComponents = this.parseGoogleAddressComponents(place.address_components);

      return {
        success: true,
        placeId,
        name: place.name,
        formattedAddress: place.formatted_address,
        coordinates: {
          latitude: location.lat(),
          longitude: location.lng()
        },
        ...addressComponents
      };
    } catch (error) {
      console.error('Google Place details error:', error);
      throw error;
    }
  }

  /**
   * Get place details using backend API (fallback)
   */
  async getBackendPlaceDetails(placeId) {
    try {


      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}&fields=geometry,formatted_address,address_components,name`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        const location = place.geometry.location;
        const addressComponents = this.parseGoogleAddressComponents(place.address_components);

        return {
          success: true,
          placeId,
          name: place.name,
          formattedAddress: place.formatted_address,
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          ...addressComponents
        };
      } else {
        throw new Error(`Backend Place Details API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Backend Place Details API error:', error);
      throw error;
    }
  }

  /**
   * Search addresses using Google Places Autocomplete
   * Wrapper method for AddressSearchBox component
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchAddresses(query, options = {}) {
    try {
      console.log('🔍 GeocodingService: Searching addresses for:', query);

      const predictions = await this.getPlacePredictions(query, {
        types: ['address'],
        componentRestrictions: { country: 'in' },
        ...options
      });

      return {
        success: true,
        predictions: predictions.map(prediction => ({
          place_id: prediction.placeId,
          description: prediction.description,
          main_text: prediction.mainText,
          secondary_text: prediction.secondaryText,
          types: prediction.types
        }))
      };
    } catch (error) {
      console.error('❌ GeocodingService: Address search error:', error);
      return {
        success: false,
        error: error.message,
        predictions: []
      };
    }
  }

  /**
   * Check if Google Maps API is available
   * @returns {boolean}
   */
  isGoogleMapsAvailable() {
    return this.useGoogleMaps && this.isInitialized;
  }
}

export default new GeocodingService();
