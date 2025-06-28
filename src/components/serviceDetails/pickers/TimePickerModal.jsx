import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

/**
 * TimePickerModal Component - Flutter-like time slot picker
 * 
 * Features:
 * - Available time slots display
 * - Morning/Afternoon/Evening sections
 * - Touch-friendly slot selection
 * - Service duration consideration
 * - Unavailable slots handling
 */
const TimePickerModal = ({
  isOpen,
  onClose,
  onTimeSelect,
  selectedTimeFrom,
  selectedTimeTo,
  availableSlots = [],
  serviceDuration = 60, // in minutes
  className = ""
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (selectedTimeFrom && selectedTimeTo) {
      setSelectedSlot({ from: selectedTimeFrom, to: selectedTimeTo });
    }
  }, [selectedTimeFrom, selectedTimeTo]);

  // Generate time slots based on availability
  const generateTimeSlots = () => {
    if (availableSlots.length > 0) {
      return availableSlots;
    }

    // Default time slots if none provided
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 20; // 8 PM
    const slotDuration = serviceDuration || 60;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const fromTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const toHour = minute + slotDuration >= 60 ? hour + 1 : hour;
        const toMinute = (minute + slotDuration) % 60;
        const toTime = `${toHour.toString().padStart(2, '0')}:${toMinute.toString().padStart(2, '0')}`;
        
        if (toHour <= endHour) {
          slots.push({
            from: fromTime,
            to: toTime,
            available: true,
            label: `${formatTime(fromTime)} - ${formatTime(toTime)}`
          });
        }
      }
    }

    return slots;
  };

  // Format time for display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Group slots by time of day
  const groupSlotsByTimeOfDay = (slots) => {
    const groups = {
      morning: [],
      afternoon: [],
      evening: []
    };

    slots.forEach(slot => {
      const hour = parseInt(slot.from.split(':')[0]);
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 17) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    if (!slot.available) return;
    
    setSelectedSlot(slot);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedSlot) {
      onTimeSelect(selectedSlot.from, selectedSlot.to);
      onClose();
    }
  };

  // Check if slot is selected
  const isSlotSelected = (slot) => {
    return selectedSlot && selectedSlot.from === slot.from && selectedSlot.to === slot.to;
  };

  const timeSlots = generateTimeSlots();
  const groupedSlots = groupSlotsByTimeOfDay(timeSlots);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
      <div className={`bg-white w-full md:w-96 md:rounded-lg shadow-xl max-h-[80vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Time</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Time Slots */}
        <div className="overflow-y-auto max-h-96">
          {Object.entries(groupedSlots).map(([timeOfDay, slots]) => {
            if (slots.length === 0) return null;

            const timeOfDayLabels = {
              morning: 'Morning',
              afternoon: 'Afternoon',
              evening: 'Evening'
            };

            return (
              <div key={timeOfDay} className="p-4 border-b border-gray-100 last:border-b-0">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock size={16} className="mr-2" />
                  {timeOfDayLabels[timeOfDay]}
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot, index) => {
                    const selected = isSlotSelected(slot);
                    const available = slot.available !== false;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!available}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2
                          ${selected 
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                            : available
                              ? 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }
                          ${available && !selected ? 'hover:scale-105' : ''}
                        `}
                      >
                        <div className="text-center">
                          <div className="font-semibold">
                            {formatTime(slot.from)}
                          </div>
                          <div className="text-xs opacity-75">
                            to {formatTime(slot.to)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* No slots available */}
          {timeSlots.length === 0 && (
            <div className="p-8 text-center">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Time Slots Available</h4>
              <p className="text-gray-500">Please select a different date or contact support.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedSlot ? (
              <span>Selected: {selectedSlot.label || `${formatTime(selectedSlot.from)} - ${formatTime(selectedSlot.to)}`}</span>
            ) : (
              <span>No time selected</span>
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
              onClick={handleConfirm}
              disabled={!selectedSlot}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;
