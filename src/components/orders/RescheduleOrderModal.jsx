import React, { useState, memo } from 'react';
import { X, Calendar, Clock, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { useOrderContext } from '../../contexts/OrderContext';

/**
 * RescheduleOrderModal Component
 * Modal for rescheduling orders with date/time selection and reason
 */
const RescheduleOrderModal = memo(({ 
  isOpen, 
  onClose, 
  order, 
  item,
  onSuccess 
}) => {
  const { rescheduleOrder, loading } = useOrderContext();
  const [newDate, setNewDate] = useState('');
  const [newTimeFrom, setNewTimeFrom] = useState('');
  const [newTimeTo, setNewTimeTo] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined reschedule reasons
  const rescheduleReasons = [
    'Schedule conflict',
    'Emergency situation',
    'Provider requested change',
    'Weather conditions',
    'Personal reasons',
    'Work commitments',
    'Travel plans changed',
    'Other'
  ];

  // Generate time slots (9 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({ label: time12, value: time24 });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Handle reason selection
  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    if (reason !== 'Other') {
      setCustomReason('');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    
    if (!newDate || !newTimeFrom || !newTimeTo || !finalReason) {
      return;
    }

    // Validate time range
    if (newTimeFrom >= newTimeTo) {
      alert('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await rescheduleOrder(item.id, newDate, newTimeFrom, newTimeTo, finalReason);
      if (result.success) {
        onSuccess?.();
        onClose();
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Failed to reschedule order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewDate('');
    setNewTimeFrom('');
    setNewTimeTo('');
    setSelectedReason('');
    setCustomReason('');
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting && !loading) {
      resetForm();
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const isFormValid = newDate && newTimeFrom && newTimeTo && selectedReason && 
    (selectedReason !== 'Other' || customReason.trim()) && newTimeFrom < newTimeTo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <Calendar className="w-5 h-5" />
              <span>Reschedule Order</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting || loading}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Current Order Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Booking</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Service: {item.rateCard?.subcategory?.name || item.rateCard?.category?.name}</p>
              <p>Provider: {item.provider?.firstName} {item.provider?.lastName}</p>
              {item.bookingDate && (
                <p>Current Date: {new Date(item.bookingDate).toLocaleDateString('en-IN')}</p>
              )}
              {item.bookingTimeFrom && item.bookingTimeTo && (
                <p>Current Time: {item.bookingTimeFrom} - {item.bookingTimeTo}</p>
              )}
            </div>
          </div>

          {/* New Date Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Select New Date *
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <select
                value={newTimeFrom}
                onChange={(e) => setNewTimeFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select start time</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                End Time *
              </label>
              <select
                value={newTimeTo}
                onChange={(e) => setNewTimeTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select end time</option>
                {timeSlots.map((slot) => (
                  <option 
                    key={slot.value} 
                    value={slot.value}
                    disabled={newTimeFrom && slot.value <= newTimeFrom}
                  >
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reschedule Reason Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Reason for rescheduling *
            </label>
            
            <div className="space-y-2">
              {rescheduleReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="rescheduleReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => handleReasonSelect(reason)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'Other' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Please specify your reason *
              </label>
              <Textarea
                placeholder="Please provide details about why you want to reschedule this order..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="resize-none focus:ring-orange-500 focus:border-orange-500"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right">
                {customReason.length}/500
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || loading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {isSubmitting || loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Rescheduling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Reschedule Order
                </>
              )}
            </Button>
          </div>

          {/* Terms Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Rescheduling is subject to provider availability. 
              You will be notified once the new schedule is confirmed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

RescheduleOrderModal.displayName = 'RescheduleOrderModal';

export default RescheduleOrderModal;
