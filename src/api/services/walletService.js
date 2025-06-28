import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * WalletService - Handles wallet-related operations
 * Based on Flutter app wallet functionality
 */
class WalletService {
  /**
   * Get wallet transaction history
   * @param {Object} options - Query options
   * @param {number} options.page - Page number for pagination
   * @param {number} options.limit - Number of transactions per page
   * @param {string} options.type - Transaction type filter (credit|debit|all)
   * @returns {Promise<Object>} Wallet transaction history
   */
  async getWalletHistory(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = 'all'
      } = options;

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (page > 1) queryParams.append('page', page.toString());
      if (limit !== 20) queryParams.append('limit', limit.toString());
      if (type !== 'all') queryParams.append('type', type);

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.WALLET_HISTORY}?${queryParams.toString()}`
        : API_ENDPOINTS.WALLET_HISTORY;

      const response = await axiosInstance.get(url);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('❌ WalletService.getWalletHistory error:', error);
      throw new Error(error.message || 'Failed to fetch wallet history');
    }
  }

  /**
   * Get wallet balance - calculated from transaction history
   * Since there's no separate balance endpoint, we calculate from the latest transaction
   * @returns {Promise<Object>} Current wallet balance
   */
  async getWalletBalance() {
    try {
      // Get the latest transaction to get current balance
      const response = await axiosInstance.get(`${API_ENDPOINTS.WALLET_HISTORY}?limit=1`);

      if (response.data.status && response.data.data && response.data.data.length > 0) {
        const latestTransaction = response.data.data[0];
        const balance = parseFloat(latestTransaction.new_balance || 0);

        return {
          success: true,
          message: 'Wallet balance retrieved successfully',
          data: { balance },
        };
      } else {
        // No transactions found, balance is 0
        return {
          success: true,
          message: 'No transactions found',
          data: { balance: 0 },
        };
      }
    } catch (error) {
      console.error('❌ WalletService.getWalletBalance error:', error);
      // Return 0 balance on error instead of throwing
      return {
        success: true,
        message: 'Balance unavailable',
        data: { balance: 0 },
      };
    }
  }

  /**
   * Add money to wallet
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Amount to add
   * @param {string} paymentData.payment_method - Payment method
   * @returns {Promise<Object>} Payment result
   */
  async addMoney(paymentData) {
    try {
      // Validate amount
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Validate minimum amount (if required)
      const minAmount = 10;
      if (paymentData.amount < minAmount) {
        throw new Error(`Minimum amount is ₹${minAmount}`);
      }

      const response = await axiosInstance.post('wallet/add-money', paymentData);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ WalletService.addMoney error:', error);
      throw new Error(error.message || 'Failed to add money to wallet');
    }
  }

  /**
   * Get wallet transaction details
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionDetails(transactionId) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const response = await axiosInstance.get(`wallet/transaction/${transactionId}`);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ WalletService.getTransactionDetails error:', error);
      throw new Error(error.message || 'Failed to fetch transaction details');
    }
  }

  /**
   * Format transaction amount for display
   * @param {Object} transaction - Transaction object
   * @returns {string} Formatted amount with sign
   */
  formatTransactionAmount(transaction) {
    if (!transaction || typeof transaction.amount === 'undefined') {
      return '₹0.00';
    }

    const amount = parseFloat(transaction.amount);
    const formattedAmount = amount.toFixed(2);

    // Add + or - sign based on transaction type
    if (transaction.type === 'credit' || transaction.type === 'refund') {
      return `+₹${formattedAmount}`;
    } else if (transaction.type === 'debit' || transaction.type === 'payment') {
      return `-₹${formattedAmount}`;
    }

    return `₹${formattedAmount}`;
  }

  /**
   * Get transaction type display information
   * @param {string} type - Transaction type
   * @returns {Object} Display information for transaction type
   */
  getTransactionTypeInfo(type) {
    const typeMap = {
      credit: {
        label: 'Money Added',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '💰'
      },
      debit: {
        label: 'Payment',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '💳'
      },
      refund: {
        label: 'Refund',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '↩️'
      },
      cashback: {
        label: 'Cashback',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🎁'
      },
      bonus: {
        label: 'Bonus',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        icon: '🌟'
      }
    };

    return typeMap[type] || {
      label: 'Transaction',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '💼'
    };
  }

  /**
   * Validate wallet transaction data
   * @param {Object} transactionData - Transaction data to validate
   * @returns {Object} Validation result
   */
  validateTransactionData(transactionData) {
    const errors = {};

    // Validate amount
    if (!transactionData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(transactionData.amount) || transactionData.amount <= 0) {
      errors.amount = 'Please enter a valid amount';
    } else if (transactionData.amount < 10) {
      errors.amount = 'Minimum amount is ₹10';
    } else if (transactionData.amount > 50000) {
      errors.amount = 'Maximum amount is ₹50,000';
    }

    // Validate payment method
    if (!transactionData.payment_method) {
      errors.payment_method = 'Payment method is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get wallet statistics
   * @param {Array} transactions - Array of transactions
   * @returns {Object} Wallet statistics
   */
  getWalletStatistics(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        totalCredits: 0,
        totalDebits: 0,
        totalTransactions: 0,
        netAmount: 0
      };
    }

    const stats = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;

      if (transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'cashback') {
        acc.totalCredits += amount;
      } else if (transaction.type === 'debit' || transaction.type === 'payment') {
        acc.totalDebits += amount;
      }

      acc.totalTransactions++;
      return acc;
    }, {
      totalCredits: 0,
      totalDebits: 0,
      totalTransactions: 0
    });

    stats.netAmount = stats.totalCredits - stats.totalDebits;

    return stats;
  }

  /**
   * Filter transactions by date range
   * @param {Array} transactions - Array of transactions
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered transactions
   */
  filterTransactionsByDate(transactions, startDate, endDate) {
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at || transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  /**
   * Group transactions by date
   * @param {Array} transactions - Array of transactions
   * @returns {Object} Transactions grouped by date
   */
  groupTransactionsByDate(transactions) {
    if (!Array.isArray(transactions)) {
      return {};
    }

    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.created_at || transaction.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(transaction);
      return groups;
    }, {});
  }
}

export default new WalletService();
