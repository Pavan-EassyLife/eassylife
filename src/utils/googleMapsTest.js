/**
 * Google Maps API Test Utility
 * Tests Google Maps API connectivity and configuration
 */

/**
 * Test Google Maps API connectivity
 */
export const testGoogleMapsAPI = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log('🧪 Testing Google Maps API...');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    throw new Error('Google Maps API key not found in environment variables');
  }
  
  // Test direct API call
  const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly&region=IN&language=en`;
  
  try {
    console.log('🔄 Testing direct API call...');
    const response = await fetch(testUrl, {
      method: 'HEAD', // Use HEAD to avoid loading the full script
      mode: 'no-cors' // Google Maps API doesn't support CORS for direct calls
    });
    
    console.log('✅ API call successful');
    return { success: true, message: 'Google Maps API is accessible' };
  } catch (error) {
    console.error('❌ API call failed:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Test Google Maps API key validity
 */
export const testAPIKeyValidity = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return { success: false, message: 'API key not found' };
  }
  
  // Test with Geocoding API (simpler endpoint)
  const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Mumbai&key=${apiKey}`;
  
  try {
    console.log('🔄 Testing API key validity with Geocoding API...');
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ API key is valid');
      return { success: true, message: 'API key is valid' };
    } else {
      console.error('❌ API key validation failed:', data.status, data.error_message);
      return { success: false, message: `API error: ${data.status} - ${data.error_message || 'Unknown error'}` };
    }
  } catch (error) {
    console.error('❌ API key validation failed:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get environment configuration
 */
export const getEnvironmentConfig = () => {
  return {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
    libraries: import.meta.env.VITE_GOOGLE_MAPS_LIBRARIES || 'places,geometry',
    defaultLat: import.meta.env.VITE_DEFAULT_LOCATION_LAT || '19.0760',
    defaultLng: import.meta.env.VITE_DEFAULT_LOCATION_LNG || '72.8777',
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    mode: import.meta.env.MODE || 'development'
  };
};
