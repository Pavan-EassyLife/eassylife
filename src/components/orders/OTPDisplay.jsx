import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const OTPDisplay = memo(({ startServiceOtp, endServiceOtp, isPartial = false }) => {
  // Don't render if no OTPs are available
  if (!startServiceOtp && !endServiceOtp) {
    return null;
  }

  // Format OTP for display (Flutter style - no spaces)
  const formatOtp = (otp) => {
    if (!otp) return '';
    return otp.toString();
  };



  return (
    <Card>
      {/* Mobile OTP Layout - Exact Flutter Implementation */}
      <div className="md:hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <span>Service OTP</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Information Banner - Clean Flutter Style */}
          <div className="p-3 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                {isPartial ? 'Single OTP Required' : 'Two OTPs Required'}
              </h4>
              <p className="text-xs text-gray-700">
                {isPartial
                  ? 'Share the Start Service OTP with your service provider to begin the service.'
                  : 'Share the Start Service OTP to begin and End Service OTP to complete the service.'
                }
              </p>
            </div>
          </div>

          {/* Horizontal OTP Layout - Flutter Style */}
          <div className="flex gap-3">
            {/* Start Service OTP */}
            {startServiceOtp && (
              <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {formatOtp(startServiceOtp)}
                </div>
                <div className="text-xs text-gray-600">Start Service OTP</div>
              </div>
            )}

            {/* End Service OTP - Only show for full payments */}
            {endServiceOtp && !isPartial && (
              <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {formatOtp(endServiceOtp)}
                </div>
                <div className="text-xs text-gray-600">End Service OTP</div>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      {/* Desktop OTP Layout - Simplified */}
      <div className="hidden md:block">
        <CardHeader>
          <CardTitle>
            <span>Service OTP</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Information Banner - Clean Style */}
          <div className="p-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {isPartial ? 'Single OTP Required' : 'Two OTPs Required'}
              </h4>
              <p className="text-sm text-gray-700">
                {isPartial
                  ? 'Share the Start Service OTP with your service provider to begin the service.'
                  : 'Share the Start Service OTP to begin and End Service OTP to complete the service.'
                }
              </p>
            </div>
          </div>

          {/* OTP Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Service OTP */}
            {startServiceOtp && (
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatOtp(startServiceOtp)}
                </div>
                <div className="text-sm text-gray-600">Start Service OTP</div>
              </div>
            )}

            {/* End Service OTP - Only show for full payments */}
            {endServiceOtp && !isPartial && (
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatOtp(endServiceOtp)}
                </div>
                <div className="text-sm text-gray-600">End Service OTP</div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

OTPDisplay.displayName = 'OTPDisplay';

export default OTPDisplay;
