import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Service Details Service - Flutter-aligned API integration
 * Handles all service details related API calls matching Flutter api_values.dart implementation
 * 
 * Flutter Methods Replicated:
 * - getServiceDetails(serviceId) → Flutter getServiceDetails()
 * - getSubServicesDetail(subServiceId) → Flutter getSubServicesDetail()
 * - getServiceDetailsBySegment(params) → Flutter getAboutServiceServiceDetail()
 */
class ServiceDetailsService {
  /**
   * Get service details by ID (main service)
   * Replicates Flutter: getServiceDetails(String serviceId, BuildContext context)
   * URL: UrlControllers.baseUrl + UrlControllers.serviceDetailURL + serviceId
   * 
   * @param {string} serviceId - Encrypted service ID
   * @returns {Promise<Object>} Service details with attributes, video, includes/excludes
   */
  async getServiceDetails(serviceId) {
    try {
      console.log('🔧 ServiceDetailsService: Fetching service details for ID:', serviceId);
      console.log('🔧 ServiceDetailsService: Using endpoint:', `${API_ENDPOINTS.SERVICE_DETAILS}/${serviceId}/`);

      // FIXED: Use proper versioned API endpoint with trailing slash (required by backend routes)
      // Backend route: router.get('/categories/:id/', apiAuth, categoryController.getCategoryById);
      const response = await axiosInstance.get(`categories/${serviceId}/`);

      console.log('🔧 ServiceDetailsService: Raw API response:', response.data);
      console.log('🔧 ServiceDetailsService: Response status:', response.status);
      console.log('🔧 ServiceDetailsService: Response structure:', {
        hasStatus: 'status' in response.data,
        statusValue: response.data.status,
        hasData: 'data' in response.data,
        hasMessage: 'message' in response.data,
        responseKeys: Object.keys(response.data)
      });

      // Match Flutter response handling EXACTLY
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          console.log('✅ ServiceDetailsService: Service details fetched successfully');
          console.log('✅ ServiceDetailsService: Service data structure:', {
            dataExists: !!response.data.data,
            dataKeys: response.data.data ? Object.keys(response.data.data) : 'No data'
          });
          return {
            success: true,
            message: response.data.message || 'Service details fetched successfully',
            data: response.data.data || null,
          };
        } else {
          console.log('❌ ServiceDetailsService: API returned false status:', response.data.message);
          console.log('❌ ServiceDetailsService: Full error response:', response.data);
          // Throw error to trigger fallback mechanism
          throw new Error(response.data.message || 'Failed to fetch service details');
        }
      } else {
        console.log('❌ ServiceDetailsService: Invalid response format:', response.data);
        return {
          success: false,
          message: 'Invalid response format',
          data: null,
        };
      }
    } catch (error) {
      console.error('❌ ServiceDetailsService: API error:', error);
      console.error('❌ ServiceDetailsService: Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch service details');
    }
  }

  /**
   * Get sub-service details by ID
   * Replicates Flutter: getSubServicesDetail(String subServiceId, BuildContext context)
   * URL: UrlControllers.baseUrl + UrlControllers.subServicesDetailURL + subServiceId
   * 
   * @param {string} subServiceId - Encrypted sub-service ID  
   * @returns {Promise<Object>} Sub-service details
   */
  async getSubServiceDetails(subServiceId) {
    try {
      // FIXED: Use proper versioned API endpoint with trailing slash (required by backend routes)
      // Backend route: router.get('/sub-category/:id/', apiAuth, subcategoryController.getSubcategoryById);
      const response = await axiosInstance.get(`sub-category/${subServiceId}/`);

      // Match Flutter response handling
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          return {
            success: true,
            message: response.data.message || 'Sub-service details fetched successfully',
            data: response.data.data || null,
          };
        } else {
          return {
            success: false,
            message: response.data.message || 'Failed to fetch sub-service details',
            data: null,
          };
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format',
          data: null,
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sub-service details');
    }
  }

  /**
   * Get service details by segment with filters
   * Replicates Flutter: getAboutServiceServiceDetail({catId, subCatId, segementId, attributeList, context})
   * URL: UrlControllers.baseUrl + UrlControllers.aboutServiceDetailURL
   * 
   * @param {Object} params - Filter parameters matching Flutter payload structure
   * @param {string} params.category_id - Encrypted category ID
   * @param {string} params.subcategory_id - Encrypted subcategory ID (can be empty)
   * @param {string} params.segment_id - Encrypted segment ID (can be empty)
   * @param {Array} params.attribute - Array of attribute selections [{attribute_id, option_id}]
   * @returns {Promise<Object>} Filtered service segments
   */
  async getServiceDetailsBySegment(params) {
    try {
      // Match Flutter payload structure exactly
      const payload = {
        category_id: params.category_id || '',
        subcategory_id: params.subcategory_id || '',
        segment_id: params.segment_id || '',
        attribute: params.attribute || []
      };

      // Match Flutter URL: baseUrl + aboutServiceDetailURL
      const response = await axiosInstance.post(API_ENDPOINTS.SERVICE_DETAILS_BY_SEGMENT, payload);

      // Match Flutter response handling: return response['status'] == true ? response['data'] : response['response']
      if (response.data === null) {
        return {
          success: false,
          message: 'No response received',
          data: [],
        };
      }

      const isSuccess = response.data.status === true;
      const responseData = isSuccess ? response.data.data : response.data.response;

      return {
        success: isSuccess,
        message: response.data.message || (isSuccess ? 'Service segments fetched successfully' : 'Failed to fetch service segments'),
        data: responseData || [],
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch service segments');
    }
  }

  /**
   * Get sub-services for a category (used in sub-service selection flow)
   * Replicates Flutter: getSubServices(String serviceId, BuildContext context)
   * URL: UrlControllers.baseUrl + UrlControllers.subServicesURL + serviceId
   * 
   * @param {string} serviceId - Service ID to get sub-services for
   * @returns {Promise<Object>} Sub-services list
   */
  async getSubServices(serviceId) {
    try {
      // Note: This endpoint uses 'sub-category/category/' prefix in Flutter
      const response = await axiosInstance.get(`${API_ENDPOINTS.SUB_SERVICE_DETAILS}/category/${serviceId}/`);

      // Match Flutter response handling
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          return {
            success: true,
            message: response.data.message || 'Sub-services fetched successfully',
            data: response.data.data || [],
          };
        } else {
          return {
            success: false,
            message: response.data.message || 'Failed to fetch sub-services',
            data: [],
          };
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format',
          data: [],
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sub-services');
    }
  }

  /**
   * Helper method to validate service details response structure
   * Ensures all required Flutter ServiceDetailsModel fields are present
   * 
   * @param {Object} serviceData - Service data from API response
   * @returns {Object} Validated and normalized service data
   */
  validateServiceDetailsResponse(serviceData) {
    if (!serviceData) return null;

    // Flutter ServiceDetailsModel field mappings
    const validatedData = {
      id: serviceData.id || '',
      category_id: serviceData.category_id || '',
      name: serviceData.name || '',
      image: serviceData.image || '',
      service_time: serviceData.service_time || serviceData.serviceTime || '',
      exclude_heading: serviceData.exclude_heading || serviceData.excludeHeading || '',
      exclude_description: serviceData.exclude_description || serviceData.excludeDescription || '',
      meta_description: serviceData.meta_description || serviceData.metaDescription || '',
      serviceVideos: serviceData.serviceVideos || null,
      attributes: serviceData.attributes || {},
      includeItems: serviceData.includeItems || [],
      excludeItems: serviceData.excludeItems || [],
      excludedImages: serviceData.excludedImages || [],
      isFavourite: serviceData.isFavourite || false,
      favouriteId: serviceData.favouriteId || null
    };

    return validatedData;
  }
}

export default new ServiceDetailsService();
