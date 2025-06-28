import React, { memo } from 'react';
import { XCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const CancelledServiceContainer = memo(({ order, item }) => {
  if (!order || !item) {
    return null;
  }

  // Extract provider information - using Flutter naming conventions
  const provider = item.provider || {};
  const providerName = `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider';
  const providerImage = provider.image || '';

  // Extract service information - using Flutter naming conventions
  const rateCard = item.rateCard || {};
  const serviceName = rateCard.subcategory?.name || rateCard.category?.name || 'Service';
  const serviceImage = rateCard.subcategory?.image || rateCard.category?.image || '';
  const packageName = item.package?.name;

  // Extract pricing information - using Flutter naming conventions
  const totalAmount = parseFloat(item.totalAmount || '0');
  const strikePrice = parseFloat(rateCard.strikePrice || '0');

  // Extract address information - using Flutter naming conventions
  const address = item.address || {};
  const fullAddress = [
    address.flatNo,
    address.buildingName,
    address.streetBookingDetailsAddress,
    address.city,
    address.state,
    address.postalCode
  ].filter(Boolean).join(', ');

  // Extract booking date and time - using Flutter naming conventions
  const bookingDate = item.bookingDate;
  const bookingTimeFrom = item.bookingTimeFrom;
  const bookingTimeTo = item.bookingTimeTo;

  // Cancellation information - using Flutter naming conventions
  const cancelBy = item.cancelBy;
  const cancelReason = item.cancelReason;
  const cancelComment = item.cancelComment;

  // Format date and time
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  return (
    <Card className="overflow-hidden border-red-200 bg-gradient-to-br from-red-50 to-red-100">
      <CardContent className="p-0">
        {/* Cancelled Status Header */}
        <div className="bg-red-500 text-white p-4">
          <div className="flex items-center justify-center space-x-2">
            <XCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Order Cancelled</h2>
          </div>
        </div>

        {/* Service Information */}
        <div className="p-6 border-b border-red-200">
          <div className="flex items-start space-x-4">
            {/* Service Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {serviceImage ? (
                <img 
                  src={serviceImage} 
                  alt={serviceName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <span className="text-red-600 font-medium text-lg">
                    {serviceName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {providerName}
              </h3>
              <p className="text-gray-600 mb-1">{serviceName}</p>
              {packageName && (
                <p className="text-sm text-gray-500 mb-2">Package: {packageName}</p>
              )}
              
              {/* Provider Avatar */}
              <div className="flex items-center space-x-2 mt-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={providerImage} alt={providerName} />
                  <AvatarFallback className="bg-red-100 text-red-600 font-medium text-xs">
                    {providerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-500">Service Provider</span>
              </div>
              
              {/* Price Information */}
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
                {strikePrice > 0 && strikePrice > totalAmount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(strikePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Details */}
        <div className="p-6 border-b border-red-200 bg-white">
          <h4 className="font-medium text-gray-900 mb-3">Cancellation Details</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cancelled by</p>
                <p className="text-sm text-gray-600">
                  {cancelBy === 'customer' ? 'You' : cancelBy || 'System'}
                </p>
              </div>
            </div>
            
            {cancelReason && (
              <div className="flex items-start space-x-3">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Reason</p>
                  <p className="text-sm text-gray-600">{cancelReason}</p>
                </div>
              </div>
            )}
            
            {cancelComment && (
              <div className="flex items-start space-x-3">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Comment</p>
                  <p className="text-sm text-gray-600">{cancelComment}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Original Booking Details */}
        <div className="p-6 bg-white">
          <h4 className="font-medium text-gray-900 mb-3">Original Booking Details</h4>
          
          <div className="space-y-3">
            {/* Address */}
            {fullAddress && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Service Address</p>
                  <p className="text-sm text-gray-600">{fullAddress}</p>
                </div>
              </div>
            )}
            
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookingDate && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service Date</p>
                    <p className="text-sm text-gray-600">{formatDate(bookingDate)}</p>
                  </div>
                </div>
              )}
              
              {bookingTimeFrom && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service Time</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(bookingTimeFrom)}
                      {bookingTimeTo && ` - ${formatTime(bookingTimeTo)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CancelledServiceContainer.displayName = 'CancelledServiceContainer';

export default CancelledServiceContainer;
