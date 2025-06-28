import React, { memo } from 'react';
import { Wallet, CreditCard, Gift, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const PaymentSummary = memo(({ order }) => {
  if (!order) {
    return null;
  }

  // Extract payment information - using API response structure
  const item = order.items?.[0] || {};

  // Flutter Logic: Use total_amount for service charges (this includes service + GST)
  const serviceAmount = parseFloat(item.total_amount || '0');
  const itemFinalAmount = parseFloat(item.final_amount || '0');

  // Use order-level amounts for overall totals and charges
  const totalAmount = parseFloat(order.total_amount || '0');
  const discountAmount = parseFloat(order.discount_amount || '0');
  const walletAmount = parseFloat(order.wallet_amount || '0');
  const convenienceCharge = parseFloat(order.convenience_charge || '0');
  const vipLifeDiscount = parseFloat(order.vip_life_discount || '0');
  const tipPrice = parseFloat(order.tip_price || '0');
  const donationPrice = parseFloat(order.donation_price || '0');
  const isPartial = order.is_partial === 1;
  const partialAmount = parseFloat(order.partial_amount || '0');
  const remainingPayment = parseFloat(order.remaining_payment || '0');

  // Extract GST information - use item-level GST for accuracy
  const sgstAmount = parseFloat(item.sgst_amount || order.sgst_amount || '0');
  const cgstAmount = parseFloat(item.cgst_amount || order.cgst_amount || '0');
  const igstAmount = parseFloat(item.igst_amount || order.igst_amount || '0');
  const totalGst = parseFloat(item.total_gst || order.total_gst || '0');

  // Flutter calculation: service (includes GST) + convenience charge
  const calculatedTotal = Math.round(serviceAmount + convenienceCharge);
  const finalAmount = calculatedTotal;



  // Extract coupon information
  const couponName = order.coupon_name;
  const promocode = order.promocode;

  // Extract VIP information
  const vipPrice = parseFloat(order.vip_price || '0');
  const donationName = order.donation_name;

  // Service charges should be the base service amount (item.totalAmount)
  // This is the actual service cost before GST and other charges
  const serviceCharges = serviceAmount;

  // Payment method information
  const paymentType = order.payment_type;
  const paymentStatus = order.payment_status;

  // Format currency - Flutter style (rounded integers)
  const formatCurrency = (amount) => {
    return `₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;
  };

  // Get payment status badge
  const getPaymentStatusBadge = () => {
    const statusConfig = {
      'paid': { color: 'bg-green-100 text-green-800', label: 'Paid' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Paid' },
      'pending': { color: 'bg-orange-100 text-orange-800', label: 'Pending' },
      'failed': { color: 'bg-red-100 text-red-800', label: 'Failed' },
      'partial': { color: 'bg-blue-100 text-blue-800', label: 'Partial' }
    };

    const config = statusConfig[paymentStatus] || statusConfig['pending'];

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-gray-600" />
            <span>Payment Summary</span>
          </div>
          {getPaymentStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Service Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Number of Services</span>
            <span className="font-medium">{order.items?.length || 1}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Service Charges</span>
            <span className="font-medium">{formatCurrency(serviceCharges)}</span>
          </div>

          {/* Tax and other charges - Flutter style (only convenience charge) */}
          {convenienceCharge > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax and other charges</span>
              <span className="font-medium">{formatCurrency(convenienceCharge)}</span>
            </div>
          )}

          {/* Tip */}
          {tipPrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tip</span>
              <span className="font-medium">{formatCurrency(tipPrice)}</span>
            </div>
          )}

          {/* Donation */}
          {donationPrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {donationName || 'Donation'}
              </span>
              <span className="font-medium">{formatCurrency(donationPrice)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Discounts and Offers */}
        <div className="space-y-3">
          {/* Coupon Discount */}
          {discountAmount > 0 && (couponName || promocode) && (
            <div className="flex justify-between items-center text-green-600">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>Discount ({couponName || promocode})</span>
              </div>
              <span className="font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          {/* VIP Life Discount */}
          {vipLifeDiscount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>VIP Life Discount</span>
              </div>
              <span className="font-medium">-{formatCurrency(vipLifeDiscount)}</span>
            </div>
          )}

          {/* VIP Membership */}
          {vipPrice > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">VIP Membership</span>
              <span className="font-medium">{formatCurrency(vipPrice)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="space-y-3">
          {/* Wallet Usage */}
          {walletAmount > 0 && (
            <div className="flex justify-between items-center text-blue-600">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Wallet Used</span>
              </div>
              <span className="font-medium">-{formatCurrency(walletAmount)}</span>
            </div>
          )}

          {/* Payment Method */}
          {paymentType && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Payment Method</span>
              </div>
              <span className="font-medium capitalize">{paymentType}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total Amount */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Grand Total</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>

          {/* Partial Payment Information - Handled by PartialPaymentDetails component */}
        </div>

        {/* Payment Status Information */}
        {paymentStatus === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Payment Pending</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your payment is being processed. You will receive a confirmation once completed.
            </p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Payment Failed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Your payment could not be processed. Please try again or contact support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PaymentSummary.displayName = 'PaymentSummary';

export default PaymentSummary;
