/**
 * Coupon Types and Models
 * Exactly matches Flutter coupon model structure for 100% parity
 */

/**
 * Available Coupons Model
 * Matches Flutter AvailableCouponsModel exactly
 */
export const AvailableCouponsModel = {
  id: null,
  image: null,
  code: null,
  description: null,
  discountValue: null,
  minOrderValue: null,
  status: null,
  isGlobal: null,
  displayToCustomer: null,
  isValid: null,
  leftamount: null
};

/**
 * Available Coupons Response Model
 * Matches Flutter AvailableCouponsResponseModel exactly
 */
export const AvailableCouponsResponseModel = {
  couponCode: null,
  couponId: null,
  convinencecharge: null,
  couponValue: null,
  remainingConvcience: null,
  itemDiscountAmount: null,
  isFree: null,
  rateCardDetails: null
};

/**
 * Rate Card Details Model
 * Matches Flutter RateCardDetails exactly
 */
export const RateCardDetailsModel = {
  id: null,
  categoryId: null,
  subcategoryId: null,
  name: null,
  price: null,
  strikePrice: null,
  category: null,
  subcategory: null
};

/**
 * Category Model (nested in RateCardDetails)
 */
export const CategoryModel = {
  id: null,
  name: null,
  image: null,
  description: null
};

/**
 * Subcategory Model (nested in RateCardDetails)
 */
export const SubcategoryModel = {
  id: null,
  name: null,
  image: null,
  description: null,
  categoryId: null
};

/**
 * Coupon Status Enum
 * Matches Flutter AvailableCouponsStatus exactly
 */
export const CouponStatus = {
  INITIAL: 'initial',
  AVAILABLE_COUPONS_LOADING: 'availableCouponsLoading',
  SEARCH_COUPON_APPLY_LOADING: 'searchCouponApplyLoading',
  COUPON_APPLY_LOADING: 'couponApplyLoading',
  COUPON_APPLIED_SUCCESSFULLY: 'couponAppliedSuccessfully',
  SUCCESS: 'success',
  NO_DATA_FOUND: 'noDataFound',
  FAILURE: 'failure'
};

/**
 * Coupon State Interface
 * Matches Flutter AvailableCouponsState exactly
 */
export const CouponState = {
  availableCouponsList: [],
  currentCouponSelected: null,
  isFreeService: null,
  couponResponse: null,
  selectedInt: null,
  status: CouponStatus.INITIAL,
  errorMessage: null
};

/**
 * Helper function to create AvailableCouponsModel from JSON
 * Matches Flutter AvailableCouponsModel.fromJson()
 */
export const createAvailableCouponsModelFromJson = (json) => {
  return {
    id: json.id || null,
    image: json.image || null,
    code: json.code || null,
    description: json.description || null,
    discountValue: json.discount_value || null,
    minOrderValue: json.min_order_value || null,
    status: json.status || null,
    isGlobal: json.is_global || null,
    displayToCustomer: json.display_to_customer || null,
    isValid: json.isValid || null,
    leftamount: json.leftamount || null
  };
};

/**
 * Helper function to create AvailableCouponsResponseModel
 * Matches Flutter AvailableCouponsResponseModel constructor
 */
export const createAvailableCouponsResponseModel = (data) => {
  return {
    couponCode: data.couponCode || null,
    couponId: data.couponId || null,
    convinencecharge: data.convinencecharge || null,
    couponValue: data.couponValue || null,
    remainingConvcience: data.remainingConvcience || null,
    itemDiscountAmount: data.itemDiscountAmount || null,
    isFree: data.isFree || null,
    rateCardDetails: data.rateCardDetails ? createRateCardDetailsFromJson(data.rateCardDetails) : null
  };
};

/**
 * Helper function to create RateCardDetails from JSON
 * Matches Flutter RateCardDetails.fromJson()
 */
export const createRateCardDetailsFromJson = (json) => {
  return {
    id: json.id || null,
    categoryId: json.category_id || null,
    subcategoryId: json.subcategory_id || null,
    name: json.name || null,
    price: json.price || null,
    strikePrice: json.strike_price || null,
    category: json.category ? createCategoryFromJson(json.category) : null,
    subcategory: json.subcategory ? createSubcategoryFromJson(json.subcategory) : null
  };
};

/**
 * Helper function to create Category from JSON
 */
export const createCategoryFromJson = (json) => {
  return {
    id: json.id || null,
    name: json.name || null,
    image: json.image || null,
    description: json.description || null
  };
};

/**
 * Helper function to create Subcategory from JSON
 */
export const createSubcategoryFromJson = (json) => {
  return {
    id: json.id || null,
    name: json.name || null,
    image: json.image || null,
    description: json.description || null,
    categoryId: json.category_id || null
  };
};

/**
 * Coupon validation helper functions
 */
export const CouponValidation = {
  /**
   * Check if coupons are applicable based on cart state
   * Matches Flutter conditions exactly
   */
  areCouponsApplicable: (cartState) => {
    const {
      isWalletEnabled,
      paymentType,
      selectedVipPlan,
      noOfPackageItems
    } = cartState;

    return (
      !isWalletEnabled &&
      paymentType === 'fullamount' &&
      !selectedVipPlan &&
      noOfPackageItems === 0
    );
  },

  /**
   * Check if coupon code is valid format
   */
  isValidCouponCode: (code) => {
    return code && code.trim().length > 0;
  },

  /**
   * Check if coupon is currently selected
   */
  isCouponSelected: (coupon, selectedCouponResponse) => {
    if (!selectedCouponResponse || !coupon) return false;
    return selectedCouponResponse.couponCode === coupon.code;
  }
};
