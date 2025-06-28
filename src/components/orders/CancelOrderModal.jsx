import React, { useState, memo } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { useOrderContext } from '../../contexts/OrderContext';

/**
 * CancelOrderModal Component
 * Modal for cancelling orders with reason selection and confirmation
 */
const CancelOrderModal = memo(({ 
  isOpen, 
  onClose, 
  order, 
  item,
  onSuccess 
}) => {
  const { cancelOrder, loading } = useOrderContext();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined cancellation reasons
  const cancellationReasons = [
    'Change of plans',
    'Found a better service provider',
    'Emergency situation',
    'Service no longer needed',
    'Pricing concerns',
    'Scheduling conflicts',
    'Provider unavailable',
    'Other'
  ];

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
    
    if (!finalReason) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await cancelOrder(item.id, finalReason);
      if (result.success) {
        onSuccess?.();
        onClose();
        // Reset form
        setSelectedReason('');
        setCustomReason('');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setSelectedReason('');
      setCustomReason('');
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const isFormValid = selectedReason && (selectedReason !== 'Other' || customReason.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Cancel Order</span>
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
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">
                  Are you sure you want to cancel this order?
                </h4>
                <p className="text-sm text-red-800">
                  This action cannot be undone. Cancellation charges may apply based on our policy.
                </p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Service: {item.rateCard?.subcategory?.name || item.rateCard?.category?.name}</p>
              <p>Provider: {item.provider?.firstName} {item.provider?.lastName}</p>
              <p>Amount: ₹{parseFloat(item.totalAmount || '0').toLocaleString('en-IN')}</p>
              {item.bookingDate && (
                <p>Date: {new Date(item.bookingDate).toLocaleDateString('en-IN')}</p>
              )}
            </div>
          </div>

          {/* Cancellation Reason Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Please select a reason for cancellation *
            </label>
            
            <div className="space-y-2">
              {cancellationReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="cancellationReason"
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
                placeholder="Please provide details about why you want to cancel this order..."
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
              Keep Order
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {isSubmitting || loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </div>

          {/* Terms Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Cancellation charges may apply as per our terms and conditions. 
              Refunds will be processed according to our refund policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

CancelOrderModal.displayName = 'CancelOrderModal';

export default CancelOrderModal;
