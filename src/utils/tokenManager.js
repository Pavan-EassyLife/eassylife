import Cookies from 'js-cookie';

const TOKEN_KEY = 'eassylife_auth_token';
const USER_KEY = 'eassylife_user_data';
const PRIMARY_ADDRESS_KEY = 'eassylife_primary_address';
const PHONE_DATA_KEY = 'eassylife_phone_data';

// Token management using secure cookies
export const getAuthToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const setAuthToken = (token) => {
  // Set cookie with secure options
  Cookies.set(TOKEN_KEY, token, {
    expires: 1, // 1 day
    secure: import.meta.env.PROD, // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    httpOnly: false, // Allow JavaScript access (needed for API calls)
  });
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
  Cookies.remove(PRIMARY_ADDRESS_KEY);
  Cookies.remove(PHONE_DATA_KEY);
};

// User data management
export const getUserData = () => {
  const userData = Cookies.get(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (userData) => {
  Cookies.set(USER_KEY, JSON.stringify(userData), {
    expires: 1, // 1 day
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    httpOnly: false,
  });
};

// Primary address management
export const getPrimaryAddress = () => {
  const addressData = Cookies.get(PRIMARY_ADDRESS_KEY);
  return addressData ? JSON.parse(addressData) : null;
};

export const setPrimaryAddress = (addressData) => {
  Cookies.set(PRIMARY_ADDRESS_KEY, JSON.stringify(addressData), {
    expires: 7, // 7 days for address data
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    httpOnly: false,
  });
};

export const removePrimaryAddress = () => {
  Cookies.remove(PRIMARY_ADDRESS_KEY);
};

// Phone number management for OTP and registration flow
export const getPhoneData = () => {
  const phoneData = Cookies.get(PHONE_DATA_KEY);
  return phoneData ? JSON.parse(phoneData) : null;
};

export const setPhoneData = (phoneNumber, countryCode) => {
  const phoneData = {
    phoneNumber,
    countryCode,
    timestamp: Date.now()
  };

  Cookies.set(PHONE_DATA_KEY, JSON.stringify(phoneData), {
    expires: 1, // 1 day - temporary storage for auth flow
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    httpOnly: false,
  });

  // Also store in localStorage as backup
  localStorage.setItem(PHONE_DATA_KEY, JSON.stringify(phoneData));
};

export const removePhoneData = () => {
  Cookies.remove(PHONE_DATA_KEY);
  localStorage.removeItem(PHONE_DATA_KEY);
};

// Get phone data with fallback to localStorage
export const getPhoneDataWithFallback = () => {
  // Try cookies first
  let phoneData = getPhoneData();

  // Fallback to localStorage
  if (!phoneData) {
    try {
      const localData = localStorage.getItem(PHONE_DATA_KEY);
      phoneData = localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error('Error reading phone data from localStorage:', error);
    }
  }

  // Check if data is not too old (24 hours)
  if (phoneData && phoneData.timestamp) {
    const isExpired = Date.now() - phoneData.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      removePhoneData();
      return null;
    }
  }

  return phoneData;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};



// Verify token format and validity (for debugging)
export const verifyTokenFormat = () => {
  const token = getAuthToken();

  if (!token) {
    return {
      valid: false,
      error: 'No token found',
      details: null
    };
  }

  try {
    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'Invalid JWT format - should have 3 parts separated by dots',
        details: { parts: parts.length, token: token.substring(0, 50) + '...' }
      };
    }

    // Try to decode the payload (without verification)
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return {
      valid: true,
      error: null,
      details: {
        header: JSON.parse(atob(parts[0])),
        payload: payload,
        isExpired: payload.exp && payload.exp < now,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiration',
        issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No issue time',
        userId: payload.sub || payload.user_id || payload.id || 'No user ID in token'
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to decode token: ' + error.message,
      details: { token: token.substring(0, 50) + '...' }
    };
  }
};
