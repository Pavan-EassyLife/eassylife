import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, ShoppingCart, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuthContext } from '../../contexts/AuthContext';
import { useAddressContext } from '../../contexts/AddressContext';

import logoImg from '../../assets/images/eassylife_logo.png';

const Header = ({
  currentPage = 'home',
  isAuthenticated: propIsAuthenticated = null, // Allow override from props
}) => {
  const navigate = useNavigate();
  const { user, logout, hasAddress } = useAuthContext();
  const {
    getDisplayAddress,
    getShortDisplayAddress
  } = useAddressContext();

  // Header state
  const [activeTab, setActiveTab] = useState(currentPage === 'other' ? 'home' : currentPage);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Update activeTab when currentPage changes
  useEffect(() => {
    if (currentPage === 'address' || currentPage === 'other') {
      // For address page and other pages, don't highlight any tab
      setActiveTab('none');
    } else if (currentPage === 'orders') {
      // For order pages, highlight the orders tab
      setActiveTab('orders');
    } else {
      setActiveTab(currentPage);
    }
  }, [currentPage]);

  // Use prop override or context authentication state
  const isAuthenticated = propIsAuthenticated !== null ? propIsAuthenticated : !!user;
  const isVIPMember = user?.isVIP || false;



  // Show address and search only on home page
  const isSimplifiedHeader = currentPage !== 'home';

  // Only show search bar on home page
  const shouldShowSearchBar = currentPage === 'home';

  // Only show address selector on home page
  const shouldShowAddressSelector = currentPage === 'home';

  // Header handlers
  const handleMyOrders = () => {
    navigate('/orders');
  };

  const handleJoinVIP = () => {
    navigate('/vip');
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
    navigate('/settings');
  };

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    try {
      await logout();
      // Navigation will be handled by the logout function
    } catch {
      // Fallback navigation
      navigate('/landing');
    }
  };

  const handleAddressClick = () => {
    // Always navigate to address page - no search functionality
    navigate('/address');
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Consolidated Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        {/* Main Header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            {/* Logo and Navigation Section - Moved slightly left */}
            <div className="flex items-center gap-4 lg:gap-6 -ml-2">
              {/* Logo with fallback */}
              <div
                className="flex items-center cursor-pointer"
                onClick={() => navigate(isAuthenticated ? '/home' : '/landing')}
              >
                <img
                  src={logoImg}
                  alt="EassyLife Logo"
                  className="h-12 w-auto object-contain flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span
                  className="text-xl font-bold text-orange-500 hidden"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  EassyLife
                </span>
              </div>

              {/* Home and My Orders Tabs */}
              <div className="hidden md:flex gap-6">
                {/* Home Tab */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab('home');
                    navigate('/home');
                  }}
                  className={`relative py-3 px-4 h-auto transition-all duration-300 hover:bg-transparent group ${
                    activeTab === 'home'
                      ? 'text-palette-orange'
                      : 'text-gray-700 hover:text-palette-orange'
                  }`}
                >
                  <span className="text-base font-medium">Home</span>
                  {/* Active underline */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 ${
                    activeTab === 'home' ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  {/* Hover underline */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                </Button>

                {/* My Orders Tab */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab('orders');
                    handleMyOrders();
                  }}
                  className={`relative py-3 px-4 h-auto transition-all duration-300 hover:bg-transparent group ${
                    activeTab === 'orders'
                      ? 'text-palette-orange'
                      : 'text-gray-700 hover:text-palette-orange'
                  }`}
                >
                  <span className="text-base font-medium">My Orders</span>
                  {/* Active underline */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 ${
                    activeTab === 'orders' ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  {/* Hover underline */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                </Button>
              </div>
            </div>

            {/* Center Section - Address Selector and Search (only for home page) */}
            {!isSimplifiedHeader && (
              <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-4 xl:mx-8">
              {/* Address Selector - Only show on home page */}
              {shouldShowAddressSelector && (
                <div className="relative flex-1 max-w-sm">
                  <Button
                    variant="ghost"
                    onClick={handleAddressClick}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 min-w-0 w-full h-auto justify-start transition-colors duration-300"
                  >
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs text-gray-600 truncate max-w-[200px]" title={getDisplayAddress()}>
                        {getDisplayAddress()}
                      </p>
                    </div>
                  </Button>
                </div>
              )}

              {/* Search Bar - Only show on home page */}
              {shouldShowSearchBar && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    type="text"
                    placeholder="Search for services..."
                    className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:border-palette-orange focus:ring-palette-orange"
                  />
                </div>
              )}
              </div>
            )}

            {/* VIP and Action Buttons - Moved slightly right */}
            <div className="flex items-center gap-3 lg:gap-6 mr-2">
              {/* Join VIP Button - Only show if user is not VIP */}
              {isAuthenticated && !isVIPMember && (
                <Button
                  onClick={handleJoinVIP}
                  className="text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-1000 ease-in-out shadow-sm hover:shadow-md flex items-center gap-2 relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(-45deg, #f97316, #fb923c, #fdba74)',
                    backgroundSize: '400% 400%',
                    animation: 'gradient 8s ease infinite',
                    transition: 'box-shadow 800ms ease-in-out, transform 600ms ease-in-out'
                  }}
                >
                  {/* Flash effect on hover with smooth fade */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-1000 ease-in-out pointer-events-none"></div>

                  <div className="w-5 h-5 bg-white bg-opacity-25 rounded-full flex items-center justify-center relative z-10 transition-all duration-600 ease-in-out group-hover:bg-opacity-35 shadow-md">
                    <Star className="w-3 h-3 text-white fill-white transition-all duration-600 ease-in-out group-hover:scale-110 drop-shadow-sm" />
                  </div>
                  <span className="text-sm font-bold relative z-10 transition-all duration-600 ease-in-out">Join VIP</span>
                </Button>
              )}

              {/* Call Button */}
              <Button
                variant="ghost"
                className="flex flex-col items-center py-2 px-3 h-auto transition-colors duration-300 text-gray-600 hover:text-palette-orange hover:bg-transparent"
              >
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium hidden sm:block">Call</span>
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                onClick={() => navigate('/cart')}
                className="flex flex-col items-center py-2 px-3 h-auto transition-colors duration-300 text-gray-600 hover:text-palette-orange hover:bg-transparent"
              >
                <ShoppingCart className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium hidden sm:block">Cart</span>
              </Button>

              {/* Profile Button with Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <Button
                  variant="ghost"
                  onClick={handleProfileClick}
                  className="text-gray-700 hover:text-palette-orange hover:bg-orange-50 transition-all duration-300 flex-shrink-0 flex items-center gap-1 px-2 py-2 h-auto"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-palette-orange to-orange-600 text-white rounded-full flex items-center justify-center shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
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
                        className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-palette-orange transition-colors duration-300"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleSettings}
                        className="w-full justify-start px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-palette-orange transition-colors duration-300"
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
        </div>

        {/* Mobile Navigation Tabs (only for home/address pages) */}
        {!isSimplifiedHeader && (
          <div className="md:hidden border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-8">
              {/* Home Tab */}
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTab('home');
                  navigate('/home');
                }}
                className={`relative py-3 px-4 h-auto transition-all duration-300 hover:bg-transparent group ${
                  activeTab === 'home'
                    ? 'text-palette-orange'
                    : 'text-gray-700 hover:text-palette-orange'
                }`}
              >
                <span className="text-base font-medium">Home</span>
                {/* Active underline */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 ${
                  activeTab === 'home' ? 'opacity-100' : 'opacity-0'
                }`}></div>
                {/* Hover underline */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              </Button>

              {/* My Orders Tab */}
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTab('orders');
                  handleMyOrders();
                }}
                className={`relative py-3 px-4 h-auto transition-all duration-300 hover:bg-transparent group ${
                  activeTab === 'orders'
                    ? 'text-palette-orange'
                    : 'text-gray-700 hover:text-palette-orange'
                }`}
              >
                <span className="text-base font-medium">My Orders</span>
                {/* Active underline */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 ${
                  activeTab === 'orders' ? 'opacity-100' : 'opacity-0'
                }`}></div>
                {/* Hover underline */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-orange transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              </Button>
            </div>
          </div>
          </div>
        )}

        {/* Mobile Search Bar (only for home page) */}
        {!isSimplifiedHeader && (
          <div className="lg:hidden border-t border-gray-100 bg-gray-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-3">
              {/* Mobile Address Selector - Only show on home page */}
              {shouldShowAddressSelector && (
                <Button
                  variant="ghost"
                  onClick={handleAddressClick}
                  className="flex items-center gap-2 bg-white hover:bg-gray-100 rounded-lg px-3 py-2 min-w-0 flex-1 h-auto justify-start transition-colors duration-300 max-w-[200px]"
                >
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm text-gray-500 truncate" title={getDisplayAddress()}>
                      {getShortDisplayAddress()}
                    </p>
                  </div>
                </Button>
              )}

              {/* Mobile Search Bar - Only show on home page */}
              {shouldShowSearchBar && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:border-palette-orange focus:ring-palette-orange"
                  />
                </div>
              )}
            </div>


          </div>
          </div>
        )}
      </header>

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
    </>
  );
};

export default Header;
