import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import cartService from '../../api/services/cartService';
import dateTimeService from '../../api/services/dateTimeService';
import { formatDateTime } from '../../utils/dateUtils';

/**
 * Date & Time Edit Modal Component
 * Matches Flutter DateAndTimeBottomSheet functionality for cart items
 * Updated with proper date/time constraints
 */
const DateTimeEditModal = ({
  isOpen,
  onClose,
  service,
  onSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateTimeSlots, setDateTimeSlots] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch date/time slots when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDateTimeSlots();
    }
  }, [isOpen]);

  // Initialize form with current service data
  useEffect(() => {
    if (service && isOpen && dateTimeSlots) {
      // Parse current booking date (format: "26 Jun 2025")
      const currentDate = service.bookingDate;
      if (currentDate) {
        // Convert to YYYY-MM-DD format for input
        const dateObj = new Date(currentDate);
        if (!isNaN(dateObj.getTime())) {
          setSelectedDate(dateObj.toISOString().split('T')[0]);
          // Generate time slots for current date
          generateTimeSlotsForDate(dateObj);

          // Find and set current time slot
          const currentTimeFrom = service.bookingTimeFrom || '';
          const currentTimeTo = service.bookingTimeTo || '';
          if (currentTimeFrom && currentTimeTo) {
            // Find matching time slot
            setTimeout(() => {
              const matchingSlot = availableTimeSlots.find(slot =>
                slot.timeFrom === currentTimeFrom && slot.timeTo === currentTimeTo
              );
              if (matchingSlot) {
                setSelectedTimeSlot(matchingSlot);
              }
            }, 100);
          }
        }
      }
      setError('');
    }
  }, [service, isOpen, dateTimeSlots]);

  // Fetch date and time slots from API (matches Flutter getDateAndTimeSlotsURL)
  const fetchDateTimeSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const response = await dateTimeService.getDateAndTimeSlots();

      if (response.success) {
        setDateTimeSlots(response.data);
      } else {
        setError('Failed to load available time slots');
      }
    } catch (error) {
      console.error('❌ Failed to fetch date/time slots:', error);
      setError('Failed to load time slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Generate time slots for selected date (matches Flutter _generateTimeSlots)
  const generateTimeSlotsForDate = (dateObj) => {
    if (!dateTimeSlots || !dateObj) {
      setAvailableTimeSlots([]);
      return;
    }

    // Create start and end dates from API response
    const startDate = new Date(
      dateTimeSlots.timeSlotStartYear,
      dateTimeSlots.timeSlotStartMonth - 1,
      dateTimeSlots.timeSlotStartDate
    );

    const endDate = dateTimeService.parseAPIDate(dateTimeSlots.timeSlotEndDateString);

    // Generate time slots using Flutter logic
    const slots = dateTimeService.generateTimeSlots(dateTimeSlots, dateObj, startDate);
    setAvailableTimeSlots(slots);


  };

  // Handle date change
  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTimeSlot(null); // Reset time selection

    if (dateString) {
      const dateObj = new Date(dateString);
      generateTimeSlotsForDate(dateObj);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  // Handle save (matches Flutter changeDateAndTimeFunction)
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate inputs
      if (!selectedDate || !selectedTimeSlot) {
        setError('Please select date and time');
        return;
      }

      // Format date to match Flutter format (dd MMM yyyy)
      const dateObj = new Date(selectedDate);
      const formattedDate = dateTimeService.formatDateForAPI(dateObj);

      console.log('🕒 Updating cart item date/time:', {
        itemId: service.id,
        date: formattedDate,
        timeFrom: selectedTimeSlot.timeFrom,
        timeTo: selectedTimeSlot.timeTo
      });

      // Call API (matches Flutter changeDateAndTimeFunction)
      const response = await cartService.updateCartItemDateTime(service.id, {
        booking_date: formattedDate,
        booking_time_from: selectedTimeSlot.timeFrom,
        booking_time_to: selectedTimeSlot.timeTo
      });

      if (response.success) {
        console.log('✅ Cart item date/time updated successfully');

        // Call success callback to refresh cart data
        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      } else {
        throw new Error(response.message || 'Failed to update date/time');
      }

    } catch (error) {
      console.error('❌ Failed to update cart item date/time:', error);
      setError(error.message || 'Failed to update date/time');
    } finally {
      setIsLoading(false);
    }
  };

  // Get min and max dates for date input (matches Flutter enabledDayPredicate)
  const getDateConstraints = () => {
    if (!dateTimeSlots) {
      return { min: '', max: '' };
    }

    const startDate = new Date(
      dateTimeSlots.timeSlotStartYear,
      dateTimeSlots.timeSlotStartMonth - 1,
      dateTimeSlots.timeSlotStartDate
    );

    const endDate = dateTimeService.parseAPIDate(dateTimeSlots.timeSlotEndDateString);

    // Exclude today as per Flutter logic
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const minDate = startDate > tomorrow ? startDate : tomorrow;

    return {
      min: minDate.toISOString().split('T')[0],
      max: endDate ? endDate.toISOString().split('T')[0] : ''
    };
  };

  const dateConstraints = getDateConstraints();

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Edit Date & Time
          </h3>
          <p className="text-gray-600 text-sm">
            Service: {service.serviceName || service.packageName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Current: {formatDateTime(service.bookingDate)} at {service.bookingTimeFrom} - {service.bookingTimeTo}
          </p>
        </div>

        {/* Loading State */}
        {isLoadingSlots && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading available slots...</span>
          </div>
        )}



        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Date Picker - Only show if slots are loaded */}
        {!isLoadingSlots && dateTimeSlots && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={dateConstraints.min}
              max={dateConstraints.max}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: Today is not available for booking. Select from tomorrow onwards.
            </p>
          </div>
        )}

        {/* Time Slot Picker - Only show if date is selected and slots are loaded */}
        {!isLoadingSlots && selectedDate && availableTimeSlots.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Select Time Slot
            </label>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {availableTimeSlots.map((slot) => (
                <motion.button
                  key={`${slot.timeFrom}-${slot.timeTo}`}
                  type="button"
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                    selectedTimeSlot?.timeFrom === slot.timeFrom && selectedTimeSlot?.timeTo === slot.timeTo
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">{slot.display}</div>
                  <div className="text-xs text-gray-500">
                    Duration: 1 hour
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedTimeSlot && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Selected: {selectedTimeSlot.display}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No time slots available message */}
        {!isLoadingSlots && selectedDate && availableTimeSlots.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              No time slots available for the selected date. Please choose a different date.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !selectedDate || !selectedTimeSlot}
            className="flex-1 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DateTimeEditModal;
