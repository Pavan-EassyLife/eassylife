import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Home Page Service - Flutter-aligned API integration
 * Handles all home page related API calls including banners, packages, services, etc.
 */
class HomePageService {
  /**
   * Get all home page data in a single call (Flutter-aligned)
   * This matches the Flutter app's FetchHomePageDataEvent
   * @returns {Promise<Object>} Complete home page data
   */
  async getHomePageData() {
    try {
      console.log('🚀 HomePageService: Fetching complete home page data...');

      // Parallel API calls for better performance (Flutter-aligned approach)
      const [
        bannersResponse,
        packagesResponse,
        servicesResponse,
        quickServicesResponse,
        mostBookedServicesResponse
      ] = await Promise.allSettled([
        this.getBanners(),
        this.getAllPackages(),
        this.getAllServices(),
        this.getQuickServices(),
        this.getMostBookedServices()
      ]);

      // Process responses and handle failures gracefully
      const result = {
        success: true,
        data: {
          banners: bannersResponse.status === 'fulfilled' ? bannersResponse.value.data : [],
          packages: packagesResponse.status === 'fulfilled' ? packagesResponse.value.data : [],
          services: servicesResponse.status === 'fulfilled' ? servicesResponse.value.data : [],
          quickServices: quickServicesResponse.status === 'fulfilled' ? quickServicesResponse.value.data : null,
          mostBookedServices: mostBookedServicesResponse.status === 'fulfilled' ? mostBookedServicesResponse.value.data : []
        },
        errors: []
      };

      // Log any failed requests
      [bannersResponse, packagesResponse, servicesResponse, quickServicesResponse, mostBookedServicesResponse]
        .forEach((response, index) => {
          if (response.status === 'rejected') {
            const apiNames = ['banners', 'packages', 'services', 'quickServices', 'mostBookedServices'];
            console.warn(`⚠️ HomePageService: ${apiNames[index]} API failed:`, response.reason);
            result.errors.push(`${apiNames[index]}: ${response.reason.message}`);
          }
        });

      console.log('✅ HomePageService: Home page data fetched successfully');
      return result;
    } catch (error) {
      console.error('❌ HomePageService: Error fetching home page data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch home page data');
    }
  }

  /**
   * Get banners for home page carousel
   * @returns {Promise<Object>} Banners data
   */
  async getBanners() {
    try {
      console.log('🎨 HomePageService: Fetching banners...');
      const response = await axiosInstance.get(API_ENDPOINTS.BANNERS);

      console.log('🎨 HomePageService: Banner API response:', {
        status: response.data.status,
        dataLength: response.data.data?.length || 0,
        fullResponse: response.data,
        requestHeaders: response.config?.headers,
        requestURL: response.config?.url
      });

      const bannerData = response.data.data || response.data.banners || [];

      // Transform banner data to match frontend expectations
      const transformedBanners = bannerData.map(banner => {
        console.log('🔄 HomePageService: Transforming banner:', {
          id: banner.id,
          title: banner.title,
          media_name: banner.media_name,
          originalBanner: banner
        });

        return {
          id: banner.id,
          title: banner.title,
          description: banner.description,
          // Map media_name to image for frontend compatibility
          image: banner.media_name,
          imageUrl: banner.media_name, // Backup property
          price: banner.price,
          originalPrice: banner.original_price || banner.strike_price,
          buttonText: banner.action || 'BOOK NOW!',
          actionUrl: banner.deep_link,
          isActive: banner.is_active === 1,
          displayOrder: banner.display_order,
          selectionType: banner.selection_type,
          selectionId: banner.selection_id,
          addToCart: banner.add_to_cart,
          // Overlay configuration - can be customized per banner
          overlay: banner.overlay || 'light', // none, light, medium, heavy
          overlayOpacity: banner.overlay_opacity || 0.15,
          overlayColor: banner.overlay_color || 'linear-gradient(-45deg, rgba(251, 146, 60, 0.1), rgba(234, 88, 12, 0.1))',
          overlayBlendMode: banner.overlay_blend_mode || 'multiply',
          // Include original data for debugging
          _original: banner
        };
      });

      // Temporary fallback: If no banners from API, provide default banner
      const fallbackBanners = transformedBanners.length === 0 ? [
        {
          id: 'fallback-1',
          title: 'Welcome to EassyLife',
          description: 'Your trusted service partner',
          image: null, // Will use gradient fallback
          price: null,
          originalPrice: null,
          buttonText: 'EXPLORE SERVICES',
          isActive: true,
          isFallback: true,
          // Overlay configuration
          overlay: 'light',
          overlayOpacity: 0.1,
          overlayBlendMode: 'multiply'
        }
      ] : transformedBanners;

      console.log('✅ HomePageService: Transformed banners:', fallbackBanners);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Banners fetched successfully',
        data: fallbackBanners,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching banners:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        headers: error.config?.headers,
        fullError: error
      });

      // If it's an authentication error, provide fallback banners
      if (error.response?.status === 401) {
        console.warn('⚠️ HomePageService: Authentication error, providing fallback banners');
        return {
          success: true,
          message: 'Using fallback banners due to authentication issue',
          data: [
            {
              id: 'fallback-auth-1',
              title: 'Pet Grooming',
              description: 'Professional pet grooming services at your doorstep',
              image: null, // Will use gradient fallback
              price: '299',
              originalPrice: '598',
              buttonText: 'BOOK NOW!',
              isActive: true,
              isFallback: true,
              authError: true,
              // Minimal overlay for fallback banners
              overlay: 'none'
            },
            {
              id: 'fallback-auth-2',
              title: 'Home Cleaning',
              description: 'Deep cleaning services for your home',
              image: null, // Will use gradient fallback
              price: '499',
              originalPrice: '999',
              buttonText: 'BOOK NOW!',
              isActive: true,
              isFallback: true,
              authError: true,
              // Minimal overlay for fallback banners
              overlay: 'none'
            }
          ],
        };
      }

      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch banners');
    }
  }

  /**
   * Get all packages for home page
   * @returns {Promise<Object>} Packages data
   */
  async getAllPackages() {
    try {
      console.log('📦 HomePageService: Fetching packages...');
      const response = await axiosInstance.get(API_ENDPOINTS.ALL_PACKAGES);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Packages fetched successfully',
        data: response.data.data || response.data.packages || [],
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching packages:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch packages');
    }
  }

  /**
   * Get all services for home page (Flutter-aligned with weight ordering)
   * @returns {Promise<Object>} Services data
   */
  async getAllServices() {
    try {
      console.log('🔧 HomePageService: Fetching services...');

      // Use the /categories/all endpoint to get all categories without pagination
      // Backend now handles filtering (is_home=1) and sorting (weight DESC)
      const response = await axiosInstance.get(`${API_ENDPOINTS.ALL_SERVICES}/all`);

      console.log('🔧 HomePageService: Services API response:', {
        status: response.data.status,
        dataLength: response.data.data?.length || 0,
        requestURL: response.config?.url,
        firstFewServices: response.data.data?.slice(0, 3).map(s => ({
          name: s.name,
          weight: s.weight,
          is_home: s.is_home
        }))
      });

      const services = response.data.data || response.data.services || [];

      return {
        success: response.data.status || true,
        message: response.data.message || 'Services fetched successfully',
        data: services,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching services:', error);

      // Fallback to paginated endpoint with larger size if /all endpoint fails
      try {
        console.log('🔧 HomePageService: Trying fallback with pagination...');
        const fallbackResponse = await axiosInstance.get(API_ENDPOINTS.ALL_SERVICES, {
          params: { size: 50 } // Get up to 50 categories
        });

        let fallbackServices = fallbackResponse.data.data || [];

        if (fallbackServices.length > 0) {
          // Apply filtering and sorting for fallback
          const homeServices = fallbackServices.filter(service => service.is_home === 1);
          homeServices.sort((a, b) => (b.weight || 0) - (a.weight || 0));
          fallbackServices = homeServices;

          console.log('🔧 HomePageService: Fallback services processed:', {
            originalCount: fallbackResponse.data.data?.length || 0,
            homeServicesCount: fallbackServices.length,
            sortedByWeight: fallbackServices.slice(0, 5).map(s => ({ name: s.name, weight: s.weight }))
          });
        }

        return {
          success: fallbackResponse.data.status || true,
          message: fallbackResponse.data.message || 'Services fetched successfully (fallback)',
          data: fallbackServices,
        };
      } catch (fallbackError) {
        console.error('❌ HomePageService: Fallback also failed:', fallbackError);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch services');
      }
    }
  }

  /**
   * Get quick services for home page
   * @returns {Promise<Object>} Quick services data
   */
  async getQuickServices() {
    try {
      console.log('⚡ HomePageService: Fetching quick services...');
      const response = await axiosInstance.get(API_ENDPOINTS.QUICK_SERVICES);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Quick services fetched successfully',
        data: response.data.data || response.data.quickServices || null,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching quick services:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quick services');
    }
  }

  /**
   * Get most booked services for home page
   * @returns {Promise<Object>} Most booked services data
   */
  async getMostBookedServices() {
    try {
      console.log('🔥 HomePageService: Fetching most booked services...');
      const response = await axiosInstance.get(API_ENDPOINTS.MOST_BOOKED_SERVICES);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Most booked services fetched successfully',
        data: response.data.data || response.data.categories || [],
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching most booked services:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch most booked services');
    }
  }

  /**
   * Check for completed bookings (Flutter-aligned)
   * @returns {Promise<Object>} Completed booking status
   */
  async checkCompletedBooking() {
    try {
      console.log('✅ HomePageService: Checking completed bookings...');
      const response = await axiosInstance.get(API_ENDPOINTS.CHECK_COMPLETED_BOOKING);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Completed booking check successful',
        data: response.data.data || null,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error checking completed bookings:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check completed bookings');
    }
  }

  /**
   * Check for partial payment bookings (Flutter-aligned)
   * @returns {Promise<Object>} Partial payment booking status
   */
  async checkPartialPaymentBooking() {
    try {
      console.log('💰 HomePageService: Checking partial payment bookings...');
      const response = await axiosInstance.get(API_ENDPOINTS.CHECK_PARTIAL_PAYMENT_BOOKING);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Partial payment booking check successful',
        data: response.data.data || null,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error checking partial payment bookings:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check partial payment bookings');
    }
  }

  /**
   * Search services and packages
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Search results
   */
  async searchServices(query, filters = {}) {
    try {
      console.log('🔍 HomePageService: Searching services:', query);
      const params = {
        q: query,
        ...filters
      };

      const response = await axiosInstance.get(API_ENDPOINTS.SEARCH, { params });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Search completed successfully',
        data: response.data.data || response.data.results || [],
      };
    } catch (error) {
      console.error('❌ HomePageService: Error searching services:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to search services');
    }
  }

  /**
   * Get package details by ID
   * @param {string} packageId - Package ID
   * @returns {Promise<Object>} Package details
   */
  async getPackageDetails(packageId) {
    try {
      console.log('📦 HomePageService: Fetching package details for ID:', packageId);
      const response = await axiosInstance.get(`${API_ENDPOINTS.ALL_PACKAGES}/${packageId}`);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Package details fetched successfully',
        data: response.data.data || response.data.package || null,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching package details:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch package details');
    }
  }

  /**
   * Get service details by ID
   * @param {string} serviceId - Service ID
   * @returns {Promise<Object>} Service details
   */
  async getServiceDetails(serviceId) {
    try {
      console.log('🔧 HomePageService: Fetching service details for ID:', serviceId);
      const response = await axiosInstance.get(`${API_ENDPOINTS.ALL_SERVICES}/${serviceId}`);

      return {
        success: response.data.status || true,
        message: response.data.message || 'Service details fetched successfully',
        data: response.data.data || response.data.service || null,
      };
    } catch (error) {
      console.error('❌ HomePageService: Error fetching service details:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch service details');
    }
  }
}

export default new HomePageService();
