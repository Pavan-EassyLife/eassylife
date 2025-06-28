// API Configuration based on Flutter app structure and environment variables

/**
 * Get the appropriate API base URL based on the current environment
 * @returns {string} The complete API base URL
 */
const getBaseUrl = () => {
  const environment = import.meta.env.VITE_APP_ENV || 'development';

  let baseUrl;
  switch (environment) {
    case 'production':
      baseUrl = import.meta.env.VITE_API_BASE_URL_PRODUCTION || 'https://app.eassylife.in';
      break;
    case 'staging':
      baseUrl = import.meta.env.VITE_API_BASE_URL_STAGING || 'https://dev.eassylife.in';
      break;
    case 'development':
    default:
      baseUrl = import.meta.env.VITE_API_BASE_URL_LOCAL || 'https://dev.eassylife.in';
      break;
  }

  const middlePath = import.meta.env.VITE_API_MIDDLE_PATH || 'api/customer';
  const version = import.meta.env.VITE_API_VERSION || 'v2.0.0';

  // Handle empty version (for Flutter compatibility)
  const fullUrl = version
    ? `${baseUrl}/${middlePath}/${version}/`
    : `${baseUrl}/${middlePath}/`;

  // Debug: Log the constructed URL in development
  if (import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV) {
    console.log('🔧 API Configuration:', {
      environment,
      baseUrl,
      middlePath,
      version,
      fullUrl,
      envVars: {
        VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
        VITE_API_BASE_URL_LOCAL: import.meta.env.VITE_API_BASE_URL_LOCAL,
        VITE_API_VERSION: import.meta.env.VITE_API_VERSION
      }
    });
  }

  return fullUrl;
};

/**
 * API Configuration object with environment-based settings
 */
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: 'login',
  VERIFY_OTP: 'verify-otp',
  RESEND_OTP: 'resend-otp',
  REGISTER: 'register',
  GUEST_LOGIN: 'guest',
  PROFILE: 'profile',
  DEACTIVATE_ACCOUNT: 'deactivate-account',

  // User Profile & Settings
  SETTINGS: 'settings',
  UPDATE_PROFILE: 'profile',
  UPLOAD_PROFILE_IMAGE: 'profile',

  // Address endpoints
  USER_ADDRESSES: 'user/addresses',
  ADD_ADDRESS: 'user/addresses',
  UPDATE_ADDRESS: (id) => `user/addresses/${id}`,
  DELETE_ADDRESS: (id) => `user/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id) => `user/addresses/${id}/set-default`,

  // Analytics & Tracking
  CAMPAIGN_TRACK: 'campaign/campaign-track',

  // Wallet
  WALLET_HISTORY: 'wallet/history',

  // Notifications
  UPDATE_NOTIFICATION_PREFERENCE: 'notifications/update-preference',

  // Home Page APIs (Flutter-aligned)
  HOME_PAGE: 'home-page',
  BANNERS: 'banner',
  ALL_PACKAGES: 'package',
  ALL_SERVICES: 'categories', // Using categories as services
  QUICK_SERVICES: 'home-quick-services',
  MOST_BOOKED_SERVICES: 'most-popular-category',

  // Service Details APIs (Flutter-aligned)
  SERVICE_DETAILS: 'categories', // Flutter: serviceDetailURL = 'categories/'
  SUB_SERVICE_DETAILS: 'sub-category', // Flutter: subServicesDetailURL = 'sub-category/'
  SERVICE_DETAILS_BY_SEGMENT: 'service-details', // Flutter: aboutServiceDetailURL = 'service-details'

  // Booking & Service APIs
  CHECK_COMPLETED_BOOKING: 'bookings/check-completed',
  CHECK_PARTIAL_PAYMENT_BOOKING: 'bookings/check-partial-payment',

  // Order/Booking Management APIs
  GET_ORDERS_BY_STATUS: 'bookings/status',
  GET_ORDER_DETAIL: (orderId, itemId) => `bookings/${orderId}/${itemId}`,
  CANCEL_ORDER: 'bookings/cancel',
  RESCHEDULE_ORDER: 'bookings/reschedule',
  GET_PAYMENT_DETAILS: 'bookings/payment',
  PARTIAL_PAYMENT: 'bookings/payment', // Flutter: bookingPayNowURL
  SUBMIT_FEEDBACK: 'booking-experience',
  REPORT_ISSUE: 'booking-experience',

  // Search API
  SEARCH: 'search',

  // Favorites API
  FAVORITES: 'favourites',
  ADD_FAVORITE: 'favourites',
  REMOVE_FAVORITE: (id) => `favourites/${id}`,

  // Service Provider APIs (Flutter-aligned)
  GET_SERVICE_PROVIDERS: 'providers/services', // Flutter: getServiceProvidersURL = 'providers/services?'

  // Cart APIs
  GET_CART: 'cart',
  ADD_TO_CART: 'cart',
  REMOVE_FROM_CART: 'cart',
  UPDATE_CART_DATE: 'cart/date-change',
  UPDATE_CART_ADDRESS: 'cart/address-change',
  APPLY_COUPON: 'promo-codes/apply',
  AVAILABLE_COUPONS: 'promo-codes',
  CHECK_CART_AVAILABILITY: 'cart/check-availability',
  CHECKOUT: 'bookings', // Checkout creates a booking
  VIP_PLANS: 'vip-plans',
  DONATION_DATA: 'donation',
  FREQUENTLY_ADDED_SERVICES: 'most-popular-category',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number.',
  INVALID_OTP: `Please enter a valid ${import.meta.env.VITE_OTP_LENGTH || 6}-digit OTP.`,
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  MAX_ATTEMPTS: `Maximum attempts reached. Please try again later.`,
  SERVER_ERROR: 'Something went wrong. Please try again.',
  VALIDATION_ERROR: 'Please fill in all required fields correctly.',
  USER_EXISTS: 'User with this mobile number already exists.',
  USER_NOT_FOUND: 'User not found. Please register first.',
  DEVICE_LIMIT: 'Maximum device limit reached. Only 5 devices are allowed per user.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully to your mobile number.',
  OTP_VERIFIED: 'OTP verified successfully.',
  REGISTRATION_SUCCESS: 'Registration completed successfully.',
  LOGIN_SUCCESS: 'Login successful.',
};
