import React, { memo } from 'react';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import OrderStatusBadge from './OrderStatusBadge';

const OrderCard = memo(({ order, onOrderClick }) => {
  // Get the first item from the order (orders typically have one item)
  const item = order.items?.[0] || order;

  if (!item) {
    console.warn('OrderCard: No item data found', { order });
    return null;
  }

  // Extract order information - using API response structure
  const orderId = item.order_id || item.orderId || order.id;
  const orderNumber = orderId ? `#${orderId}` : '#000000';
  const status = item.status || 'unknown';
  const bookingDate = item.booking_date || item.bookingDate;
  const bookingTimeFrom = item.booking_time_from || item.bookingTimeFrom;
  const bookingTimeTo = item.booking_time_to || item.bookingTimeTo;
  const totalAmount = item.total_amount || item.totalAmount || '0';
  const isPartial = item.is_partial === 1 || item.isPartial === 1;

  // Provider information - using API response structure
  const provider = item.provider || {};
  const providerName = `${provider.first_name || provider.firstName || ''} ${provider.last_name || provider.lastName || ''}`.trim() || 'Provider';
  const providerImage = provider.image || '';
  const providerPhone = provider.phone || '';

  // Service information - using API response structure
  const rateCard = item.rateCard || item.rate_card || {};
  const serviceName = rateCard.subcategory?.name || rateCard.category?.name || 'Service';
  const packageName = item.package?.name;

  // Address information - using API response structure
  const address = item.address || {};
  const fullAddress = [
    address.flat_no || address.flatNo,
    address.building_name || address.buildingName,
    address.street_address || address.streetBookingDetailsAddress,
    address.city,
    address.state,
    address.postal_code || address.postalCode
  ].filter(Boolean).join(', ');

  // Cancellation information - using API response structure
  const cancelBy = item.cancel_by || item.cancelBy;
  const cancelReason = item.cancel_reason || item.cancelReason;

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

  // Status is handled by OrderStatusBadge component

  // Handle card click
  const handleClick = () => {
    onOrderClick?.(order, item);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 ease-in-out cursor-pointer group transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
              Order {orderNumber}
            </h3>
            {isPartial && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-1">
                P
              </Badge>
            )}
          </div>
          <OrderStatusBadge status={status} size="sm" />
        </div>
        
        {/* Date and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-sm text-gray-600 space-y-1 sm:space-y-0">
          {bookingDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formatDate(bookingDate)}</span>
            </div>
          )}
          {bookingTimeFrom && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {formatTime(bookingTimeFrom)}
                {bookingTimeTo && ` - ${formatTime(bookingTimeTo)}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Provider and Service Section */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start space-x-3">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={providerImage} alt={providerName} />
            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 font-medium">
              {providerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{providerName}</h4>
                <p className="text-sm text-gray-600 truncate">{serviceName}</p>
                {packageName && (
                  <p className="text-xs text-gray-500 truncate">Package: {packageName}</p>
                )}
              </div>
              {providerPhone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 h-auto rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${providerPhone}`, '_self');
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        {fullAddress && (
          <div className="flex items-start space-x-2 mt-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2 leading-relaxed">{fullAddress}</span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Service Amount</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{parseFloat(totalAmount).toLocaleString('en-IN')}
                </span>
                {isPartial && (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show cancellation info for cancelled orders */}
          {status === 'cancelled' && cancelReason && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-red-600 font-medium">
                Cancelled by {cancelBy === 'customer' ? 'You' : cancelBy}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-24 sm:max-w-32" title={cancelReason}>
                {cancelReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;
