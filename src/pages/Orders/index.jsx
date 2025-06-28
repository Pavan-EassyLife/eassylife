import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../../contexts/OrderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { RefreshCw, ShoppingBag } from 'lucide-react';
import OrderCard from '../../components/orders/OrderCard';
import { OrderCardSkeletonList } from '../../components/orders/OrderCardSkeleton';
import { NetworkErrorFallback } from '../../components/orders/OrderErrorBoundary';

const OrdersPage = () => {
  const navigate = useNavigate();
  const {
    orders,
    ordersLoading,
    refreshing,
    error,
    fetchOrders,
    refreshOrders,
    clearError
  } = useOrderContext();

  const [activeTab, setActiveTab] = useState('accepted');
  const [networkError, setNetworkError] = useState(false);

  // Tab configuration - memoized to prevent re-renders
  const tabs = useMemo(() => [
    { key: 'accepted', label: 'Accepted', apiStatus: 'accepted' },
    { key: 'upcoming', label: 'Upcoming', apiStatus: 'upcoming' },
    { key: 'completed', label: 'Completed', apiStatus: 'completed' },
    { key: 'cancelled', label: 'Cancelled', apiStatus: 'cancelled' }
  ], []);

  // Fetch orders on component mount and tab change
  useEffect(() => {
    const currentTab = tabs.find(tab => tab.key === activeTab);
    const currentOrders = orders[activeTab];

    // Only fetch if we don't have orders for this tab
    if (currentTab && (!currentOrders || !Array.isArray(currentOrders) || currentOrders.length === 0)) {
      fetchOrders(currentTab.apiStatus).catch((error) => {
        console.error('Failed to fetch orders:', error);
        // Check if it's a network error
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          setNetworkError(true);
        }
      });
    }
  }, [activeTab, fetchOrders, tabs]); // Remove orders dependency to prevent re-renders

  // Handle tab change
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    clearError();
  }, [clearError]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setNetworkError(false);
      await refreshOrders();
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        setNetworkError(true);
      }
    }
  }, [refreshOrders]);

  // Handle order card click
  const handleOrderClick = useCallback((order, item) => {
    // Use the booking ID (from the original booking) and item ID
    // This matches the Flutter app logic: OrderDetailScreen(orderId: item.bookingId, itemId: item.id)
    const orderId = order.bookingId || order.orderId || order.id;
    const itemId = item.id;

    console.log('🔍 Navigation Debug:', { orderId, itemId, order, item });
    navigate(`/orders/${orderId}/${itemId}`);
  }, [navigate]);

  // Handle explore services click
  const handleExploreServices = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // Render empty state - memoized
  const renderEmptyState = useCallback((tabLabel) => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 max-w-md mx-auto">
      <div className="w-20 sm:w-24 h-20 sm:h-24 mb-6 rounded-full bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500">
        <ShoppingBag className="w-10 sm:w-12 h-10 sm:h-12 text-orange-400" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center animate-in slide-in-from-bottom-4 duration-500 delay-100">
        No {tabLabel} Orders
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm text-sm sm:text-base leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-200">
        You don't have any {tabLabel.toLowerCase()} orders yet. Explore our services to book your first order.
      </p>
      <Button
        onClick={handleExploreServices}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg animate-in slide-in-from-bottom-4 duration-500 delay-300"
      >
        Explore Services
      </Button>
    </div>
  ), [handleExploreServices]);

  // Render loading state - memoized
  const renderLoadingState = useCallback(() => <OrderCardSkeletonList count={3} />, []);

  // Render error state - memoized (user-friendly message without "Something went wrong")
  const renderErrorState = useCallback(() => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 max-w-md mx-auto">
      <div className="w-20 sm:w-24 h-20 sm:h-24 mb-6 rounded-full bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500">
        <ShoppingBag className="w-10 sm:w-12 h-10 sm:h-12 text-orange-400" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center animate-in slide-in-from-bottom-4 duration-500 delay-100">
        Unable to Load Orders
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm text-sm sm:text-base leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-200">
        Please check your internet connection and refresh the page.
      </p>
      <Button
        onClick={handleRefresh}
        disabled={refreshing}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg animate-in slide-in-from-bottom-4 duration-500 delay-300"
      >
        {refreshing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'Refresh'
        )}
      </Button>
    </div>
  ), [error, handleRefresh, refreshing]);

  // Render order list - memoized
  const renderOrderList = useCallback((tabKey, tabLabel) => {
    // Ensure orderList is always an array
    const rawOrderList = orders[tabKey];
    const orderList = Array.isArray(rawOrderList) ? rawOrderList : [];

    // Show network error if detected
    if (networkError && orderList.length === 0) {
      return (
        <NetworkErrorFallback
          onRetry={handleRefresh}
          isRetrying={refreshing}
        />
      );
    }

    if (ordersLoading && orderList.length === 0) {
      return renderLoadingState();
    }

    if (error && orderList.length === 0) {
      return renderErrorState();
    }

    if (orderList.length === 0) {
      return renderEmptyState(tabLabel);
    }

    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 max-w-4xl mx-auto">
        {orderList.map((order, index) => {
          // Validate order object
          if (!order || typeof order !== 'object') {
            console.warn('Invalid order object:', order);
            return null;
          }

          const orderId = order.id || order.orderId || `order-${index}`;
          const itemId = order.items?.[0]?.id || `item-${index}`;

          return (
            <div
              key={`${orderId}-${itemId}`}
              className="animate-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <OrderCard
                order={order}
                onOrderClick={handleOrderClick}
              />
            </div>
          );
        }).filter(Boolean)}
      </div>
    );
  }, [orders, networkError, handleRefresh, refreshing, ordersLoading, error, renderLoadingState, renderErrorState, renderEmptyState, handleOrderClick]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title and Refresh */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-orange-600 transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent border-b-0 h-auto p-0 gap-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="relative px-1 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-500 hover:text-orange-500 hover:bg-orange-50 hover:border-orange-200 data-[state=active]:text-orange-600 data-[state=active]:bg-orange-100 data-[state=active]:font-bold data-[state=active]:shadow-lg data-[state=active]:border-orange-500 data-[state=active]:border-b-4 border-b-2 border-transparent rounded-none transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                >
                  <span className={`truncate transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'text-orange-600 font-bold'
                      : 'text-gray-600 hover:text-orange-500'
                  }`}>
                    {tab.label}
                  </span>
                  {orders[tab.key]?.length > 0 && (
                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full font-medium transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                        : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-600 border border-orange-300'
                    }`}>
                      {orders[tab.key].length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            {tabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="mt-0">
                {renderOrderList(tab.key, tab.label)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
