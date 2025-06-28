/**
 * Date and Time Utility Functions
 * Matches Flutter date/time formatting functions
 */

/**
 * Format date string to display format
 * Matches Flutter formatDateValue function
 * @param {string} dateString - Date string in various formats
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    let date;
    
    // Try parsing different date formats
    if (dateString.includes('MMM')) {
      // Format: "26 Jun 2025" or "dd MMM yyyy"
      date = new Date(dateString);
    } else if (dateString.includes('-')) {
      // Format: "2025-06-26" or "yyyy-MM-dd"
      date = new Date(dateString);
    } else {
      // Fallback
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    
    // Format to match Flutter: "Wed, 26th Jun 2025"
    const day = date.getDate();
    const dayWithSuffix = `${day}${getDaySuffix(day)}`;
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${weekday}, ${dayWithSuffix} ${month} ${year}`;
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get day suffix (st, nd, rd, th)
 * Matches Flutter getDaySuffix function
 * @param {number} day - Day of the month
 * @returns {string} Suffix for the day
 */
export const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

/**
 * Format time string to display format
 * Matches Flutter formatTimeValue function
 * @param {string} timeString - Time string in HH:mm:ss or HH:mm format
 * @returns {string} Formatted time string in 12-hour format
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Get current date in Flutter format (dd MMM yyyy)
 * @returns {string} Current date formatted as "26 Jun 2025"
 */
export const getCurrentDateFormatted = () => {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Convert date to Flutter API format (dd MMM yyyy)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Date formatted for API
 */
export const formatDateForAPI = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  return dateObj > now;
};
