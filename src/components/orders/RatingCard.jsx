import React, { memo, useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { useOrderContext } from '../../contexts/OrderContext';

const RatingCard = memo(({ order, item, existingFeedback }) => {
  const { submitFeedback, loading } = useOrderContext();
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If feedback already exists, show read-only view
  if (existingFeedback && existingFeedback.rating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Your Feedback</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Submitted
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Rating Display */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Your Rating:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= existingFeedback.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-900">
                {existingFeedback.rating}/5
              </span>
            </div>
          </div>

          {/* Comment Display */}
          {existingFeedback.comment && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Your Comment:</span>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-sm text-gray-800">{existingFeedback.comment}</p>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              Thank you for your feedback! It helps us improve our services.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle rating click
  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  // Handle rating hover
  const handleRatingHover = (hoveredStar) => {
    setHoveredRating(hoveredStar);
  };

  // Handle rating hover leave
  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  // Handle feedback submission
  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitFeedback(item.id, rating, comment.trim());
      if (result.success) {
        // Feedback submitted successfully - the component will re-render with existingFeedback
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get rating text
  const getRatingText = (ratingValue) => {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[ratingValue] || '';
  };

  const displayRating = hoveredRating || rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Rate Your Experience</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Service Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Service Completed</h4>
          <p className="text-sm text-gray-600">
            {item.rateCard?.subcategory?.name || item.rateCard?.category?.name || 'Service'}
          </p>
          {item.provider && (
            <p className="text-sm text-gray-500 mt-1">
              by {item.provider.firstName} {item.provider.lastName}
            </p>
          )}
        </div>

        {/* Rating Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            How would you rate this service?
          </label>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded transition-all duration-150"
                >
                  <Star
                    className={`w-8 h-8 transition-colors duration-150 ${
                      star <= displayRating
                        ? 'text-yellow-400 fill-current hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {displayRating > 0 && (
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-lg font-semibold text-gray-900">
                  {displayRating}/5
                </span>
                <Badge className="bg-orange-100 text-orange-800">
                  {getRatingText(displayRating)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Share your experience (optional)
          </label>
          
          <Textarea
            placeholder="Tell us about your experience with this service..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none focus:ring-orange-500 focus:border-orange-500"
            maxLength={500}
          />
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Your feedback helps us improve our services</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting || loading}
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
                Submit Feedback
              </>
            )}
          </Button>
        </div>

        {/* Encouragement Message */}
        {rating === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Your feedback matters!
                </h4>
                <p className="text-sm text-blue-800">
                  Please rate your experience to help us serve you better and help other customers make informed decisions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RatingCard.displayName = 'RatingCard';

export default RatingCard;
