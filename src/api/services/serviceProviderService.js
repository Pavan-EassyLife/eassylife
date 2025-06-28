import axiosInstance from '../axiosInstance.js';
import { API_CONFIG } from '../config.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Service Provider Service - Flutter-aligned API integration
 * Handles service provider listing and add to cart functionality
 * Based on Flutter ServiceProviderBloc and API implementation
 */
class ServiceProviderService {
  /**
   * Get service providers based on category, subcategory, and filters
   * Matches Flutter apiValue.getServiceProvider method
   * @param {Object} params - Service provider fetch parameters
   * @param {string} params.catId - Category ID
   * @param {string} params.subCatId - Subcategory ID
   * @param {Array} params.attributeList - Filter attributes list
   * @param {string} params.segmentId - Segment ID
   * @param {string} [params.page='1'] - Page number
   * @param {string} [params.size='10'] - Page size
   * @returns {Promise<Object>} Service providers response
   */
  async getServiceProviders({
    catId,
    subCatId,
    attributeList,
    segmentId,
    page = '1',
    size = '10',
    bookingDate = null,
    bookingTimeFrom = null,
    bookingTimeTo = null
  }) {
    try {
      console.log('🔧 ServiceProviderService: Fetching service providers...', {
        catId,
        subCatId,
        attributeList,
        attributeCount: attributeList?.length || 0,
        segmentId,
        segmentIdType: typeof segmentId,
        segmentIdLength: segmentId?.length,
        isSegmentIdEmpty: !segmentId,
        page,
        size,
        bookingParams: {
          bookingDate,
          bookingTimeFrom,
          bookingTimeTo,
          hasBookingParams: !!(bookingDate && bookingTimeFrom && bookingTimeTo)
        }
      });

      // Log attribute details for debugging
      if (attributeList && attributeList.length > 0) {
        console.log('🔧 ServiceProviderService: Attribute details:');
        attributeList.forEach((attr, index) => {
          console.log(`  ${index + 1}. ${attr.attribute_id} = ${attr.option_id}`);
        });
      } else {
        console.log('🔧 ServiceProviderService: No attributes to send (matching Flutter behavior)');
      }

      // Validate required parameters
      if (!catId || !subCatId) {
        console.error('❌ ServiceProviderService: Missing required parameters:', {
          catId: !!catId,
          subCatId: !!subCatId
        });
        return {
          success: false,
          message: 'Missing required category or subcategory ID'
        };
      }

      // Transform attribute list to match Flutter implementation
      const itemList = [];
      for (const item of attributeList) {
        // Extract actual IDs from the attribute structure
        const attributeId = item.attribute_id?.id || item.attribute_id;
        const optionId = item.option_id?.id || item.option_id;

        console.log('🔧 Processing attribute:', {
          original: item,
          extractedAttributeId: attributeId,
          extractedOptionId: optionId
        });

        if (!optionId || optionId.toString().trim() === '') {
          itemList.push({ attribute_id: attributeId });
        } else {
          itemList.push({
            attribute_id: attributeId,
            option_id: optionId
          });
        }
      }

      // Build URL matching Flutter implementation exactly
      // Flutter: providers/services?category_id={catId}&subcategory_id={subCatId}&attributes={jsonEncodedList}&segment_id={segmentId}

      // Create JSON string and encode it to match Flutter exactly
      const attributesJson = JSON.stringify(itemList);

      // Flutter uses specific encoding - encode brackets, quotes, and curly braces
      const flutterEncodedAttributes = attributesJson
        .replace(/\[/g, '%5B')    // [ → %5B
        .replace(/\]/g, '%5D')    // ] → %5D
        .replace(/"/g, '%22')     // " → %22
        .replace(/\{/g, '%7B')    // { → %7B (FIXED: was missing)
        .replace(/\}/g, '%7D');   // } → %7D (FIXED: was missing)

      // Build URL manually to match Flutter encoding
      // Flutter ALWAYS includes segment_id parameter, even if empty
      let url = `providers/services?category_id=${catId}&subcategory_id=${subCatId}&attributes=${flutterEncodedAttributes}`;

      // Add booking parameters if provided (matching Flutter backend logs)
      if (bookingDate) {
        url += `&booking_date=${encodeURIComponent(bookingDate)}`;
      }
      if (bookingTimeFrom) {
        url += `&booking_time_from=${encodeURIComponent(bookingTimeFrom)}`;
      }
      if (bookingTimeTo) {
        url += `&booking_time_to=${encodeURIComponent(bookingTimeTo)}`;
      }

      // Always include segment_id (Flutter behavior)
      url += `&segment_id=${segmentId || ''}`;

      console.log('🔍 ServiceProviderService: Segment ID analysis:', {
        segmentId,
        segmentIdTruthy: !!segmentId,
        segmentIdType: typeof segmentId,
        segmentIdValue: segmentId,
        finalSegmentIdInURL: segmentId || '',
        urlIncludesSegmentId: true // Always true now
      });

      console.log('🔧 ServiceProviderService: Final API call details:', {
        url,
        fullURL: `${API_CONFIG.BASE_URL}${url}`,
        parameters: {
          category_id: catId,
          subcategory_id: subCatId,
          segment_id: segmentId,
          attributes_count: itemList.length
        },
        transformedAttributes: itemList,
        originalAttributes: attributeList
      });

      // Compare with Flutter URL format
      const flutterURL = `https://app.eassylife.in/api/customer/v2.0.0/providers/services?category_id=561c01d348b6d760413d99e9f6733ed6&subcategory_id=1bdfe916ddd7e7556863948ae35a8326&attributes=%5B%7B%22attribute_id%22:%220fe977f6dab2b2cf9860079de49a7691%22,%22option_id%22:%221bdfe916ddd7e7556863948ae35a8326%22%7D%5D&segment_id=1566ba3af15a95c202eb4d93bb059d4c`;
      const reactURL = `${API_CONFIG.BASE_URL}${url}`;

      console.log('🎯 Target Flutter URL:', flutterURL);
      console.log('🔧 React Generated URL:', reactURL);

      // Compare attributes encoding specifically
      const flutterAttributes = '%5B%7B%22attribute_id%22:%220fe977f6dab2b2cf9860079de49a7691%22,%22option_id%22:%221bdfe916ddd7e7556863948ae35a8326%22%7D%5D';
      console.log('🔍 Encoding Comparison:');
      console.log('  Flutter attributes:', flutterAttributes);
      console.log('  React attributes  :', flutterEncodedAttributes);
      console.log('  Match:', flutterAttributes === flutterEncodedAttributes ? '✅' : '❌');

      const response = await axiosInstance.get(url);

      console.log('🔧 ServiceProviderService: API response:', {
        status: response.data.status,
        dataLength: response.data.data?.length || 0,
        requestURL: response.config?.url,
        firstProvider: response.data.data?.[0] ? {
          id: response.data.data[0].id,
          providerId: response.data.data[0].provider_id,
          price: response.data.data[0].price,
          recommended: response.data.data[0].eassyliferecomndeedd,
          bestDeal: response.data.data[0].bestdeal
        } : null
      });

      // Match Flutter response handling
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          return {
            success: true,
            data: response.data.data || [],
            message: response.data.message
          };
        } else {
          return {
            success: false,
            data: [],
            message: response.data.message || 'Failed to fetch service providers'
          };
        }
      } else {
        return {
          success: false,
          data: [],
          message: 'Invalid response format'
        };
      }
    } catch (error) {
      console.error('❌ ServiceProviderService: Failed to fetch service providers:', error);
      console.error('❌ ServiceProviderService: Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });

      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Network error'
      };
    }
  }

  /**
   * Add service to cart
   * Matches Flutter apiValue.addToCartService method
   * @param {Object} params - Add to cart parameters
   * @param {string} params.rateCardId - Rate card ID
   * @param {string} params.providerId - Provider ID
   * @param {string} params.type - Service type ('service' or 'subservice')
   * @param {string} params.addressId - Address ID
   * @param {string} params.bookingDate - Booking date
   * @param {string} params.bookingTimeFrom - Booking start time
   * @param {string} params.bookingTimeTo - Booking end time
   * @param {string} [params.campaignName=''] - Campaign name (optional)
   * @returns {Promise<Object>} Add to cart response
   */
  async addToCart({
    rateCardId,
    providerId,
    type,
    addressId,
    bookingDate,
    bookingTimeFrom,
    bookingTimeTo,
    campaignName = ''
  }) {
    try {
      console.log('🛒 ServiceProviderService: Adding to cart...', {
        rateCardId,
        providerId,
        type,
        addressId,
        bookingDate,
        bookingTimeFrom,
        bookingTimeTo,
        campaignName
      });

      // Build payload matching Flutter implementation
      const payload = {
        rate_card_id: rateCardId,
        provider_id: providerId,
        service_type: type,
        address_id: addressId,
        booking_date: bookingDate,
        booking_time_from: bookingTimeFrom,
        booking_time_to: bookingTimeTo
      };

      // Add campaign name only if provided (Flutter conditional logic)
      if (campaignName && campaignName.trim() !== '') {
        payload.campaign_name = campaignName;
      }

      console.log('🛒 ServiceProviderService: Payload:', payload);

      const response = await axiosInstance.post(API_ENDPOINTS.ADD_TO_CART, payload);

      console.log('🛒 ServiceProviderService: Add to cart response:', {
        status: response.data.status,
        message: response.data.message,
        requestURL: response.config?.url
      });

      // Match Flutter response handling
      if (response.data && response.data.status !== null) {
        if (response.data.status === true) {
          return {
            success: true,
            data: response.data.data,
            message: response.data.message
          };
        } else {
          return {
            success: false,
            message: response.data.message || 'Failed to add to cart'
          };
        }
      } else {
        return {
          success: false,
          message: 'Invalid response format'
        };
      }
    } catch (error) {
      console.error('❌ ServiceProviderService: Failed to add to cart:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error'
      };
    }
  }

  /**
   * Refresh service providers data
   * Convenience method that calls getServiceProviders with same parameters
   * @param {Object} params - Same parameters as getServiceProviders
   * @returns {Promise<Object>} Service providers response
   */
  async refreshServiceProviders(params) {
    console.log('🔄 ServiceProviderService: Refreshing service providers...');
    return this.getServiceProviders(params);
  }
}

// Export singleton instance
const serviceProviderService = new ServiceProviderService();
export default serviceProviderService;
