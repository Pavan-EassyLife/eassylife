/**
 * Environment Variables Utility
 * 
 * This utility provides a centralized way to access environment variables
 * with proper type conversion and fallback values.
 */

/**
 * Get environment variable as string
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string}
 */
export const getEnvString = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

/**
 * Get environment variable as number
 * @param {string} key - Environment variable key
 * @param {number} defaultValue - Default value if not found
 * @returns {number}
 */
export const getEnvNumber = (key, defaultValue = 0) => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

/**
 * Get environment variable as boolean
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default value if not found
 * @returns {boolean}
 */
export const getEnvBoolean = (key, defaultValue = false) => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

/**
 * Get environment variable as array (comma-separated)
 * @param {string} key - Environment variable key
 * @param {string[]} defaultValue - Default value if not found
 * @returns {string[]}
 */
export const getEnvArray = (key, defaultValue = []) => {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  // Application Info
  NAME: getEnvString('VITE_APP_NAME', 'EassyLife'),
  VERSION: getEnvString('VITE_APP_VERSION', '1.0.0'),
  DESCRIPTION: getEnvString('VITE_APP_DESCRIPTION', 'AI-Powered E-Commerce Marketplace'),
  
  // Environment
  NODE_ENV: getEnvString('VITE_NODE_ENV', 'development'),
  APP_ENV: getEnvString('VITE_APP_ENV', 'development'),
  DEBUG: getEnvBoolean('VITE_DEBUG', true),
  VERBOSE_LOGGING: getEnvBoolean('VITE_VERBOSE_LOGGING', true),
  
  // Development
  DEV_SERVER_PORT: getEnvNumber('VITE_DEV_SERVER_PORT', 5173),
  DEV_SERVER_HOST: getEnvString('VITE_DEV_SERVER_HOST', 'localhost'),
  DEV_SERVER_OPEN: getEnvBoolean('VITE_DEV_SERVER_OPEN', true),
  HMR_ENABLED: getEnvBoolean('VITE_HMR_ENABLED', true),
  HMR_PORT: getEnvNumber('VITE_HMR_PORT', 24678),
};

/**
 * API Configuration
 */
export const API_ENV_CONFIG = {
  // Base URLs
  BASE_URL_PRODUCTION: getEnvString('VITE_API_BASE_URL_PRODUCTION', 'https://app.eassylife.in'),
  BASE_URL_STAGING: getEnvString('VITE_API_BASE_URL_STAGING', 'http://13.201.2.247:5001'),
  BASE_URL_LOCAL: getEnvString('VITE_API_BASE_URL_LOCAL', 'http://13.201.2.247:5001'),

  // API Path Configuration
  MIDDLE_PATH: getEnvString('VITE_API_MIDDLE_PATH', 'api/customer'),
  VERSION: getEnvString('VITE_API_VERSION', 'v2.0.0'),

  // API Settings
  TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 30000),
  RETRY_ATTEMPTS: getEnvNumber('VITE_API_RETRY_ATTEMPTS', 3),
  RETRY_DELAY: getEnvNumber('VITE_API_RETRY_DELAY', 1000),
};

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
  // Token Storage
  TOKEN_STORAGE_KEY: getEnvString('VITE_TOKEN_STORAGE_KEY', 'eassylife_auth_token'),
  REFRESH_TOKEN_KEY: getEnvString('VITE_REFRESH_TOKEN_KEY', 'eassylife_refresh_token'),
  USER_DATA_KEY: getEnvString('VITE_USER_DATA_KEY', 'eassylife_user_data'),
  
  // Session Settings
  SESSION_TIMEOUT: getEnvNumber('VITE_SESSION_TIMEOUT', 1800000), // 30 minutes
  AUTO_LOGOUT_WARNING: getEnvNumber('VITE_AUTO_LOGOUT_WARNING', 300000), // 5 minutes
  
  // OTP Configuration
  OTP_LENGTH: getEnvNumber('VITE_OTP_LENGTH', 6),
  OTP_RESEND_TIMEOUT: getEnvNumber('VITE_OTP_RESEND_TIMEOUT', 30),
  OTP_MAX_ATTEMPTS: getEnvNumber('VITE_OTP_MAX_ATTEMPTS', 3),
};

/**
 * UI/UX Configuration
 */
export const UI_CONFIG = {
  // Theme
  DEFAULT_THEME: getEnvString('VITE_DEFAULT_THEME', 'light'),
  ENABLE_DARK_MODE: getEnvBoolean('VITE_ENABLE_DARK_MODE', false),
  
  // Animations
  ENABLE_ANIMATIONS: getEnvBoolean('VITE_ENABLE_ANIMATIONS', true),
  ANIMATION_DURATION: getEnvNumber('VITE_ANIMATION_DURATION', 300),
  ENABLE_REDUCED_MOTION: getEnvBoolean('VITE_ENABLE_REDUCED_MOTION', false),
  
  // Layout
  SIDEBAR_DEFAULT_COLLAPSED: getEnvBoolean('VITE_SIDEBAR_DEFAULT_COLLAPSED', false),
  ENABLE_BREADCRUMBS: getEnvBoolean('VITE_ENABLE_BREADCRUMBS', true),
};

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  // Authentication Features
  ENABLE_GUEST_LOGIN: getEnvBoolean('VITE_ENABLE_GUEST_LOGIN', true),
  ENABLE_SOCIAL_LOGIN: getEnvBoolean('VITE_ENABLE_SOCIAL_LOGIN', false),
  ENABLE_BIOMETRIC_AUTH: getEnvBoolean('VITE_ENABLE_BIOMETRIC_AUTH', false),
  
  // Application Features
  ENABLE_NOTIFICATIONS: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
  ENABLE_OFFLINE_MODE: getEnvBoolean('VITE_ENABLE_OFFLINE_MODE', false),
  ENABLE_PWA: getEnvBoolean('VITE_ENABLE_PWA', true),
  ENABLE_ANALYTICS: getEnvBoolean('VITE_ENABLE_ANALYTICS', true),
  
  // Development Features
  ENABLE_DEV_TOOLS: getEnvBoolean('VITE_ENABLE_DEV_TOOLS', true),
  ENABLE_MOCK_API: getEnvBoolean('VITE_ENABLE_MOCK_API', false),
  ENABLE_ERROR_BOUNDARY: getEnvBoolean('VITE_ENABLE_ERROR_BOUNDARY', true),
};

/**
 * External Services Configuration
 */
export const EXTERNAL_CONFIG = {
  // CDN and Assets
  CDN_BASE_URL: getEnvString('VITE_CDN_BASE_URL', 'https://eassyserve-cdn.s3-accelerate.amazonaws.com'),
  IMAGE_BASE_URL: getEnvString('VITE_IMAGE_BASE_URL', 'https://eassyserve-cdn.s3.ap-south-1.amazonaws.com'),
  
  // Analytics
  GOOGLE_ANALYTICS_ID: getEnvString('VITE_GOOGLE_ANALYTICS_ID'),
  MIXPANEL_TOKEN: getEnvString('VITE_MIXPANEL_TOKEN'),
  
  // Error Tracking
  SENTRY_DSN: getEnvString('VITE_SENTRY_DSN'),
  ENABLE_ERROR_TRACKING: getEnvBoolean('VITE_ENABLE_ERROR_TRACKING', false),
};

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Caching
  ENABLE_SERVICE_WORKER: getEnvBoolean('VITE_ENABLE_SERVICE_WORKER', true),
  CACHE_DURATION: getEnvNumber('VITE_CACHE_DURATION', 3600000), // 1 hour
  ENABLE_LAZY_LOADING: getEnvBoolean('VITE_ENABLE_LAZY_LOADING', true),
  
  // Bundle Optimization
  ENABLE_CODE_SPLITTING: getEnvBoolean('VITE_ENABLE_CODE_SPLITTING', true),
  CHUNK_SIZE_WARNING_LIMIT: getEnvNumber('VITE_CHUNK_SIZE_WARNING_LIMIT', 1000),
};

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  // CORS
  ALLOWED_ORIGINS: getEnvArray('VITE_ALLOWED_ORIGINS', [
    'http://13.201.2.247:5001',
    'http://13.201.2.247:5173',
    'https://app.eassylife.in'
  ]),

  // Content Security Policy
  ENABLE_CSP: getEnvBoolean('VITE_ENABLE_CSP', true),
  CSP_REPORT_URI: getEnvString('VITE_CSP_REPORT_URI'),
};

/**
 * Logging Configuration
 */
export const LOGGING_CONFIG = {
  LOG_LEVEL: getEnvString('VITE_LOG_LEVEL', 'info'),
  ENABLE_CONSOLE_LOGS: getEnvBoolean('VITE_ENABLE_CONSOLE_LOGS', true),
  ENABLE_NETWORK_LOGS: getEnvBoolean('VITE_ENABLE_NETWORK_LOGS', true),
  ENABLE_ERROR_LOGS: getEnvBoolean('VITE_ENABLE_ERROR_LOGS', true),
};

/**
 * PWA Configuration
 */
export const PWA_CONFIG = {
  NAME: getEnvString('VITE_PWA_NAME', 'EassyLife'),
  SHORT_NAME: getEnvString('VITE_PWA_SHORT_NAME', 'EassyLife'),
  DESCRIPTION: getEnvString('VITE_PWA_DESCRIPTION', 'AI-Powered E-Commerce Marketplace'),
  THEME_COLOR: getEnvString('VITE_PWA_THEME_COLOR', '#FFA301'),
  BACKGROUND_COLOR: getEnvString('VITE_PWA_BACKGROUND_COLOR', '#FFFFFF'),
};

/**
 * Mobile App Configuration
 */
export const MOBILE_CONFIG = {
  ANDROID_APP_ID: getEnvString('VITE_ANDROID_APP_ID', 'com.eassylife'),
  IOS_APP_ID: getEnvString('VITE_IOS_APP_ID', '6743106235'),
  APP_STORE_URL: getEnvString('VITE_APP_STORE_URL', 'https://onelink.to/rwzgt2'),
};

/**
 * Localization Configuration
 */
export const LOCALIZATION_CONFIG = {
  DEFAULT_LANGUAGE: getEnvString('VITE_DEFAULT_LANGUAGE', 'en'),
  SUPPORTED_LANGUAGES: getEnvArray('VITE_SUPPORTED_LANGUAGES', ['en', 'hi']),
  ENABLE_RTL: getEnvBoolean('VITE_ENABLE_RTL', false),
};

/**
 * Contact & Support Configuration
 */
export const CONTACT_CONFIG = {
  SUPPORT_EMAIL: getEnvString('VITE_SUPPORT_EMAIL', 'support@eassylife.in'),
  SUPPORT_PHONE: getEnvString('VITE_SUPPORT_PHONE', '+91-XXXXXXXXXX'),
  COMPANY_NAME: getEnvString('VITE_COMPANY_NAME', 'EassyLife Technologies'),
  COMPANY_WEBSITE: getEnvString('VITE_COMPANY_WEBSITE', 'https://eassylife.in'),
};

/**
 * Legal Configuration
 */
export const LEGAL_CONFIG = {
  PRIVACY_POLICY_URL: getEnvString('VITE_PRIVACY_POLICY_URL', 'https://eassylife.in/privacy-policy'),
  TERMS_OF_SERVICE_URL: getEnvString('VITE_TERMS_OF_SERVICE_URL', 'https://eassylife.in/terms-of-service'),
  COOKIE_POLICY_URL: getEnvString('VITE_COOKIE_POLICY_URL', 'https://eassylife.in/cookie-policy'),
};

/**
 * Check if the application is running in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return APP_CONFIG.NODE_ENV === 'development' || APP_CONFIG.APP_ENV === 'development';
};

/**
 * Check if the application is running in production mode
 * @returns {boolean}
 */
export const isProduction = () => {
  return APP_CONFIG.NODE_ENV === 'production' || APP_CONFIG.APP_ENV === 'production';
};

/**
 * Check if the application is running in staging mode
 * @returns {boolean}
 */
export const isStaging = () => {
  return APP_CONFIG.APP_ENV === 'staging';
};

/**
 * Get the current environment name
 * @returns {string}
 */
export const getCurrentEnvironment = () => {
  return APP_CONFIG.APP_ENV;
};
