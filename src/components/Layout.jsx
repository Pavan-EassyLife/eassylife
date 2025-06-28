import React from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./common";
import Footer from "./common/Footer";
import { MobileLayout } from "./mobile";
import { useAuthContext } from "../contexts/AuthContext";
import { useMobileNavigation } from "../contexts/MobileNavigationContext";
import "../globals.css";

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const { shouldHideDesktopHeader } = useMobileNavigation();

  // Determine which page we're on for the Header component
  const getCurrentPage = () => {
    if (location.pathname === '/' || location.pathname === '/home') {
      return 'home';
    } else if (location.pathname === '/address') {
      return 'address';
    } else if (location.pathname.startsWith('/orders')) {
      return 'orders';
    } else if (location.pathname.startsWith('/service/')) {
      return 'service'; // Service details pages
    } else {
      return 'other'; // For all other pages, use generic header
    }
  };

  // Only show header for authenticated routes (not landing page)
  const showHeader = location.pathname !== '/landing';

  // Only show footer for authenticated routes (not landing page)
  const showFooter = location.pathname !== '/landing';

  return (
    <>
      <Helmet>
        <title>EassyService - Your Services Marketplace</title>
        <meta name="description" content="Find trusted professionals for all your home service needs" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#fb923c" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className="font-inter min-h-screen bg-gray-50 mobile-layout-active w-full max-w-full">
        {/* Desktop/Tablet Header - hidden on mobile when mobile layout is active */}
        {showHeader && !shouldHideDesktopHeader() && (
          <Header
            currentPage={getCurrentPage()}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* Mobile Layout Components - only visible on mobile */}
        <MobileLayout />

        <main className="relative w-full max-w-full">
          <Outlet />
        </main>

        {/* Footer - shown on all authenticated pages */}
        {showFooter && !shouldHideDesktopHeader() && (
          <Footer />
        )}
      </div>
    </>
  );
};

export default Layout;
