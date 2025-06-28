import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import serviceDetailsService from '../api/services/serviceDetailsService';
import { Loader2 } from 'lucide-react';

/**
 * ServiceRedirectHandler - Handles old /service/:serviceId routes
 * 
 * Implements Flutter navigation logic:
 * - Fetches service data to check for subcategories
 * - If subcategories exist: redirect to /service-selection/:categoryId
 * - If no subcategories: redirect to /service-details/:serviceId
 * 
 * This ensures backward compatibility while maintaining the new two-page flow
 */
const ServiceRedirectHandler = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (serviceId) {
      handleServiceRedirect();
    }
  }, [serviceId]);

  const handleServiceRedirect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sub-services to check if this service has subcategories
      const response = await serviceDetailsService.getSubServices(serviceId);
      
      if (response.success && response.data) {
        const subcategories = response.data.subcategories || [];
        
        // Flutter logic: if subcategories.isEmpty -> ServiceDetailsScreen, else -> SelectServiceScreen
        if (subcategories.length > 0) {
          // Has subcategories - redirect to service selection page
          navigate(`/service-selection/${serviceId}`, { replace: true });
        } else {
          // No subcategories - redirect to service details page
          navigate(`/service-details/${serviceId}`, { replace: true });
        }
      } else {
        // If we can't determine subcategories, default to service details
        navigate(`/service-details/${serviceId}`, { replace: true });
      }
    } catch (err) {
      console.error('Error checking service subcategories:', err);
      // On error, default to service details page
      navigate(`/service-details/${serviceId}`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while determining redirect
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Loading Service</h2>
          <p className="text-gray-500">Determining the best view for you...</p>
        </div>
      </div>
    );
  }

  // Show error state (though this should rarely be seen due to automatic redirect)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Service Not Found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't load the requested service. Please try again or go back to the home page.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // This should not be reached due to redirects, but provide fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
};

export default ServiceRedirectHandler;
