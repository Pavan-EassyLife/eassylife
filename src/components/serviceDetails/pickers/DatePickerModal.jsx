import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import AccessibleModal from '../../common/AccessibleModal';
import AccessibleButton from '../../common/AccessibleButton';
import useAccessibility from '../../../hooks/useAccessibility';

/**
 * DatePickerModal Component - Flutter-like date picker
 * 
 * Features:
 * - Mobile-optimized touch interactions
 * - Month/year navigation
 * - Disabled past dates
 * - Available dates highlighting
 * - Smooth animations
 */
const DatePickerModal = ({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate,
  minDate = new Date(),
  maxDate = null,
  availableDates = [],
  className = ""
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState(selectedDate);

  const {
    announceToScreenReader,
    handleKeyboardNavigation,
    generateId
  } = useAccessibility();

  useEffect(() => {
    if (selectedDate) {
      setSelectedDateState(selectedDate);
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is available
  const isDateAvailable = (date) => {
    if (availableDates.length === 0) return true;
    return availableDates.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    );
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    if (maxDate && date > maxDate) return true;
    if (!isDateAvailable(date)) return true;
    
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedDateState) return false;
    return date.toDateString() === selectedDateState.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    
    setSelectedDateState(date);
    onDateSelect(date);
    onClose();
  };

  // Navigate months
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Format month/year display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Format day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = generateCalendarDays();

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Date"
      size="medium"
      className={className}
    >
      <div>
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <h4 className="text-lg font-medium text-gray-900">
            {formatMonthYear(currentMonth)}
          </h4>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const currentMonthDate = isCurrentMonth(date);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200
                    ${selected 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : disabled 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : currentMonthDate
                          ? 'text-gray-900 hover:bg-orange-50 hover:text-orange-600'
                          : 'text-gray-400 hover:bg-gray-50'
                    }
                    ${!disabled && !selected ? 'hover:scale-105' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedDateState ? (
              <span>Selected: {selectedDateState.toLocaleDateString()}</span>
            ) : (
              <span>No date selected</span>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedDateState && onDateSelect(selectedDateState)}
              disabled={!selectedDateState}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default DatePickerModal;
