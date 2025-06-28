import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MobileOnlyRoute from '../components/auth/MobileOnlyRoute';
import Home from '../pages/Home';
import AddressPage from '../pages/Address/index';
import CartPage from '../pages/Cart/CartPage';
import CouponsPage from '../pages/Coupons/CouponsPage';
import OrdersPage from '../pages/Orders/index';
import OrderDetailPage from '../pages/Orders/OrderDetail';
import ProfilePage from '../pages/Profile/index';
import SettingsPage from '../pages/Settings/index';
import NotificationPreferencesPage from '../pages/Settings/NotificationPreferences';
import WalletPage from '../pages/Wallet/index';
import FavoritesPage from '../pages/Favorites/index';
import ReferEarnPage from '../pages/ReferEarn/index';
import VipPage from '../pages/Vip/index';
import ServiceDetailsPage from '../pages/ServiceDetails/index';
import ServiceSelectionPage from '../pages/ServiceSelection/index';
import ServiceProviderPage from '../pages/ServiceProvider/index';
import ApiDebugTest from '../pages/ServiceProvider/ApiDebugTest';
import ServiceRedirectHandler from '../components/ServiceRedirectHandler';
import PaymentSuccessPage from '../pages/PaymentSuccess';
import BookingSuccessPage from '../pages/BookingSuccess';
import NotFound from '../pages/NotFound';
import Landing from '../pages/Landing';

// Define routes with conditional authentication and 404 handling
const router = createBrowserRouter([
  // Public landing page (root route)
  {
    path: '/',
    element: <Landing />,
  },

  // Main application routes with Layout
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/home',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: '/address',
        element: (
          <ProtectedRoute>
            <AddressPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/address/add',
        element: (
          <ProtectedRoute>
            <AddressPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/coupons',
        element: (
          <ProtectedRoute>
            <CouponsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders/:orderId/:itemId',
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings/notifications',
        element: (
          <ProtectedRoute>
            <MobileOnlyRoute>
              <NotificationPreferencesPage />
            </MobileOnlyRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: '/wallet',
        element: (
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/refer-earn',
        element: (
          <ProtectedRoute>
            <ReferEarnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/vip',
        element: (
          <ProtectedRoute>
            <VipPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/service-selection/:categoryId',
        element: (
          <ProtectedRoute>
            <ServiceSelectionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/service-details/:serviceId',
        element: (
          <ProtectedRoute>
            <ServiceDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/service-providers',
        element: (
          <ProtectedRoute>
            <ServiceProviderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/api-debug',
        element: <ApiDebugTest />,
      },
      {
        path: '/service/:serviceId',
        element: (
          <ProtectedRoute>
            <ServiceRedirectHandler />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Payment and Booking Success pages (outside Layout for full-screen experience)
  {
    path: '/payment-success',
    element: (
      <ProtectedRoute>
        <PaymentSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/booking-success',
    element: (
      <ProtectedRoute>
        <BookingSuccessPage />
      </ProtectedRoute>
    ),
  },

  // Custom 404 Not Found page (outside Layout for full control)
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
