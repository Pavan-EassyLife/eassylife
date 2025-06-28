/**
 * Date and Time Service
 * Handles API calls for date/time slot management
 * Matches Flutter getDateAndTimeSlotsURL functionality
 */

import axiosInstance from '../axiosInstance.js';

/**
 * Get available date and time slots
 * Matches Flutter apiValue.getDateAndTimeSlotsURL
 * @returns {Promise<Object>} Date and time slot configuration
 */
export const getDateAndTimeSlots = async () => {
  try {
    const response = await axiosInstance.get('slots/');

    if (response.data.status && response.data.data) {
      return {
        success: true,
        data: response.data.data
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to fetch date/time slots'
    };
  } catch (error) {
    console.error('❌ Failed to fetch date/time slots:', error);
    return {
      success: false,
      message: error.message || 'Network error'
    };
  }
};

/**
 * Generate time slots based on Flutter logic
 * @param {Object} slotData - API response data
 * @param {Date} selectedDate - Selected date
 * @param {Date} startDate - Start date from API
 * @returns {Array} Array of time slots
 */
export const generateTimeSlots = (slotData, selectedDate, startDate) => {
  const slots = [];
  
  if (!slotData || !selectedDate || !startDate) {
    return slots;
  }

  // Check if selected date is the first available date
  const isFirstDate = selectedDate.getFullYear() === startDate.getFullYear() &&
                     selectedDate.getMonth() === startDate.getMonth() &&
                     selectedDate.getDate() === startDate.getDate();

  let startHour, endHour;

  if (isFirstDate) {
    // First available date - use restricted hours
    startHour = slotData.availableStartSlotHour || 8;
    endHour = slotData.timeSlotEndHour || 19;
  } else {
    // Other dates - use full day hours
    startHour = slotData.nextslotstart || 8;
    endHour = 21; // Fixed end hour as per Flutter logic
  }

  // Generate hourly slots
  for (let hour = startHour; hour <= endHour; hour++) {
    const timeFrom = `${hour.toString().padStart(2, '0')}:00`;
    const timeTo = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    // Format for display (12-hour format)
    const displayTimeFrom = formatTo12Hour(timeFrom);
    const displayTimeTo = formatTo12Hour(timeTo);
    
    slots.push({
      timeFrom,
      timeTo,
      display: `${displayTimeFrom} - ${displayTimeTo}`,
      hour
    });
  }

  return slots;
};

/**
 * Format time to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:mm)
 * @returns {string} Time in 12-hour format
 */
export const formatTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Check if a date is selectable based on Flutter constraints
 * @param {Date} date - Date to check
 * @param {Date} startDate - Start date from API
 * @param {Date} endDate - End date from API
 * @returns {boolean} Whether the date is selectable
 */
export const isDateSelectable = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) {
    return false;
  }

  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check if date is in range
  const isInRange = normalizedDate > normalizedStart.setDate(normalizedStart.getDate() - 1) &&
                   normalizedDate < normalizedEnd.setDate(normalizedEnd.getDate() + 1);

  // Check if date is today (excluded as per Flutter logic)
  const isToday = normalizedDate.getTime() === normalizedToday.getTime();

  return isInRange && !isToday;
};

/**
 * Parse date string from API response
 * @param {string} dateString - Date string in dd-MM-yyyy format
 * @returns {Date} Parsed date object
 */
export const parseAPIDate = (dateString) => {
  if (!dateString) return null;
  
  const [day, month, year] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * Format date for API (dd MMM yyyy format)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export const formatDateForAPI = (date) => {
  if (!date) return '';
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default {
  getDateAndTimeSlots,
  generateTimeSlots,
  formatTo12Hour,
  isDateSelectable,
  parseAPIDate,
  formatDateForAPI
};
