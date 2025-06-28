import { useEffect } from 'react';
import useWalletStore from '../stores/walletStore.js';

/**
 * useWallet - Custom hook for wallet management
 * Provides easy access to wallet state and actions
 */
export const useWallet = (options = {}) => {
  const {
    autoFetch = true,
    fetchOnMount = true,
    includeBalance = true
  } = options;

  // Get all wallet state and actions
  const {
    balance,
    transactions,
    loading,
    transactionLoading,
    error,
    pagination,
    lastFetched,
    filters,
    fetchWalletHistory,
    fetchWalletBalance,
    addMoney,
    getTransactionDetails,
    formatTransactionAmount,
    getTransactionTypeInfo,
    getWalletStatistics,
    filterTransactionsByDate,
    groupTransactionsByDate,
    getFormattedBalance,
    hasTransactions,
    hasNextPage,
    hasPreviousPage,
    loadNextPage,
    loadPreviousPage,
    filterByType,
    clearError,
    refresh,
    reset
  } = useWalletStore();

  // Auto-fetch wallet data on mount if enabled
  useEffect(() => {
    if (fetchOnMount && autoFetch && !lastFetched && !loading) {
      if (includeBalance) {
        fetchWalletBalance();
      }
      fetchWalletHistory();
    }
  }, [fetchOnMount, autoFetch, lastFetched, loading, includeBalance, fetchWalletBalance, fetchWalletHistory]);

  // Helper functions
  const handleAddMoney = async (paymentData) => {
    clearError();
    const result = await addMoney(paymentData);
    return result;
  };

  const handleGetTransactionDetails = async (transactionId) => {
    const result = await getTransactionDetails(transactionId);
    return result;
  };

  const handleRefresh = async () => {
    clearError();
    await refresh();
  };

  const handleFilterByType = async (type) => {
    clearError();
    await filterByType(type);
  };

  const handleLoadMore = async () => {
    if (hasNextPage()) {
      await loadNextPage();
    }
  };

  // Computed values
  const isLoading = loading || transactionLoading;
  const hasError = !!error;
  const isDataStale = lastFetched && (Date.now() - lastFetched) > (5 * 60 * 1000); // 5 minutes
  const statistics = getWalletStatistics();
  const groupedTransactions = groupTransactionsByDate();

  return {
    // State
    balance,
    transactions,
    loading,
    transactionLoading,
    error,
    pagination,
    filters,
    isLoading,
    hasError,
    isDataStale,
    lastFetched,

    // Actions
    fetchHistory: fetchWalletHistory,
    fetchBalance: fetchWalletBalance,
    addMoney: handleAddMoney,
    getTransactionDetails: handleGetTransactionDetails,
    filterByType: handleFilterByType,
    loadMore: handleLoadMore,
    loadNext: loadNextPage,
    loadPrevious: loadPreviousPage,
    refresh: handleRefresh,
    clearError,
    reset,

    // Computed values
    formattedBalance: getFormattedBalance(),
    hasTransactions: hasTransactions(),
    hasMore: hasNextPage(),
    hasPrevious: hasPreviousPage(),
    statistics,
    groupedTransactions,

    // Helper functions
    formatAmount: formatTransactionAmount,
    getTypeInfo: getTransactionTypeInfo,
    filterByDate: filterTransactionsByDate,
    refetchData: () => refresh(),
    isRecentlyFetched: lastFetched && (Date.now() - lastFetched) < (1 * 60 * 1000) // 1 minute
  };
};

/**
 * useWalletBalance - Custom hook specifically for wallet balance
 */
export const useWalletBalance = (options = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options; // 30 seconds

  const {
    balance,
    fetchWalletBalance,
    getFormattedBalance
  } = useWalletStore();

  // Auto-refresh balance if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWalletBalance(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchWalletBalance]);

  return {
    balance,
    formattedBalance: getFormattedBalance(),
    refreshBalance: () => fetchWalletBalance(true)
  };
};

/**
 * useWalletTransactions - Custom hook specifically for wallet transactions
 */
export const useWalletTransactions = (options = {}) => {
  const {
    type = 'all',
    limit = 20,
    autoLoad = true
  } = options;

  const {
    transactions,
    loading,
    pagination,
    filters,
    fetchWalletHistory,
    formatTransactionAmount,
    getTransactionTypeInfo,
    groupTransactionsByDate,
    hasNextPage,
    loadNextPage
  } = useWalletStore();

  // Load transactions with specified filters
  useEffect(() => {
    if (autoLoad) {
      fetchWalletHistory({ type, limit });
    }
  }, [type, limit, autoLoad, fetchWalletHistory]);

  const loadMore = async () => {
    if (hasNextPage()) {
      await loadNextPage();
    }
  };

  const groupedTransactions = groupTransactionsByDate();

  return {
    transactions,
    loading,
    pagination,
    filters,
    groupedTransactions,
    hasMore: hasNextPage(),
    loadMore,
    formatAmount: formatTransactionAmount,
    getTypeInfo: getTransactionTypeInfo,
    reload: () => fetchWalletHistory({ type, limit }, true)
  };
};

/**
 * useWalletStatistics - Custom hook for wallet statistics
 */
export const useWalletStatistics = () => {
  const {
    transactions,
    getWalletStatistics
  } = useWalletStore();

  const statistics = getWalletStatistics();

  const getFormattedStatistics = () => {
    return {
      totalCredits: `₹${statistics.totalCredits.toFixed(2)}`,
      totalDebits: `₹${statistics.totalDebits.toFixed(2)}`,
      netAmount: `₹${statistics.netAmount.toFixed(2)}`,
      totalTransactions: statistics.totalTransactions
    };
  };

  const getStatisticsForPeriod = (startDate, endDate) => {
    const { filterTransactionsByDate, getWalletStatistics } = useWalletStore.getState();
    const filteredTransactions = filterTransactionsByDate(transactions, startDate, endDate);
    return getWalletStatistics(filteredTransactions);
  };

  return {
    statistics,
    formattedStatistics: getFormattedStatistics(),
    getStatisticsForPeriod,
    hasData: transactions.length > 0
  };
};

/**
 * useWalletValidation - Custom hook for wallet transaction validation
 */
export const useWalletValidation = () => {
  const validateTransactionData = (data) => {
    const errors = {};

    // Validate amount
    if (!data.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(data.amount) || data.amount <= 0) {
      errors.amount = 'Please enter a valid amount';
    } else if (data.amount < 10) {
      errors.amount = 'Minimum amount is ₹10';
    } else if (data.amount > 50000) {
      errors.amount = 'Maximum amount is ₹50,000';
    }

    // Validate payment method
    if (!data.payment_method) {
      errors.payment_method = 'Payment method is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const getValidationRules = () => {
    return {
      amount: {
        required: true,
        min: 10,
        max: 50000,
        type: 'number'
      },
      payment_method: {
        required: true,
        type: 'string'
      }
    };
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '';
    return numAmount.toFixed(2);
  };

  return {
    validateTransactionData,
    getValidationRules,
    formatAmount
  };
};

export default useWallet;
