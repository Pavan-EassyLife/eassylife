import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';
import { useFavorites } from '../../hooks/useFavorites';

/**
 * FavoritesPage - User's favorite services and categories
 * Exactly matches Flutter app favorites functionality with responsive design
 */
const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  // Use the favorites hook for real API integration
  const {
    favorites,
    loading,
    refreshing,
    isEmpty,
    refreshFavorites,
    toggleFavorite
  } = useFavorites();

  // Handle back navigation
  const handleBack = () => {
    navigate('/profile');
  };

  // Handle remove from favorites (matches Flutter app's ToggleFavEvent)
  const handleRemoveFavorite = async (favoriteId) => {
    await toggleFavorite(favoriteId);
  };

  // Handle explore button click
  const handleExplore = () => {
    navigate('/home');
  };

  // Handle view details click
  const handleViewDetails = (favorite) => {
    // Navigate to service details based on type (matches Flutter app logic)
    if (favorite.type === 'category') {
      navigate(`/services/${favorite.selection_id}`);
    } else if (favorite.type === 'subcategory') {
      navigate(`/services/${favorite.subcategory?.category_id || ''}/${favorite.selection_id}`);
    }
  };

  // Handle refresh (pull to refresh functionality)
  const handleRefresh = async () => {
    await refreshFavorites();
  };

  // Loading state (matches Flutter app loading indicator)
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Favourites - EassyLife</title>
        <meta name="description" content="Your favorite services and categories on EassyLife" />
      </Helmet>

      {isMobile ? (
        // Mobile View - Exact Flutter App Design
        <div className="min-h-screen bg-white flex flex-col">
          {/* Mobile Header - Matches Flutter commonAppBarWidgetBuilder */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="px-4 sm:px-6">
              <div className="flex items-center h-16">
                <div className="flex items-center ml-16">
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                  </button>
                  <h1 className="ml-6 text-xl font-semibold text-gray-900">Favourites</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 bg-white">
            {isEmpty ? (
              // No Data Found State - Exact Flutter Design
              <div className="flex flex-col items-center justify-center px-6 py-20">
                <div className="mb-5">
                  <img 
                    src="/images/sad.png" 
                    alt="No Services Found" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <p className="text-base font-medium text-gray-900 mb-8 text-center">
                  No Services found!
                </p>
                <button
                  onClick={handleExplore}
                  className="w-full max-w-sm bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
                >
                  Explore
                </button>
              </div>
            ) : (
              // Favorites List - Exact Flutter Design
              <div className="flex-1">
                {/* Pull to Refresh Indicator */}
                {refreshing && (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
                  </div>
                )}
                
                {/* Favorites List */}
                <div className="px-4 py-4 space-y-5">
                  {favorites.map((favorite) => (
                    <FavoriteItemMobile
                      key={favorite.id}
                      favorite={favorite}
                      onRemove={() => handleRemoveFavorite(favorite.id)}
                      onViewDetails={() => handleViewDetails(favorite)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Desktop View - Centered Layout with Max Width
        <div className="min-h-screen bg-gray-50">
          {/* Desktop Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="px-4 sm:px-6">
              <div className="flex items-center h-16">
                <div className="flex items-center ml-16">
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                  </button>
                  <h1 className="ml-6 text-xl font-semibold text-gray-900">Favourites</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content - Centered with Max Width */}
          <div className="flex justify-center px-4 py-8">
            <div className="w-full max-w-4xl">
              {isEmpty ? (
                // No Data Found State - Desktop Optimized
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                  <div className="mb-6">
                    <img 
                      src="/images/sad.png" 
                      alt="No Services Found" 
                      className="w-32 h-32 object-contain mx-auto"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Services found!
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start adding services and categories to your favorites to see them here.
                  </p>
                  <button
                    onClick={handleExplore}
                    className="bg-orange-500 text-white py-3 px-8 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
                  >
                    Explore
                  </button>
                </div>
              ) : (
                // Favorites Grid - Desktop Layout
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Desktop Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Your Favourites ({favorites.length})
                      </h2>
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Desktop Favorites List */}
                  <div className="p-6 space-y-4">
                    {favorites.map((favorite) => (
                      <FavoriteItemDesktop
                        key={favorite.id}
                        favorite={favorite}
                        onRemove={() => handleRemoveFavorite(favorite.id)}
                        onViewDetails={() => handleViewDetails(favorite)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * FavoriteItemMobile - Mobile favorite item component (matches Flutter design exactly)
 */
const FavoriteItemMobile = ({ favorite, onRemove, onViewDetails }) => {
  // Get the display name and image based on type (matches Flutter logic)
  const displayName = favorite.type === 'category'
    ? (favorite.category?.name || '')
    : (favorite.subcategory?.name || '');

  const displayImage = favorite.type === 'category'
    ? (favorite.category?.image || '')
    : (favorite.subcategory?.image || '');

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Row Layout - Matches Flutter favItemBuilder */}
      <div className="flex items-center justify-start">
        {/* Service Image */}
        <div className="w-16 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        </div>

        {/* Service Name */}
        <div className="ml-3 flex-1">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
            {displayName}
          </h3>
        </div>

        {/* Favorite Heart Icon */}
        <button
          onClick={onRemove}
          className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Remove from favorites"
        >
          <Heart className="w-5 h-5 text-orange-500 fill-current" />
        </button>
      </div>

      {/* View Details Button - Matches Flutter AppButton */}
      <div className="mt-6">
        <button
          onClick={onViewDetails}
          className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

/**
 * FavoriteItemDesktop - Desktop favorite item component (optimized for larger screens)
 */
const FavoriteItemDesktop = ({ favorite, onRemove, onViewDetails }) => {
  // Get the display name and image based on type (matches Flutter logic)
  const displayName = favorite.type === 'category'
    ? (favorite.category?.name || '')
    : (favorite.subcategory?.name || '');

  const displayImage = favorite.type === 'category'
    ? (favorite.category?.image || '')
    : (favorite.subcategory?.image || '');

  return (
    <motion.div
      className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Image and Name */}
        <div className="flex items-center flex-1">
          {/* Service Image */}
          <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
              No Image
            </div>
          </div>

          {/* Service Info */}
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {favorite.type === 'category' ? 'Service Category' : 'Service Subcategory'}
            </p>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onViewDetails}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            View Details
          </button>
          <button
            onClick={onRemove}
            className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200 group"
            aria-label="Remove from favorites"
          >
            <Heart className="w-5 h-5 text-orange-500 fill-current group-hover:text-red-500 transition-colors duration-200" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FavoritesPage;
