import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
  Globe,
  Share2,
  Heart,
  Zap,
  Shield,
  Clock,
  Users,
  Award,
  Home as HomeIcon,
  Settings,
  HelpCircle,
  FileText,
  Star,
  Wrench,
  Truck,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CardContent} from '../../components/ui/card';

import { SmoothCard } from '../../components/ui/SmoothHover';
import { useHomePage } from '../../hooks/useHomePage';
import { isAuthenticated, setAuthToken, setUserData } from '../../utils/tokenManager';
import authService from '../../api/services/authService';

import '../../styles/smooth-animations.css';

const Home = () => {
  const navigate = useNavigate();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Banner height configuration
  const bannerHeight = 'h-60 md:h-80 lg:h-96 mobile-banner-container';

  // CLEAN API Integration
  const {
    loading,
    banners,
    packages,
    services,
    mostBookedServices,
    error,
    fetchHomePageData
  } = useHomePage();

  // Simple computed values
  const hasError = !!error;
  const isLoading = loading;

  // Auto guest login if not authenticated - but don't fetch data here
  useEffect(() => {
    const performGuestLoginIfNeeded = async () => {
      const authStatus = isAuthenticated();

      // If user is not authenticated, perform guest login
      if (!authStatus) {
        try {
          const guestResponse = await authService.guestLogin();

          if (guestResponse.success && guestResponse.data?.token) {
            setAuthToken(guestResponse.data.token);

            // Set guest user data
            const guestUserData = {
              id: guestResponse.data.user?.id || 'guest',
              name: 'Guest User',
              phone: '8888888888',
              country_code: '91',
              isGuest: true,
              ...guestResponse.data.user
            };
            setUserData(guestUserData);
          }
        } catch (error) {
          // Guest login failed, but continue with app
          console.warn('Guest login failed:', error);
        }
      }
    };

    performGuestLoginIfNeeded();
  }, []); // Remove fetchHomePageData dependency to prevent multiple calls

  // Auto-scroll banners
  useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  // Simple event handlers
  const handleRetry = () => fetchHomePageData();

  // Handle service navigation - Replicates Flutter navigation logic
  const handleServiceNavigation = (service) => {
    if (!service?.id && !service?._id) return;

    const serviceId = service.id || service._id;

    // Flutter logic: if subcategories.isEmpty -> ServiceDetailsScreen, else -> SelectServiceScreen
    if (service.subcategories && service.subcategories.length > 0) {
      // Has subcategories - go to service selection page
      navigate(`/service-selection/${serviceId}`);
    } else {
      // No subcategories - go directly to service details page
      navigate(`/service-details/${serviceId}`);
    }
  };

  // Simple banner navigation
  const nextBanner = () => {
    if (banners && banners.length > 0) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }
  };

  const prevBanner = () => {
    if (banners && banners.length > 0) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  // Memoized Loading Component to prevent re-renders
  const LoadingSpinner = memo(({ message = "Loading..." }) => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
      <span className="text-gray-600">{message}</span>
    </div>
  ));

  // Memoized Error Component to prevent re-renders
  const ErrorMessage = memo(({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" style={{ display: loading ? 'block' : 'none' }} />
          Try Again
        </Button>
      )}
    </div>
  ));

  // Global error state - show if all APIs failed
  if (hasError && !banners?.length && !packages?.length && !services?.length && !mostBookedServices?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-6">
            We're having trouble loading the home page. Please check your internet connection and try again.
          </p>
          <Button
            onClick={handleRetry}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
        </div>
      </div>
    );
  }




  // Show global loading state on initial load
  if (loading && (!banners?.length && !packages?.length && !services?.length)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading EassyLife</h2>
          <p className="text-gray-500">Fetching the best services for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full">


      {/* Main Content */}
      <main className="w-full max-w-full px-0 py-2 md:max-w-7xl md:mx-auto md:px-2">




        {/* Banner Carousel with Animated Gradient Background */}
        <section className="my-8 px-4 md:px-0">
          {isLoading ? (
            <div className="h-64 md:h-80 rounded-xl bg-gray-100 flex items-center justify-center">
              <LoadingSpinner message="Loading banners..." />
            </div>
          ) : hasError ? (
            <div className="h-64 md:h-80 rounded-xl bg-gray-100 flex items-center justify-center">
              <ErrorMessage message="Failed to load banners" onRetry={handleRetry} />
            </div>
          ) : banners && banners.length > 0 ? (
            <>
              <div
                className={`group relative ${bannerHeight} rounded-xl overflow-hidden transition-all duration-700 ease-out`}
                style={{
                  boxShadow: '0 8px 32px rgba(251, 146, 60, 0.15), 0 4px 16px rgba(251, 146, 60, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
                  transition: 'box-shadow 0.7s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(251, 146, 60, 0.25), 0 8px 24px rgba(251, 146, 60, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(251, 146, 60, 0.15), 0 4px 16px rgba(251, 146, 60, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Clean background for mobile/tablet (when using object-cover) */}
                <div className="absolute inset-0 z-0 lg:hidden bg-gray-50"></div>

                {/* Blurred background - ONLY on desktop (when using object-contain) */}
                <div className="absolute inset-0 z-0 hidden lg:block">
                  <img
                    src={banners[currentBannerIndex]?.image || banners[currentBannerIndex]?.imageUrl}
                    alt="Background"
                    className="w-full h-full object-cover blur-xl opacity-30 scale-110"
                  />
                </div>

                {/* Banner images with smooth crossfade transitions */}
                {banners.map((banner, index) => (
                  <div
                    key={banner.id || index}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{
                      opacity: index === currentBannerIndex ? 1 : 0,
                      zIndex: index === currentBannerIndex ? 15 : 10
                    }}
                  >
                    {banner?.image || banner?.imageUrl ? (
                      <img
                        src={banner?.image || banner?.imageUrl}
                        alt={banner?.title || `Banner ${index + 1}`}
                        className="w-full h-full transition-transform duration-700 ease-out object-contain mobile-banner-image"
                        style={{
                          objectPosition: 'center center',
                          backgroundColor: 'transparent'
                        }}
                        onError={(e) => {
                          // Safe fallback - hide image on error, show gradient instead
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 opacity-60"></div>
                    )}

                    {/* No text overlays - clean banner display */}
                  </div>
                ))}

                {/* Left Navigation Arrow - Hidden on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full transition-all duration-300 backdrop-blur-md border border-white/20 hidden md:flex md:w-10 md:h-10 lg:w-12 lg:h-12"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                </Button>

                {/* Right Navigation Arrow - Hidden on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 rounded-full transition-all duration-300 backdrop-blur-md border border-white/20 hidden md:flex md:w-10 md:h-10 lg:w-12 lg:h-12"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                </Button>
                {/* Banner Pagination Dots - Overlaid on banner with correct responsive scaling */}
                <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex justify-center gap-1.5 md:gap-2 mobile-banner-dots">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 mobile-banner-dot ${
                        index === currentBannerIndex
                          ? 'bg-orange-500 shadow-lg scale-110 w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 active'
                          : 'bg-white/60 hover:bg-white/80 hover:scale-105 w-1.5 h-1.5 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5'
                      }`}
                      style={{
                        boxShadow: index === currentBannerIndex
                          ? '0 2px 8px rgba(251, 146, 60, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.9)'
                          : '0 1px 4px rgba(0, 0, 0, 0.25)',
                        minWidth: '12px',
                        minHeight: '12px'
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Fallback banner when no API data
            <div
              className="relative h-64 md:h-80 rounded-xl overflow-hidden transition-all duration-700 ease-out"
              style={{
                boxShadow: '0 8px 32px rgba(251, 146, 60, 0.15), 0 4px 16px rgba(251, 146, 60, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient 8s ease infinite'
                }}
              />
              <div className="absolute top-1/2 left-8 md:left-12 transform -translate-y-1/2 text-white z-20">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">Welcome to EassyLife</h2>
                <p className="text-lg md:text-2xl font-bold mb-4 drop-shadow-lg">
                  Your trusted service partner
                </p>
                <Button
                  className="text-white font-bold px-6 py-2 rounded-lg transition-all duration-500 ease-in-out shadow-lg hover:shadow-xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
                    backgroundSize: '400% 400%',
                    animation: 'gradient 8s ease infinite'
                  }}
                >
                  EXPLORE SERVICES
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Orange Promotional Strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white text-center py-4 px-6 rounded-lg mb-8 font-semibold text-lg shadow-md relative overflow-hidden mx-2 md:mx-0"
          style={{
            background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
            backgroundSize: '400% 400%',
            animation: 'gradient 8s ease infinite'
          }}
        >
          Book any service, pay just 10%* now and the rest at your doorstep!
        </motion.section>



        {/* Choose Services Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 px-0 md:px-0"
        >
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 text-center md:text-left mobile-heading px-4 md:px-0">Choose Services</h2>
          {isLoading ? (
            <LoadingSpinner message="Loading services..." />
          ) : hasError ? (
            <ErrorMessage message="Failed to load services" onRetry={handleRetry} />
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-6 mobile-services-grid">
              {services.map((service) => (
                <SmoothCard
                  key={service.id || service._id}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-4 text-center cursor-pointer transition-all duration-500 ease-in-out hover:border-orange-200 hover:bg-gradient-to-br hover:from-white hover:to-orange-50/30 mobile-service-card mobile-touch-feedback mobile-hover-disabled"
                  type="card"
                  hoverScale={1.05}
                  hoverY={-4}
                  hoverShadow="0 20px 40px rgba(251, 146, 60, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)"
                  onClick={() => handleServiceNavigation(service)}
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <CardContent className="p-0">
                    <div className="relative w-32 h-32 mx-auto mb-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl flex items-center justify-center transition-all duration-500 ease-in-out group-hover:from-orange-100 group-hover:to-orange-200/50 group-hover:scale-105">
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>

                      {service.icon || service.image || service.imageUrl ? (
                        <img
                          src={service.icon || service.image || service.imageUrl}
                          alt={service.name || service.title}
                          className="relative z-10 w-28 h-28 object-contain transition-all duration-500 ease-in-out group-hover:scale-110"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.2))',
                            imageRendering: 'crisp-edges',
                            transform: 'translate3d(0, 0, 0)'
                          }}
                          onError={(e) => {
                            // Safe fallback - replace with icon
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="relative z-10 text-orange-600 text-7xl transition-all duration-500 ease-in-out group-hover:scale-110">🔧</div>';
                          }}
                        />
                      ) : (
                        <div className="relative z-10 text-orange-600 text-7xl transition-all duration-500 ease-in-out group-hover:scale-110">🔧</div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 crisp-text transition-colors duration-300 group-hover:text-orange-700">
                      {service.name || service.title}
                    </h3>

                    {/* Subtle bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-in-out group-hover:w-12 rounded-full"></div>
                  </CardContent>
                </SmoothCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No services available at the moment.</p>
            </div>
          )}
        </motion.section>

        {/* Most Booked Services */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 px-0 md:px-0"
        >
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6 text-center md:text-left mobile-heading px-4 md:px-0">Most Booked Services</h2>
          {isLoading ? (
            <LoadingSpinner message="Loading popular services..." />
          ) : hasError ? (
            <ErrorMessage message="Failed to load popular services" onRetry={handleRetry} />
          ) : mostBookedServices && mostBookedServices.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 md:gap-6 mobile-most-booked-grid">
              {mostBookedServices.map((service) => (
                <SmoothCard
                  key={service.id || service._id}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-4 text-center cursor-pointer transition-all duration-500 ease-in-out hover:border-yellow-200 hover:bg-gradient-to-br hover:from-white hover:to-yellow-50/30 mobile-service-card mobile-touch-feedback mobile-hover-disabled"
                  type="card"
                  hoverScale={1.05}
                  hoverY={-4}
                  hoverShadow="0 20px 40px rgba(255, 193, 7, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)"
                  onClick={() => handleServiceNavigation(service)}
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <CardContent className="p-0">
                    {/* Popular badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12 transition-all duration-500 ease-in-out group-hover:rotate-0 group-hover:scale-110">
                      <span className="text-white text-xs font-bold">⭐</span>
                    </div>

                    <div className="relative w-32 h-32 mx-auto mb-3 bg-gradient-to-br from-yellow-50 to-orange-100/50 rounded-2xl flex items-center justify-center transition-all duration-500 ease-in-out group-hover:from-yellow-100 group-hover:to-orange-200/50 group-hover:scale-105">
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>

                      {service.image || service.icon || service.imageUrl ? (
                        <img
                          src={service.image || service.icon || service.imageUrl}
                          alt={service.name || service.title}
                          className="relative z-10 w-28 h-28 object-contain transition-all duration-500 ease-in-out group-hover:scale-110"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))',
                            imageRendering: 'crisp-edges',
                            transform: 'translate3d(0, 0, 0)'
                          }}
                          onError={(e) => {
                            // Safe fallback - replace with icon
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="relative z-10 text-yellow-600 text-7xl transition-all duration-500 ease-in-out group-hover:scale-110">⭐</div>';
                          }}
                        />
                      ) : (
                        <div className="relative z-10 text-yellow-600 text-7xl transition-all duration-500 ease-in-out group-hover:scale-110">⭐</div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 crisp-text transition-colors duration-300 group-hover:text-yellow-700">
                      {service.name || service.title}
                    </h4>

                    {/* Subtle bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-in-out group-hover:w-12 rounded-full"></div>
                  </CardContent>
                </SmoothCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No popular services data available.</p>
            </div>
          )}
        </motion.section>
      </main>

      {/* Enhanced Footer */}
      <HomeFooter />
    </div>
  );
};

// Enhanced Home Footer Component
const HomeFooter = memo(() => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Our Services",
      links: [
        { name: "Home Cleaning", href: "#", icon: HomeIcon },
        { name: "Appliance Repair", href: "#", icon: Settings },
        { name: "Plumbing", href: "#", icon: Wrench },
        { name: "Delivery Services", href: "#", icon: Truck }
      ]
    },
    {
      title: "Quick Links",
      links: [
        { name: "About Us", href: "#", icon: Users },
        { name: "How It Works", href: "#", icon: HelpCircle },
        { name: "Pricing", href: "#", icon: Star },
        { name: "Book Service", href: "#", icon: CheckCircle }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#", icon: HelpCircle },
        { name: "Contact Us", href: "#", icon: MessageCircle },
        { name: "Terms of Service", href: "#", icon: FileText },
        { name: "Privacy Policy", href: "#", icon: Shield }
      ]
    }
  ];

  const socialLinks = [
    { name: "Website", icon: Globe, href: "#", color: "hover:text-blue-400" },
    { name: "Share", icon: Share2, href: "#", color: "hover:text-green-400" },
    { name: "Community", icon: Heart, href: "#", color: "hover:text-red-400" },
    { name: "Connect", icon: Zap, href: "#", color: "hover:text-yellow-400" }
  ];

  const whyChooseUs = [
    { icon: Shield, title: "Trusted Professionals", description: "Verified and background-checked service providers" },
    { icon: Clock, title: "On-Time Service", description: "Punctual and reliable service delivery" },
    { icon: Award, title: "Quality Guaranteed", description: "100% satisfaction guarantee on all services" },
    { icon: Star, title: "Top Rated", description: "Highly rated by thousands of customers" }
  ];

  return (
    <>
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
          50% { box-shadow: 0 0 30px rgba(251, 146, 60, 0.5); }
        }

        .gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      <motion.footer
        className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 text-white mt-20 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Why Choose Us Section */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose EassyLife?
              </h2>
              <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                Experience the difference with our premium home services
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-100 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-orange-100 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Company Info */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4 pulse-glow"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HomeIcon className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                      EassyLife
                    </span>
                    <p className="text-gray-400 text-sm">Home Services Made Easy</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                  Your trusted partner for all home services. We bring professional,
                  reliable, and convenient services right to your doorstep with just a few clicks.
                </p>

                {/* Contact Info */}
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300 cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Phone className="w-5 h-5 mr-4 flex-shrink-0" />
                    <span>+91 1234 567 890</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300 cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="w-5 h-5 mr-4 flex-shrink-0" />
                    <span>support@eassylife.com</span>
                  </motion.div>
                  <motion.div
                    className="flex items-start text-gray-300 hover:text-orange-400 transition-colors duration-300 cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="w-5 h-5 mr-4 flex-shrink-0 mt-0.5" />
                    <span>Mumbai, Maharashtra, India</span>
                  </motion.div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <motion.button
                    onClick={() => navigate('/cart')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Book Now
                  </motion.button>
                  <motion.button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat Support
                  </motion.button>
                </div>
              </motion.div>

              {/* Footer Sections */}
              {footerSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
                >
                  <h3 className="text-xl font-semibold mb-6 text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + linkIndex * 0.05 }}
                      >
                        <motion.a
                          href={link.href}
                          className="flex items-center text-gray-300 hover:text-orange-400 transition-all duration-300 group"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {link.icon && (
                            <link.icon className="w-4 h-4 mr-3 flex-shrink-0 group-hover:text-orange-400 transition-colors duration-300" />
                          )}
                          <span className="group-hover:underline">
                            {link.name}
                          </span>
                        </motion.a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="bg-gray-900 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Copyright */}
              <motion.div
                className="text-center md:text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <p className="text-gray-400">
                  © 2024 EassyLife. All rights reserved. | Made with ❤️ for better homes
                </p>
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={`w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-all duration-300 ${social.color}`}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-32 -right-32 w-64 h-64 bg-orange-400 bg-opacity-10 rounded-full float-animation"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-16 -left-16 w-48 h-48 bg-orange-300 bg-opacity-10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-32 h-32 bg-orange-500 bg-opacity-5 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
      </motion.footer>
    </>
  );
});

HomeFooter.displayName = 'HomeFooter';

export default Home;
