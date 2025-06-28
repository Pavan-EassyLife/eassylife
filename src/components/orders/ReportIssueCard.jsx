import React, { memo, useState } from 'react';
import { AlertTriangle, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useOrderContext } from '../../contexts/OrderContext';

const ReportIssueCard = memo(({ order, item, existingReport }) => {
  const { reportIssue, loading, showIssueField, toggleIssueField } = useOrderContext();
  const [issue, setIssue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If issue already reported, show read-only view
  if (existingReport && existingReport.issue) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Issue Reported</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Submitted
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-900 mb-2">Your Report:</h4>
            <p className="text-sm text-gray-800">{existingReport.issue}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Issue Reported Successfully
                </h4>
                <p className="text-sm text-blue-800">
                  Our support team has been notified and will review your report. 
                  We'll contact you if we need additional information.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle issue submission
  const handleSubmit = async () => {
    if (!issue.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await reportIssue(item.id, issue.trim());
      if (result.success) {
        setIssue('');
        // The component will re-render with existingReport
      }
    } catch (error) {
      console.error('Failed to report issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Report an Issue</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleIssueField}
            className="text-gray-600 hover:text-orange-600"
          >
            {showIssueField ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Information Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">
                Experienced an issue?
              </h4>
              <p className="text-sm text-orange-800">
                Let us know if you faced any problems with this service. 
                Your feedback helps us maintain quality standards.
              </p>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
          <p className="text-sm text-gray-600">
            {item.rateCard?.subcategory?.name || item.rateCard?.category?.name || 'Service'}
          </p>
          {item.provider && (
            <p className="text-sm text-gray-500 mt-1">
              Provider: {item.provider.firstName} {item.provider.lastName}
            </p>
          )}
          {item.bookingDate && (
            <p className="text-sm text-gray-500 mt-1">
              Service Date: {new Date(item.bookingDate).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>

        {/* Issue Input Field - Expandable */}
        {showIssueField && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Describe the issue you experienced
              </label>
              
              <Textarea
                placeholder="Please provide details about the issue you faced with this service..."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={4}
                className="resize-none focus:ring-orange-500 focus:border-orange-500"
                maxLength={1000}
              />
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Be specific to help us address the issue effectively</span>
                <span>{issue.length}/1000</span>
              </div>
            </div>

            {/* Common Issues */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Common issues (click to add):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Service was delayed',
                  'Poor quality of work',
                  'Provider was unprofessional',
                  'Service was incomplete',
                  'Damage to property',
                  'Overcharging',
                  'Provider did not show up'
                ].map((commonIssue) => (
                  <Button
                    key={commonIssue}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!issue.includes(commonIssue)) {
                        setIssue(prev => prev ? `${prev}\n${commonIssue}` : commonIssue);
                      }
                    }}
                    className="text-xs border-gray-300 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                  >
                    {commonIssue}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!issue.trim() || isSubmitting || loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 transition-all duration-300"
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Report Issue
                  </>
                )}
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> All reports are reviewed by our quality team. 
                We may contact you for additional information if needed. 
                False reports may result in account restrictions.
              </p>
            </div>
          </div>
        )}

        {/* Call to Action when collapsed */}
        {!showIssueField && (
          <div className="text-center">
            <Button
              onClick={toggleIssueField}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
            >
              Report an Issue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ReportIssueCard.displayName = 'ReportIssueCard';

export default ReportIssueCard;
