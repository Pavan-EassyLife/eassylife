import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Calendar,
  MapPin,
  Gift,
  Wallet,
  Heart,
  Bell,
  LogOut,
  ChevronRight,
  Star,
  Share2,
  Plane
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { cn } from '../../lib/utils';

/**
 * MobileProfileLayout - Mobile profile layout matching Flutter app exactly
 * Includes profile header, VIP section, menu items, and action buttons
 */
const MobileProfileLayout = ({ className = '' }) => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    displayName,
    userInitials,
    profileImageUrl,
    isLoading
  } = useProfile();

  const [mobileImageLoadError, setMobileImageLoadError] = useState(false);

  const handleMobileImageError = () => {
    setMobileImageLoadError(true);
  };

  // Menu items matching Flutter app exactly
  const menuItems = [
    {
      id: 'settings',
      label: 'Account Settings',
      icon: Settings,
      action: () => navigate('/settings')
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: Calendar,
      action: () => navigate('/orders')
    },
    {
      id: 'address',
      label: 'Manage Address',
      icon: MapPin,
      action: () => navigate('/address')
    },
    {
      id: 'refer',
      label: 'Refer & Earn',
      icon: Gift,
      action: () => navigate('/refer-earn')
    },
    {
      id: 'wallet',
      label: 'Wallet History',
      icon: Wallet,
      action: () => navigate('/wallet')
    },
    {
      id: 'favourites',
      label: 'Favourites',
      icon: Heart,
      action: () => navigate('/favorites')
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => {} // Do nothing as per user request
    },
    {
      id: 'flight',
      label: 'Flight Booking',
      icon: Plane,
      action: () => console.log('Flight booking coming soon'),
      disabled: true
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: () => console.log('Logout'),
      isDestructive: true
    }
  ];

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
    }
  };

  const handleEditProfile = () => {
    // Navigate to profile edit or show modal
    console.log('Edit profile');
  };

  const handleRateApp = () => {
    // Open app store for rating
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'rate_app' }));
    } else {
      // Fallback for web
      window.open('https://play.google.com/store/apps/details?id=com.eassylife.app', '_blank');
    }
  };

  const handleShareApp = () => {
    // Share app functionality
    const shareText = `Hey, Life's Easy With EassyLife. Use this link to download the app now: https://eassylife.in/app`;

    if (navigator.share) {
      navigator.share({
        title: 'EassyLife App',
        text: shareText,
        url: 'https://eassylife.in/app'
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      // Show toast notification
      console.log('Link copied to clipboard');
    } else {
      // Fallback
      console.log('Share app');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-white', className)}>
      <div className="pt-4 pb-6">
        {/* Profile Header Container - Matching Flutter app */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-6 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
        >
          {/* Profile Info Section */}
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Avatar with Edit Icon */}
              <div className="relative">
                <button
                  onClick={handleEditProfile}
                  className="relative block"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {profileImageUrl && !mobileImageLoadError ? (
                      <img
                        src={profileImageUrl}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                        onError={handleMobileImageError}
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {userInitials}
                      </span>
                    )}
                  </div>
                  {/* Edit Icon */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* User Info - Only show email in mobile view */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* VIP Member Section - Exact Flutter app background */}
          <div className="relative">
            <div
              className="h-20 bg-cover bg-center bg-no-repeat flex items-center justify-center cursor-pointer"
              style={{ backgroundImage: 'url(/images/become_vip.png)' }}
              onClick={() => console.log('Navigate to VIP plans')}
            >
              {/* Remove text overlay to match Flutter app exactly */}
            </div>
          </div>
        </motion.div>

        {/* Menu Items List - Matching Flutter app spacing */}
        <div className="mt-3 px-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === menuItems.length - 1;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleMenuItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center justify-between py-6 transition-colors duration-200',
                    item.isDestructive ? 'hover:bg-red-50' : 'hover:bg-gray-50',
                    'rounded-lg px-2',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      'w-6 h-6',
                      item.isDestructive ? 'text-red-600' : 'text-gray-700'
                    )} />
                    <span className={cn(
                      'text-base font-medium',
                      item.isDestructive ? 'text-red-600' : 'text-gray-900'
                    )}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    'w-5 h-5',
                    item.isDestructive ? 'text-red-400' : 'text-gray-400'
                  )} />
                </button>
                
                {/* Divider - except for last item */}
                {!isLast && (
                  <div className="h-px bg-gray-200 mx-2" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons - Matching Flutter app */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 mx-6 flex gap-4"
        >
          {/* Rate App Button */}
          <button
            onClick={handleRateApp}
            className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Star className="w-5 h-5" />
            <span className="font-semibold">Rate App</span>
          </button>

          {/* Share App Button */}
          <button
            onClick={handleShareApp}
            className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-semibold">Share App</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileProfileLayout;
