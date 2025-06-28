import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { vipService } from '../api/services/vipService';
import { useAuthContext } from './AuthContext';
import toast from 'react-hot-toast';

// VIP Context
const VipContext = createContext();

// VIP Actions
const VIP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_VIP_PLANS: 'SET_VIP_PLANS',
  SET_VIP_STATUS: 'SET_VIP_STATUS',
  SET_VIP_BENEFITS: 'SET_VIP_BENEFITS',
  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR',
  SET_SELECTED_PLAN: 'SET_SELECTED_PLAN',
  SET_PAYMENT_LOADING: 'SET_PAYMENT_LOADING'
};

// Initial State
const initialState = {
  vipPlans: [],
  vipStatus: {
    isVip: false,
    planName: null,
    expiryDate: null,
    subscriptionId: null
  },
  vipBenefits: [],
  selectedPlan: null,
  loading: false,
  paymentLoading: false,
  error: null
};

// VIP Reducer
const vipReducer = (state, action) => {
  console.log('🔄 VipReducer: Action dispatched:', action.type, action.payload);

  switch (action.type) {
    case VIP_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };

    case VIP_ACTIONS.SET_VIP_PLANS:
      console.log('📋 VipReducer: Setting VIP plans:', action.payload?.length || 0, 'plans');
      return { ...state, vipPlans: action.payload || [], loading: false };

    case VIP_ACTIONS.SET_VIP_STATUS:
      console.log('👑 VipReducer: Setting VIP status:', action.payload);
      return { ...state, vipStatus: action.payload, loading: false };

    case VIP_ACTIONS.SET_VIP_BENEFITS:
      console.log('🎁 VipReducer: Setting VIP benefits:', action.payload?.length || 0, 'benefits');
      return { ...state, vipBenefits: action.payload || [], loading: false };

    case VIP_ACTIONS.SET_ERROR:
      console.log('❌ VipReducer: Setting error:', action.payload);
      return { ...state, error: action.payload, loading: false, paymentLoading: false };

    case VIP_ACTIONS.RESET_ERROR:
      return { ...state, error: null };

    case VIP_ACTIONS.SET_SELECTED_PLAN:
      console.log('🎯 VipReducer: Setting selected plan:', action.payload?.id);
      return { ...state, selectedPlan: action.payload };

    case VIP_ACTIONS.SET_PAYMENT_LOADING:
      console.log('💳 VipReducer: Setting payment loading:', action.payload);
      return { ...state, paymentLoading: action.payload, error: null };

    default:
      return state;
  }
};

// VIP Provider Component
export const VipProvider = ({ children }) => {
  const [state, dispatch] = useReducer(vipReducer, initialState);
  const { isAuthenticated, updateUserVipStatus } = useAuthContext();

  // Fetch VIP plans when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchVipPlans();
      fetchVipStatus();
      fetchVipBenefits();
    }
  }, [isAuthenticated]);

  // Fetch VIP plans
  const fetchVipPlans = async () => {
    try {
      console.log('🔥 VipContext: Fetching VIP plans');
      dispatch({ type: VIP_ACTIONS.SET_LOADING, payload: true });

      const response = await vipService.getVipPlans();
      
      if (response.status) {
        dispatch({ type: VIP_ACTIONS.SET_VIP_PLANS, payload: response.data });
        console.log('✅ VipContext: VIP plans fetched successfully');
      } else {
        throw new Error(response.message || 'Failed to fetch VIP plans');
      }
    } catch (error) {
      console.error('❌ VipContext: Error fetching VIP plans:', error);
      dispatch({ type: VIP_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load VIP plans');
    }
  };

  // Fetch VIP status
  const fetchVipStatus = async () => {
    try {
      console.log('🔥 VipContext: Fetching VIP status');

      const response = await vipService.getVipStatus();
      
      if (response.status) {
        dispatch({ type: VIP_ACTIONS.SET_VIP_STATUS, payload: response.data });
        // Update auth context VIP status
        updateUserVipStatus(response.data.isVip);
        console.log('✅ VipContext: VIP status fetched successfully');
      } else {
        console.warn('⚠️ VipContext: Failed to fetch VIP status:', response.message);
      }
    } catch (error) {
      console.error('❌ VipContext: Error fetching VIP status:', error);
      // Don't show error toast for VIP status as it's not critical
    }
  };

  // Fetch VIP benefits
  const fetchVipBenefits = async () => {
    try {
      console.log('🔥 VipContext: Fetching VIP benefits');

      const response = await vipService.getVipBenefits();
      
      if (response.status) {
        dispatch({ type: VIP_ACTIONS.SET_VIP_BENEFITS, payload: response.data });
        console.log('✅ VipContext: VIP benefits fetched successfully');
      } else {
        console.warn('⚠️ VipContext: Failed to fetch VIP benefits:', response.message);
      }
    } catch (error) {
      console.error('❌ VipContext: Error fetching VIP benefits:', error);
    }
  };

  // Purchase VIP plan
  const purchaseVipPlan = async (planData) => {
    try {
      console.log('🔥 VipContext: Purchasing VIP plan:', planData.planId);
      dispatch({ type: VIP_ACTIONS.SET_PAYMENT_LOADING, payload: true });

      const response = await vipService.purchaseVipPlan(planData);
      
      if (response.status) {
        console.log('✅ VipContext: VIP plan purchased successfully');
        
        // Update VIP status
        await fetchVipStatus();
        
        // Show success message
        toast.success('VIP subscription activated successfully!');
        
        dispatch({ type: VIP_ACTIONS.SET_PAYMENT_LOADING, payload: false });
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to purchase VIP plan');
      }
    } catch (error) {
      console.error('❌ VipContext: Error purchasing VIP plan:', error);
      dispatch({ type: VIP_ACTIONS.SET_ERROR, payload: error.message });
      toast.error(error.message || 'Failed to purchase VIP plan');
      return { success: false, error: error.message };
    }
  };

  // Cancel VIP subscription
  const cancelVipSubscription = async () => {
    try {
      console.log('🔥 VipContext: Cancelling VIP subscription');
      dispatch({ type: VIP_ACTIONS.SET_LOADING, payload: true });

      const response = await vipService.cancelVipSubscription();
      
      if (response.status) {
        console.log('✅ VipContext: VIP subscription cancelled successfully');
        
        // Update VIP status
        await fetchVipStatus();
        
        toast.success('VIP subscription cancelled successfully');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to cancel VIP subscription');
      }
    } catch (error) {
      console.error('❌ VipContext: Error cancelling VIP subscription:', error);
      dispatch({ type: VIP_ACTIONS.SET_ERROR, payload: error.message });
      toast.error(error.message || 'Failed to cancel VIP subscription');
      return { success: false, error: error.message };
    }
  };

  // Select VIP plan
  const selectVipPlan = (plan) => {
    console.log('🎯 VipContext: Selecting VIP plan:', plan?.id);
    dispatch({ type: VIP_ACTIONS.SET_SELECTED_PLAN, payload: plan });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: VIP_ACTIONS.RESET_ERROR });
  };

  // Refresh VIP data
  const refreshVipData = async () => {
    console.log('🔄 VipContext: Refreshing VIP data');
    await Promise.all([
      fetchVipPlans(),
      fetchVipStatus(),
      fetchVipBenefits()
    ]);
  };

  // Get plan by ID
  const getPlanById = (planId) => {
    return state.vipPlans.find(plan => plan.id === planId) || null;
  };

  // Check if user has active VIP subscription
  const hasActiveVipSubscription = () => {
    return state.vipStatus.isVip && state.vipStatus.expiryDate && 
           new Date(state.vipStatus.expiryDate) > new Date();
  };

  // Get VIP subscription days remaining
  const getVipDaysRemaining = () => {
    if (!state.vipStatus.expiryDate) return 0;
    
    const expiryDate = new Date(state.vipStatus.expiryDate);
    const currentDate = new Date();
    const diffTime = expiryDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    fetchVipPlans,
    fetchVipStatus,
    fetchVipBenefits,
    purchaseVipPlan,
    cancelVipSubscription,
    selectVipPlan,
    refreshVipData,

    // Utilities
    clearError,
    getPlanById,
    hasActiveVipSubscription,
    getVipDaysRemaining
  };

  return (
    <VipContext.Provider value={value}>
      {children}
    </VipContext.Provider>
  );
};

// Custom hook to use VIP context
export const useVipContext = () => {
  const context = useContext(VipContext);
  if (!context) {
    throw new Error('useVipContext must be used within a VipProvider');
  }
  return context;
};

export default VipContext;
