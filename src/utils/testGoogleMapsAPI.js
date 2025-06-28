/**
 * Test Google Maps API Key
 * This utility helps test if the Google Maps API key is working correctly
 */

export const testGoogleMapsAPI = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log('🔍 Testing Google Maps API...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
  
  if (!apiKey) {
    return {
      success: false,
      error: 'No API key found in environment variables'
    };
  }
  
  if (apiKey === 'your_google_maps_api_key_here') {
    return {
      success: false,
      error: 'API key is still set to placeholder value'
    };
  }
  
  try {
    // Test 1: Try to load the Google Maps JavaScript API
    const { Loader } = await import('@googlemaps/js-api-loader');
    
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      region: 'IN',
      language: 'en',
    });
    
    console.log('🔄 Loading Google Maps API...');
    const google = await loader.load();
    console.log('✅ Google Maps API loaded successfully');
    
    // Test 2: Try to create a simple geocoder instance
    const geocoder = new google.maps.Geocoder();
    console.log('✅ Geocoder created successfully');
    
    // Test 3: Try a simple geocoding request
    const testLocation = { lat: 19.0760, lng: 72.8777 }; // Mumbai
    
    return new Promise((resolve) => {
      geocoder.geocode({ location: testLocation }, (results, status) => {
        if (status === 'OK') {
          console.log('✅ Geocoding test successful');
          console.log('📍 Test result:', results[0]?.formatted_address);
          resolve({
            success: true,
            message: 'Google Maps API is working correctly',
            testAddress: results[0]?.formatted_address
          });
        } else {
          console.error('❌ Geocoding test failed:', status);
          resolve({
            success: false,
            error: `Geocoding failed with status: ${status}`,
            details: 'API key might not have Geocoding API enabled'
          });
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Google Maps API test failed:', error);
    
    let errorMessage = 'Failed to load Google Maps API';
    let details = error.message;
    
    if (error.message.includes('InvalidKeyMapError')) {
      errorMessage = 'Invalid API key';
      details = 'The API key is invalid or has restrictions that prevent it from being used on this domain';
    } else if (error.message.includes('ApiNotActivatedMapError')) {
      errorMessage = 'API not activated';
      details = 'The Maps JavaScript API is not activated for this API key';
    } else if (error.message.includes('QuotaExceededError')) {
      errorMessage = 'Quota exceeded';
      details = 'The API key has exceeded its quota limit';
    } else if (error.message.includes('RequestDeniedMapError')) {
      errorMessage = 'Request denied';
      details = 'The API key is not authorized for this application';
    }
    
    return {
      success: false,
      error: errorMessage,
      details,
      originalError: error.message
    };
  }
};

// Test function that can be called from browser console
window.testGoogleMapsAPI = testGoogleMapsAPI;

export default testGoogleMapsAPI;
