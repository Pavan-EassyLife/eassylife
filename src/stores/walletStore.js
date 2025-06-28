import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import walletService from '../api/services/walletService.js';
import toast from 'react-hot-toast';

/**
 * Wallet Store - Manages wallet data and transactions
 * Uses Zustand for state management with devtools integration
 */
const useWalletStore = create(
  devtools(
    (set, get) => ({
      // State
      balance: 0,
      transactions: [],
      loading: false,
      transactionLoading: false,
      error: null,
      pagination: null,
      lastFetched: null,
      filters: {
        type: 'all',
        page: 1,
        limit: 20
      },

      // Actions
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      
      setTransactionLoading: (transactionLoading) => set({ transactionLoading }, false, 'setTransactionLoading'),
      
      setError: (error) => set({ error }, false, 'setError'),
      
      setBalance: (balance) => set({ balance }, false, 'setBalance'),
      
      setTransactions: (transactions, pagination = null) => set({ 
        transactions, 
        pagination,
        lastFetched: Date.now() 
      }, false, 'setTransactions'),

      setFilters: (filters) => set({ 
        filters: { ...get().filters, ...filters } 
      }, false, 'setFilters'),

      clearError: () => set({ error: null }, false, 'clearError'),

      // Async Actions
      fetchWalletHistory: async (options = {}, force = false) => {
        const state = get();
        
        // Skip if already loading
        if (state.loading) return;

        // Merge options with current filters
        const queryOptions = { ...state.filters, ...options };

        // Skip if recently fetched (within 1 minute) unless forced or different filters
        const oneMinute = 60 * 1000;
        const filtersChanged = JSON.stringify(queryOptions) !== JSON.stringify(state.filters);
        if (!force && !filtersChanged && state.lastFetched && (Date.now() - state.lastFetched) < oneMinute) {
          return;
        }

        set({ loading: true, error: null, filters: queryOptions }, false, 'fetchWalletHistory:start');
        
        try {
          const response = await walletService.getWalletHistory(queryOptions);
          
          if (response.success) {
            // Transform backend data to match frontend expectations
            const transformedTransactions = (response.data || []).map(transaction => ({
              id: transaction.id,
              user_id: transaction.user_id,
              transaction_type: transaction.transaction_type,
              amount: parseFloat(transaction.amount || 0),
              reason: transaction.reason,
              previous_balance: parseFloat(transaction.previous_balance || 0),
              new_balance: parseFloat(transaction.new_balance || 0),
              created_at: transaction.created_at,
              // Add computed fields for UI
              type: transaction.transaction_type, // credit/debit
              description: transaction.reason?.replace(/_/g, ' ').toUpperCase() || 'Transaction',
              date: transaction.created_at ? new Date(transaction.created_at * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
              formattedAmount: `₹${Math.abs(parseFloat(transaction.amount || 0)).toFixed(2)}`
            }));

            set({
              transactions: transformedTransactions,
              pagination: response.pagination,
              loading: false,
              lastFetched: Date.now()
            }, false, 'fetchWalletHistory:success');
          } else {
            throw new Error(response.message || 'Failed to fetch wallet history');
          }
        } catch (error) {
          console.error('❌ Wallet history fetch error:', error);
          set({ 
            error: error.message, 
            loading: false 
          }, false, 'fetchWalletHistory:error');
          
          // Show error toast
          toast.error(error.message || 'Failed to load wallet history');
        }
      },

      fetchWalletBalance: async (force = false) => {
        const state = get();
        
        // Skip if recently fetched (within 5 minutes) unless forced
        const fiveMinutes = 5 * 60 * 1000;
        if (!force && state.lastFetched && (Date.now() - state.lastFetched) < fiveMinutes) {
          return;
        }

        try {
          const response = await walletService.getWalletBalance();
          
          if (response.success) {
            set({ 
              balance: response.data.balance || 0
            }, false, 'fetchWalletBalance:success');
          } else {
            console.warn('Failed to fetch wallet balance:', response.message);
          }
        } catch (error) {
          console.error('❌ Wallet balance fetch error:', error);
          // Don't show error toast for balance fetch failures
        }
      },

      addMoney: async (paymentData) => {
        const state = get();
        
        // Skip if already processing transaction
        if (state.transactionLoading) return { success: false, error: 'Transaction in progress' };

        set({ transactionLoading: true, error: null }, false, 'addMoney:start');
        
        try {
          // Validate transaction data
          const validation = walletService.validateTransactionData(paymentData);
          if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            throw new Error(errorMessage);
          }

          const response = await walletService.addMoney(paymentData);
          
          if (response.success) {
            set({ transactionLoading: false }, false, 'addMoney:success');

            // Show success toast
            toast.success(`₹${paymentData.amount} added to wallet successfully`);
            
            // Refresh wallet data
            get().fetchWalletBalance(true);
            get().fetchWalletHistory({}, true);
            
            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Failed to add money to wallet');
          }
        } catch (error) {
          console.error('❌ Add money error:', error);
          set({ 
            error: error.message, 
            transactionLoading: false 
          }, false, 'addMoney:error');
          
          // Show error toast
          toast.error(error.message || 'Failed to add money to wallet');
          
          return { success: false, error: error.message };
        }
      },

      getTransactionDetails: async (transactionId) => {
        try {
          const response = await walletService.getTransactionDetails(transactionId);
          
          if (response.success) {
            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Failed to fetch transaction details');
          }
        } catch (error) {
          console.error('❌ Transaction details fetch error:', error);
          toast.error(error.message || 'Failed to load transaction details');
          return { success: false, error: error.message };
        }
      },

      // Utility functions
      formatTransactionAmount: (transaction) => {
        return walletService.formatTransactionAmount(transaction);
      },

      getTransactionTypeInfo: (type) => {
        return walletService.getTransactionTypeInfo(type);
      },

      getWalletStatistics: () => {
        const state = get();
        return walletService.getWalletStatistics(state.transactions);
      },

      filterTransactionsByDate: (startDate, endDate) => {
        const state = get();
        return walletService.filterTransactionsByDate(state.transactions, startDate, endDate);
      },

      groupTransactionsByDate: () => {
        const state = get();
        return walletService.groupTransactionsByDate(state.transactions);
      },

      getFormattedBalance: () => {
        const state = get();
        return `₹${state.balance.toFixed(2)}`;
      },

      hasTransactions: () => {
        const state = get();
        return state.transactions.length > 0;
      },

      // Pagination helpers
      hasNextPage: () => {
        const state = get();
        return state.pagination && state.pagination.hasNextPage;
      },

      hasPreviousPage: () => {
        const state = get();
        return state.pagination && state.pagination.hasPreviousPage;
      },

      loadNextPage: async () => {
        const state = get();
        if (!state.pagination || !state.pagination.hasNextPage) return;

        const nextPage = state.filters.page + 1;
        return get().fetchWalletHistory({ page: nextPage });
      },

      loadPreviousPage: async () => {
        const state = get();
        if (!state.pagination || !state.pagination.hasPreviousPage) return;

        const previousPage = Math.max(1, state.filters.page - 1);
        return get().fetchWalletHistory({ page: previousPage });
      },

      // Filter actions
      filterByType: async (type) => {
        return get().fetchWalletHistory({ type, page: 1 });
      },

      // Reset store
      reset: () => set({
        balance: 0,
        transactions: [],
        loading: false,
        transactionLoading: false,
        error: null,
        pagination: null,
        lastFetched: null,
        filters: {
          type: 'all',
          page: 1,
          limit: 20
        }
      }, false, 'reset'),

      // Refresh wallet data
      refresh: async () => {
        await Promise.all([
          get().fetchWalletBalance(true),
          get().fetchWalletHistory({}, true)
        ]);
      }
    }),
    {
      name: 'wallet-store',
      // Only enable devtools in development
      enabled: import.meta.env.DEV
    }
  )
);

export default useWalletStore;
