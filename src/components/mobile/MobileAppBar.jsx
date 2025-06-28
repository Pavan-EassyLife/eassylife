import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAddressContext } from '../../contexts/AddressContext';
import logoImg from '../../assets/images/eassylife_logo.png';

/**
 * MobileAppBar - Simplified mobile header matching Flutter app design
 * Features:
 * - Location selector with address display
 * - Profile avatar with dropdown
 * - VIP button (conditional display)
 * - Only visible on mobile screens (<768px)
 */
const MobileAppBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { getDisplayAddress, getShortDisplayAddress } = useAddressContext();
  
  // Component state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // User data
  const isAuthenticated = !!user;
  const isVIPMember = user?.vip_subscription_status === 'active' || user?.isVIP || false;
  const userName = user?.name || user?.mobile || 'Guest';
  const userImage = user?.image || null;

  // Memoized handlers for performance
  const handleAddressClick = useCallback(() => {
    navigate('/address');
  }, [navigate]);

  const handleJoinVIP = useCallback(() => {
    navigate('/vip');
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  const handleProfile = useCallback(() => {
    setShowProfileDropdown(false);
    navigate('/profile');
  }, [navigate]);

  const handleSettings = useCallback(() => {
    setShowProfileDropdown(false);
    navigate('/settings');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setShowProfileDropdown(false);
    try {
      await logout();
    } catch {
      navigate('/landing');
    }
  }, [logout, navigate]);

  // Memoized click outside handler
  const handleClickOutside = useCallback((event) => {
    if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
      setShowProfileDropdown(false);
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileDropdown, handleClickOutside]);

  return (
    <div className="mobile-app-bar md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-3 pt-3 pb-4 w-full">

        {/* Single Line - Logo, Address, VIP Button, and Profile */}
        <div className="flex items-center justify-between gap-2 min-h-[44px]">

          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate(isAuthenticated ? '/home' : '/landing')}
            >
              {/* EassyLife Logo with fallback to "E" icon */}
              <img
                src={logoImg}
                alt="EassyLife Logo"
                className="h-8 w-auto object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback "E" icon matching Flutter design */}
              <div
                className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg items-center justify-center flex-shrink-0"
                style={{ display: 'none' }}
              >
                <span className="text-white font-bold text-sm">E</span>
              </div>
            </div>
          </div>

          {/* Address Section - Flexible width */}
          <div className="flex-1 min-w-0 mx-2 max-w-[50%]">
            <Button
              variant="ghost"
              onClick={handleAddressClick}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-2 min-w-0 w-full h-auto justify-start transition-colors duration-300 min-h-[36px]"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <p
                  className="text-xs text-gray-800 leading-tight line-clamp-1 break-words"
                  title={getDisplayAddress()}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }}
                >
                  {getDisplayAddress()}
                </p>
              </div>
            </Button>
          </div>

          {/* VIP Button - Flutter style with stacked layout */}
          {isAuthenticated && !isVIPMember && (
            <div className="flex-shrink-0">
              <Button
                onClick={handleJoinVIP}
                className="text-white font-bold px-2.5 py-1.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-0.5 relative overflow-hidden group min-w-[60px]"
                style={{
                  background: 'linear-gradient(-45deg, #f97316, #fb923c, #fdba74)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient 8s ease infinite'
                }}
              >
                {/* Star icon on top */}
                <div className="w-3.5 h-3.5 bg-white bg-opacity-25 rounded-full flex items-center justify-center relative z-10">
                  <Star className="w-2 h-2 text-white fill-white" />
                </div>
                {/* Text below star */}
                <span className="text-[10px] font-bold relative z-10 whitespace-nowrap leading-tight">Join VIP</span>
              </Button>
            </div>
          )}

          {/* Profile Avatar */}
          <div className="relative flex-shrink-0" ref={profileDropdownRef}>
            <Button
              variant="ghost"
              onClick={handleProfileClick}
              className="text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 flex-shrink-0 flex items-center gap-1 px-2 py-2 h-auto"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <User className="w-4 h-4" style={{ display: userImage ? 'none' : 'block' }} />
              </div>
            </Button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <Button
                    variant="ghost"
                    onClick={handleProfile}
                    className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors duration-300"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSettings}
                    className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors duration-300"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>


      {/* Add CSS animation keyframes */}
      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MobileAppBar);
