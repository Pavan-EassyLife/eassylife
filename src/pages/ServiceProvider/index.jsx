import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ServiceProviderProvider } from '../../contexts/ServiceProviderContext';
import ServiceProviderContent from './ServiceProviderContent';
import '../../styles/serviceProvider.css';

/**
 * ServiceProvider - Main component with context provider and responsive layout
 * Uses Flutter-exact implementation for mobile UI with responsive web/tablet layouts
 * 
 * Flutter Reference:
 * - flutterapp/lib/modules/ServiceProvider/view/select_service_provider.dart
 * 
 * Route: /service-providers (no URL parameters - Flutter-style)
 * Navigation from: Service Details continue button with all data in state
 */
const ServiceProvider = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationData, setNavigationData] = useState(null);

  // Extract navigation data from location state (passed from Service Details)
  useEffect(() => {
    console.log('🔧 ServiceProvider: Initializing with location state:', {
      locationState: location.state
    });

    // Validate required navigation data (Flutter-style validation)
    const data = location.state || {};

    console.log('🔧 ServiceProvider: Navigation data validation:', {
      catIdValue: data.catIdValue,
      subCatIdValue: data.subCatIdValue,
      hasData: !!data,
      dataKeys: Object.keys(data)
    });

    // For direct access (testing), provide default data
    if (!data.catIdValue || data.catIdValue.trim() === '') {
      console.warn('⚠️ ServiceProvider: No navigation data found. Using test data for development.');

      // Use exact Flutter parameters for testing
      const testData = {
        catIdValue: '561c01d348b6d760413d99e9f6733ed6',
        subCatIdValue: '1bdfe916ddd7e7556863948ae35a8326',
        filterList: [
          {
            attribute_id: '0fe977f6dab2b2cf9860079de49a7691',
            option_id: '1bdfe916ddd7e7556863948ae35a8326'
          }
        ],
        serviceNameValue: 'AC Service',
        timeRequired: '60 minutes',
        addressValue: null,
        date: '',
        timeFrom: '',
        timeTo: '',
        catName: 'AC Service',
        subCatName: '',
        segmentId: '1566ba3af15a95c202eb4d93bb059d4c',
        serviceName: 'AC Service',
        subServiceName: ''
      };

      console.log('🔧 ServiceProvider: Using test data:', testData);
      setNavigationData(testData);
      return;
    }

    // subCatIdValue can be empty string for services without subcategories - use catIdValue as fallback
    if (!data.subCatIdValue || data.subCatIdValue.trim() === '') {
      console.warn('⚠️ ServiceProvider: Empty subCatIdValue, using catIdValue as fallback');
      data.subCatIdValue = data.catIdValue;
    }

    // Extract navigation data from Flutter SelectServiceProviderScreen parameters
    
    // Set default values matching Flutter implementation
    const processedData = {
      // Required parameters (matching Flutter constructor)
      catIdValue: data.catIdValue || '',
      subCatIdValue: data.subCatIdValue || '',
      filterList: data.filterList || [],
      serviceNameValue: data.serviceNameValue || data.serviceName || '',
      timeRequired: data.timeRequired || '',
      addressValue: data.addressValue || null,
      date: data.date || '',
      timeFrom: data.timeFrom || '',
      timeTo: data.timeTo || '',
      catName: data.catName || data.serviceName || '',
      subCatName: data.subCatName || data.subServiceName || '',
      segmentId: data.segmentId || data.selectedSegmentId || '',

      // Additional data for navigation
      serviceName: data.serviceName || data.serviceNameValue || '',
      subServiceName: data.subServiceName || data.subCatName || ''
    };

    console.log('🔧 ServiceProvider: Processed navigation data:', processedData);
    setNavigationData(processedData);
  }, [location.state, navigate]);

  // Show loading while processing navigation data
  if (!navigationData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading service providers...</p>

          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <p>Location state: {JSON.stringify(location.state, null, 2)}</p>
              <p>API Base URL: {import.meta.env.VITE_API_BASE_URL_STAGING}</p>
              <p>API Version: {import.meta.env.VITE_API_VERSION}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
      <ServiceProviderProvider>
        {/* Mobile Layout (≤ 767px) - Flutter-exact full width */}
        <div className="min-[768px]:hidden service-provider-mobile-protection">
          <ServiceProviderContent
            navigationData={navigationData}
            layoutMode="mobile"
          />
        </div>

        {/* Tablet/Desktop Layout (≥ 768px) - Centered container */}
        <div className="hidden min-[768px]:block">
          <div className="service-provider-desktop-container py-6">
            <ServiceProviderContent
              navigationData={navigationData}
              layoutMode="desktop"
            />
          </div>
        </div>
      </ServiceProviderProvider>
    );
};

export default ServiceProvider;
