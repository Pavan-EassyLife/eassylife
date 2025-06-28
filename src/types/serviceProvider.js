/**
 * Service Provider Types - Flutter-aligned model definitions
 * Based on Flutter ServiceProviderModel and Provider classes
 * 
 * Flutter Reference:
 * - flutterapp/lib/modules/ServiceProvider/model/serviceProviderModels.dart
 */

/**
 * Provider model matching Flutter Provider class
 * @typedef {Object} Provider
 * @property {string|null} id - Provider ID
 * @property {string|null} image - Provider image URL
 * @property {string|null} firstName - Provider first name
 * @property {string|null} lastName - Provider last name
 * @property {string|null} companyName - Provider company name
 */

/**
 * Service Provider model matching Flutter ServiceProviderModel class
 * @typedef {Object} ServiceProviderModel
 * @property {string|null} id - Rate card ID
 * @property {string|null} providerId - Provider ID
 * @property {string|null} price - Service price
 * @property {string|null} strikePrice - Original price (before discount)
 * @property {boolean|null} recommended - Eassylife recommended flag
 * @property {boolean|null} bestDeal - Best deal flag
 * @property {Provider|null} provider - Provider information
 */

/**
 * Service Provider API response structure
 * @typedef {Object} ServiceProviderResponse
 * @property {boolean} success - Request success status
 * @property {ServiceProviderModel[]} data - Array of service providers
 * @property {string} message - Response message
 */

/**
 * Add to Cart API response structure
 * @typedef {Object} AddToCartResponse
 * @property {boolean} success - Request success status
 * @property {Object|null} data - Response data
 * @property {string} message - Response message
 */

/**
 * Service Provider fetch parameters
 * @typedef {Object} ServiceProviderParams
 * @property {string} catId - Category ID
 * @property {string} subCatId - Subcategory ID
 * @property {Array} attributeList - Filter attributes list
 * @property {string} segmentId - Segment ID
 * @property {string} [page='1'] - Page number
 * @property {string} [size='10'] - Page size
 */

/**
 * Add to Cart parameters
 * @typedef {Object} AddToCartParams
 * @property {string} rateCardId - Rate card ID
 * @property {string} providerId - Provider ID
 * @property {string} type - Service type ('service' or 'subservice')
 * @property {string} addressId - Address ID
 * @property {string} bookingDate - Booking date
 * @property {string} bookingTimeFrom - Booking start time
 * @property {string} bookingTimeTo - Booking end time
 * @property {string} [campaignName=''] - Campaign name (optional)
 */

/**
 * Service Provider state status enum
 * Matches Flutter ServiceProviderStatus
 */
export const ServiceProviderStatus = {
  INITIAL: 'initial',
  SERVICES_PROVIDER_LOADING: 'servicesProviderLoading',
  BUTTON_LOADING: 'buttonLoading',
  ADD_TO_CART_CONFIRMED: 'addToCartConfirmed',
  FAILURE: 'failure'
};

/**
 * Create Provider instance from API response
 * Matches Flutter Provider.fromJson constructor
 * @param {Object} json - API response data
 * @returns {Provider} Provider instance
 */
export const createProviderFromJson = (json) => {
  if (!json) return null;
  
  return {
    id: json.id || null,
    image: json.image || null,
    firstName: json.first_name || null,
    lastName: json.last_name || null,
    companyName: json.company_name || null
  };
};

/**
 * Create ServiceProviderModel instance from API response
 * Matches Flutter ServiceProviderModel.fromJson constructor
 * @param {Object} json - API response data
 * @returns {ServiceProviderModel} ServiceProviderModel instance
 */
export const createServiceProviderFromJson = (json) => {
  if (!json) return null;
  
  return {
    id: json.id || null,
    providerId: json.provider_id || null,
    price: json.price || null,
    strikePrice: json.strike_price || null,
    recommended: json.eassyliferecomndeedd || false,
    bestDeal: json.bestdeal || false,
    provider: createProviderFromJson(json.provider)
  };
};

/**
 * Transform array of API response data to ServiceProviderModel array
 * @param {Array} dataArray - Array of API response objects
 * @returns {ServiceProviderModel[]} Array of ServiceProviderModel instances
 */
export const transformServiceProvidersData = (dataArray) => {
  if (!Array.isArray(dataArray)) return [];
  
  return dataArray.map(createServiceProviderFromJson).filter(Boolean);
};

/**
 * Get provider full name
 * @param {Provider} provider - Provider instance
 * @returns {string} Full name or 'Provider' as fallback
 */
export const getProviderFullName = (provider) => {
  if (!provider) return 'Provider';
  
  const firstName = provider.firstName || '';
  const lastName = provider.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || 'Provider';
};

/**
 * Get provider avatar fallback letter
 * @param {Provider} provider - Provider instance
 * @returns {string} First letter of provider name
 */
export const getProviderAvatarFallback = (provider) => {
  const fullName = getProviderFullName(provider);
  return fullName.charAt(0).toUpperCase();
};

/**
 * Calculate savings amount
 * @param {string|number} strikePrice - Original price
 * @param {string|number} price - Current price
 * @returns {number} Savings amount
 */
export const calculateSavings = (strikePrice, price) => {
  const strike = parseFloat(strikePrice) || 0;
  const current = parseFloat(price) || 0;
  return Math.max(0, strike - current);
};

/**
 * Calculate discount percentage
 * @param {string|number} strikePrice - Original price
 * @param {string|number} price - Current price
 * @returns {string} Discount percentage with % symbol
 */
export const calculateDiscountPercentage = (strikePrice, price) => {
  const strike = parseFloat(strikePrice) || 0;
  const current = parseFloat(price) || 0;
  
  if (strike <= 0 || current <= 0) return '0%';
  
  const discount = ((strike - current) / strike) * 100;
  return `${Math.round(discount)}%`;
};

/**
 * Format currency amount
 * @param {string|number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `₹${Math.round(num)}`;
};

/**
 * Validate service provider selection
 * @param {ServiceProviderModel|null} selectedProvider - Selected provider
 * @returns {boolean} True if valid selection
 */
export const isValidProviderSelection = (selectedProvider) => {
  return selectedProvider && selectedProvider.id && selectedProvider.providerId;
};

/**
 * Default service provider state
 * Matches Flutter ServiceProviderState initial state
 */
export const defaultServiceProviderState = {
  servicesProvider: [],
  selectedServicesProvider: null,
  status: ServiceProviderStatus.INITIAL,
  errorMessage: null
};
