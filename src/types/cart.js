// Cart types - simplified version for working components only

/**
 * Cart Status Constants - simplified
 */
export const CartStatus = {
  INITIAL: 'initial',
  CART_LOADING: 'cartLoading',
  NO_DATA_FOUND: 'noDataFound',
  SUCCESS: 'success',
  FAILURE: 'failure'
};

/**
 * Payment Types - matches Flutter payment type constants
 */
export const PaymentTypes = {
  FULL_AMOUNT: 'fullamount',
  PARTIAL: 'partial',
  VIP: 'vip'
};

/**
 * Default Cart Data Structure - matches Flutter CartDataModel
 */
export const defaultCartData = {
  deliveryAddress: null,
  itemFullAmount: 0,
  itemDiscountAmount: 0,
  vipDiscountAmount: 0,
  vipFullAmount: 0,
  userWalletAmount: '0',
  vipPlan: null,
  totalPrice: 0,
  totalDiscount: 0,
  totalServiceAmount: 0,
  totalTax: '0',
  partialPayment: '0',
  leftBalance: 0,
  viplifediscount: '0',
  convinencecharge: 0,
  remainingConvcience: 0,
  vipDiscountPrice: '0',
  groupedCart: {
    categories: [],
    packages: []
  }
};

/**
 * Default Cart State - enhanced for working components + VIP plans
 */
export const defaultCartState = {
  // Core cart data
  cartData: null,
  cartRawData: null,

  // Working components data
  frequentlyAddedServices: [],

  // VIP Plans data (Phase 1 - display only)
  vipPlans: [],
  selectedVipPlan: null,
  paymentType: 'fullamount', // 'fullamount', 'partial', 'vip'

  // Tip data
  selectedTip: '0', // Default tip amount

  // Donation data
  donationData: null, // Donation campaign data
  selectedDonationTip: '0', // Default donation amount

  // Wallet data
  isWalletEnabled: false, // Wallet toggle state

  // Item counts
  noOfServicesItems: 0,
  noOfPackageItems: 0,

  // UI state
  status: CartStatus.INITIAL,
  errorMessage: null,

  // Loading state
  isLoading: false
};

// Export all cart-related constants and defaults
