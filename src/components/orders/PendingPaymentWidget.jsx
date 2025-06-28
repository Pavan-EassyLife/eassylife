import React, { memo } from 'react';
import { CreditCard, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const PendingPaymentWidget = memo(({ order, item }) => {
  if (!order || !item || item.isPartial !== 1) {
    return null;
  }

  // Extract payment information - using Flutter naming conventions
  const remainingPayment = parseFloat(order.remainingPayment || '0');
  const partialAmount = parseFloat(order.partialAmount || '0');
  const totalAmount = parseFloat(order.totalAmount || '0');

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  // Handle payment action
  const handlePayNow = () => {
    // TODO: Implement payment flow
    console.log('Navigate to payment for remaining amount:', remainingPayment);
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800">Pending Payment</span>
          </div>
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Partial
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Status Information */}
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-900 mb-2">
                Complete Your Payment
              </h4>
              <p className="text-sm text-orange-800 mb-3">
                You have made a partial payment. Please complete the remaining payment to unlock all service features.
              </p>
              
              {/* Payment Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-700">Total Amount</span>
                  <span className="font-medium text-orange-800">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-orange-700">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(partialAmount)}
                  </span>
                </div>
                
                <div className="border-t border-orange-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-orange-800">Remaining Amount</span>
                    <span className="font-bold text-orange-900">
                      {formatCurrency(remainingPayment)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">
                Limited Access
              </h4>
              <p className="text-sm text-yellow-800 mb-3">
                With partial payment, you have limited access to service features:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Only Start Service OTP is available</li>
                <li>• End Service OTP will be provided after full payment</li>
                <li>• Service completion requires remaining payment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePayNow}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Remaining {formatCurrency(remainingPayment)}
          </Button>
          
          <Button
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
          >
            View Payment Details
          </Button>
        </div>

        {/* Important Note */}
        <div className="text-center">
          <p className="text-xs text-orange-600">
            Complete payment to unlock full service features and End Service OTP
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

PendingPaymentWidget.displayName = 'PendingPaymentWidget';

export default PendingPaymentWidget;
