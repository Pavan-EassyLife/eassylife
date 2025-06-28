import React, { memo } from 'react';
import { Phone, MapPin, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import OrderStatusBadge from './OrderStatusBadge';

const ServiceContainer = memo(({ 
  order, 
  item, 
  showAddressDetails, 
  onToggleAddressDetails 
}) => {
  if (!order || !item) {
    return null;
  }

  // Extract provider information - using API response structure
  const provider = item.provider || {};
  const providerName = `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || 'Provider';
  const providerImage = provider.image || '';
  const providerPhone = provider.phone || '';

  // Extract service information - using API response structure
  const rateCard = item.rateCard || {};
  const serviceName = rateCard.subcategory?.name || rateCard.category?.name || 'Service';
  const serviceImage = rateCard.subcategory?.image || rateCard.category?.image || '';
  const packageName = item.package?.name;



  // Extract pricing information - using API response structure (Flutter logic)
  const baseAmount = parseFloat(item.total_amount || '0');
  const totalAmount = Math.round(baseAmount); // Flutter shows rounded integers
  const discountAmount = parseFloat(item.discount_amount || '0');
  const strikePrice = parseFloat(rateCard.strike_price || '0');

  // Flutter logic: Only show discount if there's actual discount amount
  const hasDiscount = discountAmount > 0;
  const displayStrikePrice = hasDiscount ? Math.round(strikePrice) : 0;
  const discountPercentage = hasDiscount && strikePrice > 0 ? Math.round((discountAmount / strikePrice) * 100) : 0;

  // Extract address information - using API response structure
  const address = item.address || {};
  const fullAddress = [
    address.flat_no,
    address.building_name,
    address.street_address,
    address.city,
    address.state,
    address.postal_code
  ].filter(Boolean).join(', ');

  // Extract booking date and time - using API response structure
  const bookingDate = item.booking_date;
  const bookingTimeFrom = item.booking_time_from;
  const bookingTimeTo = item.booking_time_to;

  // Status is handled by OrderStatusBadge component

  // Format date and time
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
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

  // Handle phone call
  const handleCall = () => {
    if (providerPhone) {
      window.open(`tel:${providerPhone}`, '_self');
    }
  };

  return (
    <Card className="overflow-hidden mobile-order-card mobile-service-container">
      <CardContent className="p-0">
        {/* Mobile Service Information - Exact Flutter Layout */}
        <div className="md:hidden p-5">
          <div className="flex items-start space-x-4">
            {/* Service Image - Exact 89x89 Flutter dimensions */}
            <div className="w-[89px] h-[89px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {serviceImage ? (
                <>
                  <img
                    src={serviceImage}
                    alt={serviceName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <span className="text-orange-600 font-medium text-lg">
                      {serviceName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-orange-600 font-medium text-lg">
                    {serviceName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Service Details - Flutter Layout (No Provider Info) */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {serviceName}
              </h3>

              {/* Pricing Row - Flutter Style */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
                {hasDiscount && displayStrikePrice > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{displayStrikePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && discountPercentage > 0 && (
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded h-6 min-w-[60px] flex items-center justify-center">
                    {discountPercentage}%
                  </div>
                )}
              </div>
            </div>

            {/* Call Button - Flutter Style */}
            <div className="flex flex-col items-end space-y-3">
              {providerPhone && (
                <button
                  onClick={handleCall}
                  className="mobile-call-button w-[18px] h-[18px] flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Divider - Flutter Style */}
          <div className="w-full h-px bg-gray-200 my-3"></div>

          {/* Service Details Toggle and Status - Flutter Layout */}
          <div className="flex items-center justify-between">
            <button
              onClick={onToggleAddressDetails}
              className="mobile-toggle-button flex items-center space-x-1 text-sm text-gray-600 underline"
            >
              <span>Service Details</span>
              {showAddressDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <OrderStatusBadge status={item.status} size="sm" />
          </div>

          {/* Expandable Address Details - Mobile */}
          {showAddressDetails && (
            <div className="mt-4 space-y-2">
              {fullAddress && (
                <p className="text-sm text-gray-600 leading-relaxed">{fullAddress}</p>
              )}
              <p className="text-sm text-gray-600">
                +{order.countryCode || '91'} {order.phone || 'N/A'}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(bookingDate)} | {formatTime(bookingTimeFrom)}
              </p>
            </div>
          )}
        </div>

        {/* Desktop Service Information */}
        <div className="hidden md:block p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {/* Service Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {serviceImage ? (
                  <img
                    src={serviceImage}
                    alt={serviceName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <span className="text-orange-600 font-medium text-lg">
                      {serviceName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {serviceName}
                </h3>
                {packageName && (
                  <p className="text-sm text-gray-500 mb-2">Package: {packageName}</p>
                )}
                
                {/* Price Information */}
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && displayStrikePrice > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{displayStrikePrice.toLocaleString('en-IN')}
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {/* Additional badges */}
                <div className="flex items-center space-x-2 mt-2">
                  {rateCard.recommended && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Recommended
                    </Badge>
                  )}
                  {rateCard.bestDeal && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      Best Deal
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Call Button and Status */}
            <div className="flex flex-col items-end space-y-3">
              {providerPhone && (
                <Button
                  onClick={handleCall}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
              
              <OrderStatusBadge status={item.status} size="md" />
            </div>
          </div>
        </div>

        {/* Desktop Expandable Service Details */}
        <div className="hidden md:block border-b border-gray-100">
          <Button
            variant="ghost"
            onClick={onToggleAddressDetails}
            className="w-full p-4 justify-between text-left hover:bg-gray-50 rounded-none"
          >
            <span className="font-medium text-gray-900">Service Details</span>
            {showAddressDetails ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </Button>
          
          {showAddressDetails && (
            <div className="px-6 pb-6 space-y-4">

              {/* Address */}
              {fullAddress && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Service Address</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{fullAddress}</p>
                  </div>
                </div>
              )}

              {/* Booking Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookingDate && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Service Date</p>
                      <p className="text-sm text-gray-600">{formatDate(bookingDate)}</p>
                    </div>
                  </div>
                )}

                {bookingTimeFrom && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Service Time</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(bookingTimeFrom)}
                        {bookingTimeTo && ` - ${formatTime(bookingTimeTo)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Service Details */}
              {(item.weight || item.created_at) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {item.weight && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Weight</p>
                      <p className="text-sm text-gray-600">{item.weight}</p>
                    </div>
                  )}
                  {item.createdAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Booked On</p>
                      <p className="text-sm text-gray-600">{formatDate(item.createdAt)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ServiceContainer.displayName = 'ServiceContainer';

export default ServiceContainer;
