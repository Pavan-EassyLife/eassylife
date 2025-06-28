import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Phone, MapPin, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useOrderContext } from '../../contexts/OrderContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import ServiceContainer from '../../components/orders/ServiceContainer';
import CancelledServiceContainer from '../../components/orders/CancelledServiceContainer';
import PaymentSummary from '../../components/orders/PaymentSummary';

import OTPDisplay from '../../components/orders/OTPDisplay';
import RatingCard from '../../components/orders/RatingCard';
import ReportIssueCard from '../../components/orders/ReportIssueCard';
import CancelOrderModal from '../../components/orders/CancelOrderModal';
import RescheduleOrderModal from '../../components/orders/RescheduleOrderModal';
import PartialPaymentDetails from '../../components/orders/PartialPaymentDetails';


const OrderDetailPage = () => {
  const { orderId, itemId } = useParams();
  const navigate = useNavigate();
  const {
    currentOrder,
    orderDetailLoading,
    error,
    fetchOrderDetail,
    showAddressDetails,
    toggleAddressDetails,
    clearError,
    clearCurrentOrder
  } = useOrderContext();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Clear current order and fetch new order details when params change
  useEffect(() => {
    if (orderId && itemId) {
      // Clear the current order first to prevent showing stale data
      clearCurrentOrder();

      fetchOrderDetail(orderId, itemId).catch((error) => {
        console.error('Failed to fetch order details:', error);
      });
    }
  }, [orderId, itemId, fetchOrderDetail, clearCurrentOrder]);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Memoized handlers for performance optimization
  const handleBack = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  // Memoized data extraction for performance - Exact Flutter naming conventions and data access
  const orderData = useMemo(() => {
    const item = currentOrder?.items?.[0];
    const orderNumber = item?.order_id ? `#${item.order_id}` : '#000000';

    // Status mapping - Flutter converts 'running' to 'In progress'
    const rawStatus = item?.status || 'unknown';
    const status = rawStatus === 'running' ? 'In progress' : rawStatus;

    // Debug logging
    console.log('Order Debug Info:', {
      rawStatus,
      status,
      startServiceOtp: item?.start_service_otp,
      endServiceOtp: item?.end_service_otp,
      isPartial: parseInt(item?.is_partial),
      shouldShowOTP: status === 'accepted' && (item?.start_service_otp || item?.end_service_otp),
      orderNumber: item?.order_id,
      providerName: `${item?.provider?.first_name || ''} ${item?.provider?.last_name || ''}`.trim(),
      serviceName: item?.rateCard?.subcategory?.name || item?.rateCard?.category?.name
    });

    // Extract OTP information - API field mapping
    const startServiceOtp = item?.start_service_otp;
    const endServiceOtp = item?.end_service_otp;

    // Partial payment check - API uses is_partial
    const isPartial = parseInt(item?.is_partial) === 1;

    // Provider information - API structure mapping
    const providerFirstName = item?.provider?.first_name || '';
    const providerLastName = item?.provider?.last_name || '';
    const providerName = `${providerFirstName} ${providerLastName}`.trim();
    const providerPhone = item?.provider?.phone || '';
    const providerImage = item?.provider?.image || '';

    // Service information - API rateCard structure
    const serviceName = item?.rateCard?.subcategory?.name || item?.rateCard?.category?.name || '';
    const serviceImage = item?.rateCard?.subcategory?.image || item?.rateCard?.category?.image || item?.provider?.image || '';

    // Pricing information - API field mapping
    const totalAmount = item?.total_amount || currentOrder?.total_amount || '0';
    const discountAmount = item?.discount_amount || currentOrder?.discount_amount || '0';

    // Address information - API address structure
    const address = item?.address;
    const fullAddress = address ?
      `${address.flat_no || ''}, ${address.building_name || ''}, ${address.street_address || ''}, ${address.city || ''}, ${address.state || ''}, ${address.postal_code || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
      : '';

    // Booking date and time - API field mapping
    const bookingDate = item?.booking_date;
    const bookingTimeFrom = item?.booking_time_from;
    const bookingTimeTo = item?.booking_time_to;

    // Cancel information - API field mapping
    const cancelBy = item?.cancel_by;
    const cancelReason = item?.cancel_reason;

    return {
      item,
      orderNumber,
      status,
      startServiceOtp,
      endServiceOtp,
      isPartial,
      providerName,
      providerPhone,
      providerImage,
      serviceName,
      serviceImage,
      totalAmount,
      discountAmount,
      fullAddress,
      bookingDate,
      bookingTimeFrom,
      bookingTimeTo,
      cancelBy,
      cancelReason
    };
  }, [currentOrder]);

  // Destructure memoized data
  const {
    item,
    orderNumber,
    status,
    startServiceOtp,
    endServiceOtp,
    isPartial,
    providerName,
    providerPhone,
    providerImage,
    serviceName,
    serviceImage,
    totalAmount,
    discountAmount,
    fullAddress,
    bookingDate,
    bookingTimeFrom,
    bookingTimeTo,
    cancelBy,
    cancelReason
  } = orderData;

  // Handle download invoice
  const handleDownload = useCallback(() => {
    // Check if invoice URL is available
    const invoiceUrl = currentOrder?.invoice || item?.invoice;

    if (invoiceUrl && invoiceUrl !== 'https://eassylife.in/public/no-image.png') {
      // Open invoice in new tab
      window.open(invoiceUrl, '_blank');
    } else {
      // Show message that invoice is not ready yet
      alert('Invoice not prepared yet');
    }
  }, [currentOrder?.invoice, item?.invoice]);

  // Handle successful cancel/reschedule
  const handleModalSuccess = useCallback(() => {
    // Refresh order details after successful action
    if (orderId && itemId) {
      fetchOrderDetail(orderId, itemId);
    }
  }, [orderId, itemId, fetchOrderDetail]);



  // Loading state
  if (orderDetailLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-orange-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-orange-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Order #{item?.order_id || 'NA'}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchOrderDetail(orderId, itemId)}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No order data
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-orange-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Order #{item?.order_id || 'NA'}</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Order not found</p>
              <Button onClick={handleBack} className="mt-4">
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Bar - Exact Flutter Implementation */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBack}
              className="w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              Order #{item?.order_id || 'NA'}
            </h1>
          </div>
          <button
            onClick={handleDownload}
            className="w-7 h-7 flex items-center justify-center"
          >
            <Download className="w-6 h-6 text-orange-500" />
          </button>
        </div>
      </div>

      {/* Desktop Page Header */}
      <div className="hidden md:block bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-600 hover:text-orange-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {status === 'cancelled' ? 'Cancelled Order' : `Order ${orderNumber}`}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Content - Simplified Scrolling */}
      <div className="md:hidden">
        <div className={`max-w-4xl mx-auto p-4 space-y-6 ${
          status === 'accepted' && !isPartial ? 'pb-24' : ''
        }`}>
        {/* Service Container - conditional based on status */}
        {status === 'cancelled' ? (
          <CancelledServiceContainer
            order={currentOrder}
            item={item}
          />
        ) : (
          <ServiceContainer
            order={currentOrder}
            item={item}
            showAddressDetails={showAddressDetails}
            onToggleAddressDetails={toggleAddressDetails}
          />
        )}

        {/* Conditional sections based on status - Exact Flutter Logic */}
        {status === 'completed' ? (
          <>
            {/* Payment Details for completed orders */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Details</span>
                  <span className="text-sm font-semibold">paid</span>
                </div>
              </CardContent>
            </Card>

            {/* Report Issue for completed orders */}
            <ReportIssueCard
              order={currentOrder}
              item={item}
              existingReport={item?.report}
            />

            {/* Rating for completed orders */}
            <RatingCard
              order={currentOrder}
              item={item}
              existingFeedback={item?.feedback}
            />
          </>
        ) : status === 'cancelled' ? (
          <>
            {/* Payment Details for cancelled orders */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Details</span>
                  <span className="text-sm font-semibold">paid</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Report Issue for In Progress orders */}
            {status === 'running' && (
              <ReportIssueCard
                order={currentOrder}
                item={item}
                existingReport={item?.report}
              />
            )}

            {/* OTP Display for accepted orders - Flutter Logic */}
            {status === 'accepted' && (startServiceOtp || endServiceOtp) && (
              <OTPDisplay
                startServiceOtp={startServiceOtp}
                endServiceOtp={endServiceOtp}
                isPartial={isPartial}
              />
            )}

            {/* Partial Payment Details - Exact Flutter Implementation */}
            {isPartial && (
              <PartialPaymentDetails
                order={currentOrder}
                item={item}
                orderId={orderId}
                itemId={itemId}
              />
            )}

            {/* Partial payment message - Exact Flutter Implementation */}
            {isPartial && (
              <div className="px-4">
                <p className="text-base font-medium text-black text-left">
                  Make the remaining amount paid to view (End OTP)
                </p>
              </div>
            )}


          </>
        )}

        {/* Payment Summary */}
        <PaymentSummary order={currentOrder} />

        {/* Mobile Bottom Action Buttons - Exact Flutter Implementation */}
        {status === 'accepted' && !isPartial && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white rounded-t-[30px] shadow-2xl border-t border-gray-100 mobile-bottom-actions" style={{
              boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.15)'
            }}>
              <div className="px-6 py-5 pb-8">
                <div className="flex space-x-4">
                  {/* Cancel Button - Home Page Style */}
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="mobile-order-detail-button flex-1 h-11 bg-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-400 hover:scale-105 hover:shadow-lg active:scale-95 active:bg-gray-500"
                    style={{
                      boxShadow: '0 2px 8px rgba(156, 163, 175, 0.3)'
                    }}
                  >
                    Cancel
                  </button>

                  {/* Reschedule Button - Home Page Style with Orange Gradient */}
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="mobile-order-detail-button flex-1 h-11 text-white font-medium rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95"
                    style={{
                      background: '#f97316',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ea580c';
                      e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f97316';
                      e.target.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.3)';
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Desktop Content without Pull-to-Refresh */}
      <div className="hidden md:block">
        <div className={`tablet-order-detail-content desktop-order-detail-content max-w-4xl mx-auto p-4 space-y-6 ${
          status === 'accepted' && !isPartial ? 'pb-4' : ''
        }`}>
          {/* Service Container - conditional based on status */}
          {status === 'cancelled' ? (
            <CancelledServiceContainer
              order={currentOrder}
              item={item}
            />
          ) : (
            <ServiceContainer
              order={currentOrder}
              item={item}
              showAddressDetails={showAddressDetails}
              onToggleAddressDetails={toggleAddressDetails}
            />
          )}

          {/* Conditional sections based on status - Exact Flutter Logic */}
          {status === 'completed' ? (
            <>
              {/* Payment Details for completed orders */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Details</span>
                    <span className="text-sm font-semibold">paid</span>
                  </div>
                </CardContent>
              </Card>

              {/* Report Issue for completed orders */}
              <ReportIssueCard
                order={currentOrder}
                item={item}
                existingReport={item?.report}
              />

              {/* Rating for completed orders */}
              <RatingCard
                order={currentOrder}
                item={item}
                existingFeedback={item?.feedback}
              />
            </>
          ) : status === 'cancelled' ? (
            <>
              {/* Payment Details for cancelled orders */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Details</span>
                    <span className="text-sm font-semibold">paid</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Report Issue for In Progress orders */}
              {status === 'running' && (
                <ReportIssueCard
                  order={currentOrder}
                  item={item}
                  existingReport={item?.report}
                />
              )}

              {/* OTP Display for accepted orders - Flutter Logic */}
              {status === 'accepted' && (startServiceOtp || endServiceOtp) && (
                <OTPDisplay
                  startServiceOtp={startServiceOtp}
                  endServiceOtp={endServiceOtp}
                  isPartial={isPartial}
                />
              )}

              {/* Partial Payment Details - Exact Flutter Implementation */}
              {isPartial && (
                <PartialPaymentDetails
                  order={currentOrder}
                  item={item}
                  orderId={orderId}
                  itemId={itemId}
                />
              )}

              {/* Partial payment message - Exact Flutter Implementation */}
              {isPartial && (
                <div className="px-4">
                  <p className="text-base font-medium text-black text-left">
                    Make the remaining amount paid to view (End OTP)
                  </p>
                </div>
              )}
            </>
          )}

          {/* Payment Summary */}
          <PaymentSummary order={currentOrder} />

          {/* Desktop Action Buttons for accepted orders (only for non-partial payments) */}
          {status === 'accepted' && !isPartial && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95"
                    style={{
                      boxShadow: '0 2px 8px rgba(156, 163, 175, 0.2)'
                    }}
                  >
                    Cancel Order
                  </Button>
                  <Button
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1 text-white font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95"
                    style={{
                      background: '#f97316',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ea580c';
                      e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f97316';
                      e.target.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.3)';
                    }}
                  >
                    Reschedule Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        order={currentOrder}
        item={item}
        onSuccess={handleModalSuccess}
      />

      {/* Reschedule Order Modal */}
      <RescheduleOrderModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        order={currentOrder}
        item={item}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default OrderDetailPage;
