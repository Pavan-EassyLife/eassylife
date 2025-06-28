import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import orderService from '../api/services/orderService';
import { useToast } from '../components/ui/toast';

// Order Context
const OrderContext = createContext();

// Order Actions
const ORDER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ORDERS: 'SET_ORDERS',
  SET_CURRENT_ORDER: 'SET_CURRENT_ORDER',
  CLEAR_CURRENT_ORDER: 'CLEAR_CURRENT_ORDER',
  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR',
  SET_REFRESHING: 'SET_REFRESHING',
  TOGGLE_ADDRESS_DETAILS: 'TOGGLE_ADDRESS_DETAILS',
  TOGGLE_ISSUE_FIELD: 'TOGGLE_ISSUE_FIELD',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  SET_ORDERS_LOADING: 'SET_ORDERS_LOADING',
  SET_ORDER_DETAIL_LOADING: 'SET_ORDER_DETAIL_LOADING'
};

// Initial State
const initialState = {
  // Order Lists by Status
  orders: {
    accepted: [],
    upcoming: [],
    completed: [],
    cancelled: []
  },
  
  // Current Order Detail
  currentOrder: null,
  
  // Loading States
  loading: false,
  ordersLoading: false,
  orderDetailLoading: false,
  refreshing: false,
  
  // UI States
  showAddressDetails: false,
  showIssueField: false,
  
  // Error Handling
  error: null,
  
  // Pagination
  pagination: {
    accepted: { page: 1, hasMore: true },
    upcoming: { page: 1, hasMore: true },
    completed: { page: 1, hasMore: true },
    cancelled: { page: 1, hasMore: true }
  }
};

// Order Reducer
const orderReducer = (state, action) => {
  console.log('🔄 OrderReducer: Action dispatched:', action.type, action.payload);

  switch (action.type) {
    case ORDER_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };

    case ORDER_ACTIONS.SET_ORDERS_LOADING:
      return { ...state, ordersLoading: action.payload };

    case ORDER_ACTIONS.SET_ORDER_DETAIL_LOADING:
      return { ...state, orderDetailLoading: action.payload };

    case ORDER_ACTIONS.SET_REFRESHING:
      return { ...state, refreshing: action.payload };

    case ORDER_ACTIONS.SET_ORDERS:
      const { status, orders, append = false } = action.payload;
      // Ensure orders is always an array
      const ordersArray = Array.isArray(orders) ? orders : [];
      const currentOrders = Array.isArray(state.orders[status]) ? state.orders[status] : [];

      return {
        ...state,
        orders: {
          ...state.orders,
          [status]: append ? [...currentOrders, ...ordersArray] : ordersArray
        },
        loading: false,
        ordersLoading: false,
        refreshing: false,
        error: null
      };

    case ORDER_ACTIONS.SET_CURRENT_ORDER:
      return {
        ...state,
        currentOrder: action.payload,
        orderDetailLoading: false,
        loading: false,
        error: null
      };

    case ORDER_ACTIONS.CLEAR_CURRENT_ORDER:
      return {
        ...state,
        currentOrder: null,
        orderDetailLoading: true,
        error: null
      };

    case ORDER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        ordersLoading: false,
        orderDetailLoading: false,
        refreshing: false
      };

    case ORDER_ACTIONS.RESET_ERROR:
      return { ...state, error: null };

    case ORDER_ACTIONS.TOGGLE_ADDRESS_DETAILS:
      return { ...state, showAddressDetails: !state.showAddressDetails };

    case ORDER_ACTIONS.TOGGLE_ISSUE_FIELD:
      return { ...state, showIssueField: !state.showIssueField };

    case ORDER_ACTIONS.UPDATE_ORDER_STATUS:
      const { orderId, itemId, newStatus } = action.payload;
      
      // Update current order if it matches
      let updatedCurrentOrder = state.currentOrder;
      if (state.currentOrder && state.currentOrder.items) {
        const updatedItems = state.currentOrder.items.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        );
        updatedCurrentOrder = { ...state.currentOrder, items: updatedItems };
      }

      // Update orders in lists
      const updatedOrders = { ...state.orders };
      Object.keys(updatedOrders).forEach(status => {
        updatedOrders[status] = updatedOrders[status].map(order => {
          if (order.id === orderId || order.orderId === orderId) {
            const updatedItems = order.items?.map(item => 
              item.id === itemId ? { ...item, status: newStatus } : item
            ) || [];
            return { ...order, items: updatedItems };
          }
          return order;
        });
      });

      return {
        ...state,
        currentOrder: updatedCurrentOrder,
        orders: updatedOrders
      };

    default:
      return state;
  }
};

// Order Provider Component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { showSuccess, showError } = useToast();

  // Fetch orders by status
  const fetchOrders = useCallback(async (status, page = 1, append = false) => {
    try {
      if (!append) {
        dispatch({ type: ORDER_ACTIONS.SET_ORDERS_LOADING, payload: true });
      }
      dispatch({ type: ORDER_ACTIONS.RESET_ERROR });

      const result = await orderService.getOrdersByStatus(status, page);

      if (result.success) {
        // Ensure data is an array and transform the structure
        let ordersData = Array.isArray(result.data) ? result.data : [];
        console.log('🔍 OrderContext - Raw orders data for status:', status, ordersData);

        // Transform bookings structure - flatten items from each booking
        const transformedOrders = [];

        ordersData.forEach(booking => {
          if (booking.items && Array.isArray(booking.items)) {
            booking.items.forEach(item => {
              // Include all items - the API should handle filtering by status
              // For navigation: use booking.id as orderId and item.id as itemId
              const transformedOrder = {
                ...booking,
                ...item,
                // Keep the original booking ID for API calls
                orderId: booking.id,  // This is the booking ID for the API
                bookingId: booking.id, // Also store as bookingId for clarity
                originalBookingData: booking, // Store original booking data
                items: [item] // Keep original item structure for compatibility
              };

              console.log('🔄 OrderContext - Transformed order item:', {
                originalBooking: booking.id,
                itemId: item.id,
                orderNumber: item.order_id,
                status: item.status,
                serviceName: item.rateCard?.subcategory?.name,
                providerName: `${item.provider?.first_name} ${item.provider?.last_name}`,
                amount: item.total_amount,
                transformedOrder
              });

              transformedOrders.push(transformedOrder);
            });
          } else {
            // If no items, keep the booking as is (for backward compatibility)
            console.log('🔄 OrderContext - Booking without items:', booking);
            transformedOrders.push(booking);
          }
        });

        console.log('🔍 OrderContext - Transformed orders for status:', status, transformedOrders);

        dispatch({
          type: ORDER_ACTIONS.SET_ORDERS,
          payload: {
            status: getStatusKey(status),
            orders: transformedOrders,
            append
          }
        });
        return { success: true, data: transformedOrders };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch orders';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [showError]);

  // Fetch order detail
  const fetchOrderDetail = useCallback(async (orderId, itemId) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_ORDER_DETAIL_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.RESET_ERROR });

      const result = await orderService.getOrderDetail(orderId, itemId);

      if (result.success) {
        dispatch({ type: ORDER_ACTIONS.SET_CURRENT_ORDER, payload: result.data });
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch order details';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [showError]);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_REFRESHING, payload: true });

      // Fetch all order types
      const statuses = ['accepted', 'upcoming', 'completed', 'cancelled'];
      const promises = statuses.map(async (status) => {
        try {
          const result = await orderService.getOrdersByStatus(status, 1);
          if (result.success) {
            // Ensure data is an array and transform the structure
            let ordersData = Array.isArray(result.data) ? result.data : [];

            // Transform bookings structure - flatten items from each booking
            const transformedOrders = [];
            ordersData.forEach(booking => {
              if (booking.items && Array.isArray(booking.items)) {
                booking.items.forEach(item => {
                  // For now, include all items and let the API handle filtering
                  // For navigation: use booking.id as orderId and item.id as itemId
                  transformedOrders.push({
                    ...booking,
                    ...item,
                    // Keep the original booking ID for API calls
                    orderId: booking.id,  // This is the booking ID for the API
                    bookingId: booking.id, // Also store as bookingId for clarity
                    originalBookingData: booking, // Store original booking data
                    items: [item] // Keep original item structure for compatibility
                  });
                });
              } else {
                // If no items, keep the booking as is (for backward compatibility)
                transformedOrders.push(booking);
              }
            });

            dispatch({
              type: ORDER_ACTIONS.SET_ORDERS,
              payload: {
                status: getStatusKey(status),
                orders: transformedOrders,
                append: false
              }
            });
          }
        } catch (error) {
          console.error(`Failed to refresh ${status} orders:`, error);
        }
      });

      await Promise.all(promises);
      showSuccess('Orders refreshed successfully');
    } catch (error) {
      showError('Failed to refresh orders');
    } finally {
      dispatch({ type: ORDER_ACTIONS.SET_REFRESHING, payload: false });
    }
  }, [showSuccess, showError]); // Remove fetchOrders dependency

  // Cancel order
  const cancelOrder = useCallback(async (bookingId, cancelReason) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      
      const result = await orderService.cancelOrder(bookingId, cancelReason);
      
      if (result.success) {
        // Update order status in state
        dispatch({
          type: ORDER_ACTIONS.UPDATE_ORDER_STATUS,
          payload: {
            itemId: bookingId,
            newStatus: 'cancelled'
          }
        });
        
        showSuccess('Order cancelled successfully');
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to cancel order';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
    }
  }, [showSuccess, showError]);

  // Reschedule order
  const rescheduleOrder = useCallback(async (bookingId, newDate, newTimeFrom, newTimeTo, rescheduleReason) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      
      const result = await orderService.rescheduleOrder(bookingId, newDate, newTimeFrom, newTimeTo, rescheduleReason);
      
      if (result.success) {
        showSuccess('Order rescheduled successfully');
        // Refresh current order details
        if (state.currentOrder) {
          const currentItem = state.currentOrder.items?.[0];
          if (currentItem) {
            await fetchOrderDetail(state.currentOrder.orderId || state.currentOrder.id, currentItem.id);
          }
        }
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to reschedule order';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
    }
  }, [showSuccess, showError, state.currentOrder, fetchOrderDetail]);

  // Submit feedback
  const submitFeedback = useCallback(async (bookingId, rating, comment) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      
      const result = await orderService.submitFeedback(bookingId, rating, comment);
      
      if (result.success) {
        showSuccess('Feedback submitted successfully');
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit feedback';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
    }
  }, [showSuccess, showError]);

  // Report issue
  const reportIssue = useCallback(async (bookingId, issue) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      
      const result = await orderService.reportIssue(bookingId, issue);
      
      if (result.success) {
        showSuccess('Issue reported successfully');
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to report issue';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: errorMessage });
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
    }
  }, [showSuccess, showError]);



  // Toggle functions
  const toggleAddressDetails = useCallback(() => {
    dispatch({ type: ORDER_ACTIONS.TOGGLE_ADDRESS_DETAILS });
  }, []);

  const toggleIssueField = useCallback(() => {
    dispatch({ type: ORDER_ACTIONS.TOGGLE_ISSUE_FIELD });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ORDER_ACTIONS.RESET_ERROR });
  }, []);

  // Clear current order
  const clearCurrentOrder = useCallback(() => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_CURRENT_ORDER });
  }, []);

  // Helper function to map API status to state key - memoized
  const getStatusKey = useCallback((apiStatus) => {
    const statusMap = {
      'accepted': 'accepted',
      'upcoming': 'upcoming',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return statusMap[apiStatus] || apiStatus.toLowerCase();
  }, []);

  // Memoize orders to prevent re-renders
  const memoizedOrders = useMemo(() => ({
    accepted: Array.isArray(state.orders.accepted) ? state.orders.accepted : [],
    upcoming: Array.isArray(state.orders.upcoming) ? state.orders.upcoming : [],
    completed: Array.isArray(state.orders.completed) ? state.orders.completed : [],
    cancelled: Array.isArray(state.orders.cancelled) ? state.orders.cancelled : []
  }), [state.orders.accepted, state.orders.upcoming, state.orders.completed, state.orders.cancelled]);

  // Context value - memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    ...state,
    orders: memoizedOrders,

    // Actions
    fetchOrders,
    fetchOrderDetail,
    refreshOrders,
    cancelOrder,
    rescheduleOrder,
    submitFeedback,
    reportIssue,

    // UI Actions
    toggleAddressDetails,
    toggleIssueField,
    clearError,
    clearCurrentOrder,

    // Utilities
    orderService
  }), [
    state,
    memoizedOrders,
    fetchOrders,
    fetchOrderDetail,
    refreshOrders,
    cancelOrder,
    rescheduleOrder,
    submitFeedback,
    reportIssue,
    toggleAddressDetails,
    toggleIssueField,
    clearError,
    clearCurrentOrder
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
