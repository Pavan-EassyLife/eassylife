import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../lib/utils';

/**
 * WalletPage - Wallet history and balance management
 * Exactly matches Flutter app wallet functionality and UI design
 */
const WalletPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const {
    balance,
    transactions,
    loading,
    error,
    formattedBalance,
    hasTransactions,
    fetchHistory,
    fetchBalance,
    refresh,
    clearError
  } = useWallet();

  // Fetch wallet data on mount
  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, [fetchBalance, fetchHistory]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/profile');
  };

  // Handle refresh - matches Flutter app pull-to-refresh
  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Show loading state like Flutter app
  if (loading && !hasTransactions) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className={cn(
            "flex items-center justify-between p-4",
            !isMobile && "mx-auto"
          )} style={!isMobile ? { maxWidth: '85%' } : {}}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Wallet History</h1>
            </div>
          </div>
        </div>

        {/* Loading content */}
        <div className={cn(
          "flex items-center justify-center pt-32",
          !isMobile && "mx-auto"
        )} style={!isMobile ? { maxWidth: '85%' } : {}}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Wallet History - EassyLife</title>
        <meta name="description" content="View your wallet balance and transaction history" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className={cn(
            "px-4 sm:px-6",
            !isMobile && "mx-auto"
          )} style={!isMobile ? { maxWidth: '85%' } : {}}>
            <div className="flex items-center h-16">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Wallet History</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          className={cn(
            "pb-6",
            !isMobile && "mx-auto"
          )}
          style={!isMobile ? { maxWidth: '85%' } : {}}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Balance Card - Matches Flutter app exactly */}
          <motion.div
            variants={itemVariants}
            className="mx-6 mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              {/* Wallet icon - Exact Flutter app design with background image */}
              <div
                className="w-20 h-20 rounded-2xl mr-7 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: 'url(/images/add_payment.png)',
                  backgroundSize: 'cover'
                }}
              />

              {/* Balance text */}
              <div>
                <p className="text-gray-900 text-base font-semibold mb-1">Total payments received</p>
                <p className="text-orange-400 text-3xl font-bold">{formattedBalance || '₹0'}</p>
              </div>
            </div>
          </motion.div>

          {/* Transaction History - Matches Flutter app exactly */}
          <motion.div variants={itemVariants} className="mt-6">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
              <span className="text-sm font-medium text-gray-600">
                {transactions?.length || 1} Transactions
              </span>
            </div>

            {error && (
              <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!hasTransactions ? (
              <div className="mx-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
                <p className="text-gray-600 mb-6">Your wallet transaction history will appear here</p>
              </div>
            ) : (
              <div className="mx-4 space-y-3">
                {transactions?.map((transaction, index) => (
                  <TransactionItem key={transaction.id || index} transaction={transaction} />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

/**
 * TransactionItem - Individual transaction display component
 * Matches Flutter app design exactly
 */
const TransactionItem = ({ transaction }) => {
  const isCredit = transaction.transaction_type === 'credit';
  const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
  const iconBgColor = isCredit ? 'bg-green-100' : 'bg-red-100';
  const iconColor = isCredit ? 'text-green-600' : 'text-red-600';

  // Format date like Flutter app: "Thu 8 May, 2025"
  const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleDateString();
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center">
        {/* Icon circle - Exact Flutter app design */}
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mr-4 p-2', iconBgColor)}>
          {isCredit ? (
            <svg className={cn('w-6 h-6', iconColor)} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8"/>
            </svg>
          ) : (
            <svg className={cn('w-6 h-6', iconColor)} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8"/>
            </svg>
          )}
        </div>

        {/* Transaction details */}
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-base">
            {transaction.description || transaction.reason?.replace(/_/g, ' ').toUpperCase() || 'SIGN UP'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(transaction.created_at)}
          </p>
        </div>

        {/* Amount and balance */}
        <div className="text-right">
          <p className={cn('font-semibold text-base', amountColor)}>
            {isCredit ? '+' : ''}₹{Math.abs(transaction.amount || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Balance: ₹{transaction.new_balance || 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletPage;
