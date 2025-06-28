import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from './config.js';
import { getAuthToken } from '../utils/tokenManager.js';

// Debug: API call counter for infinite re-render detection
let apiCallCount = 0;
const apiCallTimes = [];

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Debug: Track API calls for infinite re-render detection
    apiCallCount++;
    const now = Date.now();
    apiCallTimes.push(now);

    // Keep only last 20 calls for frequency calculation
    if (apiCallTimes.length > 20) {
      apiCallTimes.splice(0, apiCallTimes.length - 20);
    }

    // Calculate frequency
    let frequency = 0;
    if (apiCallTimes.length > 1) {
      const timeSpan = apiCallTimes[apiCallTimes.length - 1] - apiCallTimes[0];
      frequency = ((apiCallTimes.length - 1) / timeSpan) * 1000; // calls per second
    }

    // Add auth token if available with enhanced debugging
    const token = getAuthToken();

    if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
      console.log('🔍 Token Check in Interceptor:', {
        tokenExists: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO_TOKEN',
        requestURL: `${config.baseURL}${config.url}`,
        method: config.method?.toUpperCase()
      });
    }

    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {};
      }

      // Use api-token header format (matching Flutter app implementation)
      config.headers['api-token'] = token;


    }

    // Log request in development (Vite environment check)
    if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
      console.log(`🌐 API Request #${apiCallCount}`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        frequency: `${frequency.toFixed(2)} calls/sec`,
        headers: {
          'api-token': config.headers['api-token'] ? '***TOKEN_PRESENT***' : 'NO_TOKEN',
          'Content-Type': config.headers['Content-Type']
        },
        data: config.data,
        timeout: config.timeout,
        timestamp: new Date().toISOString()
      });

      // Warning for high frequency (potential infinite re-renders)
      if (frequency > 2) {
        console.warn('⚠️ HIGH API CALL FREQUENCY DETECTED!', {
          frequency: `${frequency.toFixed(2)} calls/sec`,
          totalCalls: apiCallCount,
          recentCalls: apiCallTimes.length,
          url: config.url
        });
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development (Vite environment check)
    if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        fullURL: `${response.config.baseURL}${response.config.url}`,
        data: response.data,
        headers: response.headers,
        timestamp: new Date().toISOString()
      });
    }

    return response;
  },
  (error) => {
    // Enhanced error logging for debugging
    if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
      console.error('❌ API Error Details:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        requestHeaders: {
          Authorization: error.config?.headers?.Authorization ? '***TOKEN_PRESENT***' : 'NO_TOKEN'
        }
      });
    }

    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - enhanced error message
          error.message = `Access denied. ${data?.message || 'No token provided or token expired.'}`;
          break;
        case 403:
          // Forbidden
          error.message = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          // Not found
          error.message = 'The requested resource was not found.';
          break;
        case 429:
          // Too many requests
          error.message = 'Too many requests. Please try again later.';
          break;
        case 500:
          // Server error
          error.message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          // Use server message if available
          error.message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
      }
    } else if (error.request) {
      // Network error - enhanced debugging
      console.error('🌐 Network Error Details:', {
        request: error.request,
        config: error.config,
        code: error.code,
        message: error.message
      });
      error.message = `${ERROR_MESSAGES.NETWORK_ERROR} (${error.code || 'NETWORK_ERROR'})`;
    } else {
      // Other error
      console.error('🔧 Request Setup Error:', error.message);
      error.message = ERROR_MESSAGES.SERVER_ERROR;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
