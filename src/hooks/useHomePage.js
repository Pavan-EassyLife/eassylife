import { useState, useEffect, useRef } from 'react';
import homePageService from '../api/services/homePageService.js';

/**
 * Custom hook for home page data management
 * Handles API integration for banners, packages, services, and most booked services
 */
export const useHomePage = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [mostBookedServices, setMostBookedServices] = useState([]);
  const [error, setError] = useState(null);

  // Refs for tracking
  const hasInitialized = useRef(false);
  const isLoadingRef = useRef(false);

  // Fetch home page data from API
  const fetchHomePageData = async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('🔄 useHomePage: Already loading, skipping duplicate call');
      return;
    }

    console.log('🚀 useHomePage: Starting data fetch');
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await homePageService.getHomePageData();

      if (result.success) {
        console.log('✅ useHomePage: Data fetched successfully');
        setBanners(result.data.banners || []);
        setPackages(result.data.packages || []);
        setServices(result.data.services || []);
        setMostBookedServices(result.data.mostBookedServices || []);
        hasInitialized.current = true;
      } else {
        throw new Error('Failed to fetch home page data');
      }
    } catch (err) {
      console.error('❌ useHomePage: Error fetching data:', err);
      setError(err.message || 'Failed to load home page data');
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      console.log('🏁 useHomePage: Data fetch completed');
    }
  };

  // Auto-fetch data on mount - only once
  useEffect(() => {
    if (!hasInitialized.current && !isLoadingRef.current) {
      console.log('🎯 useHomePage: Initializing data fetch on mount');
      fetchHomePageData();
    }
  }, []); // Empty dependency array ensures this runs only once

  // Return state and functions
  return {
    loading,
    banners,
    packages,
    services,
    mostBookedServices,
    error,
    hasInitialized: hasInitialized.current,
    fetchHomePageData
  };
};
