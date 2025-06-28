import { useState, useEffect, useCallback } from 'react';
import favoritesService from '../api/services/favoritesService';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing favorites functionality
 * Matches Flutter app's FavouriteBloc functionality
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch favorites from API
   * Matches Flutter app's FetchFavouriteDataEvent
   */
  const fetchFavorites = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const response = await favoritesService.getFavorites();
      
      if (response.success) {
        setFavorites(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch favorites');
      }
    } catch (err) {
      console.error('❌ useFavorites: Error fetching favorites:', err);
      setError(err.message || 'Failed to fetch favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Refresh favorites data
   * Matches Flutter app's RefreshFavouriteDataEvent
   */
  const refreshFavorites = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites(false);
  }, [fetchFavorites]);

  /**
   * Add item to favorites
   * @param {string} selectionId - ID of the item to add
   * @param {string} type - Type of item ('category' or 'subcategory')
   */
  const addToFavorites = useCallback(async (selectionId, type) => {
    try {
      const response = await favoritesService.addFavorite(selectionId, type);
      
      if (response.success) {
        toast.success(response.message || 'Added to favorites');
        // Refresh the favorites list
        await refreshFavorites();
        return true;
      } else {
        toast.error(response.message || 'Failed to add to favorites');
        return false;
      }
    } catch (err) {
      console.error('❌ useFavorites: Error adding to favorites:', err);
      toast.error(err.message || 'Failed to add to favorites');
      return false;
    }
  }, [refreshFavorites]);

  /**
   * Remove item from favorites
   * @param {string} favoriteId - ID of the favorite record to remove
   */
  const removeFromFavorites = useCallback(async (favoriteId) => {
    try {
      const response = await favoritesService.removeFavorite(favoriteId);
      
      if (response.success) {
        toast.success(response.message || 'Removed from favorites');
        // Refresh the favorites list
        await refreshFavorites();
        return true;
      } else {
        toast.error(response.message || 'Failed to remove from favorites');
        return false;
      }
    } catch (err) {
      console.error('❌ useFavorites: Error removing from favorites:', err);
      toast.error(err.message || 'Failed to remove from favorites');
      return false;
    }
  }, [refreshFavorites]);

  /**
   * Toggle favorite status
   * Matches Flutter app's ToggleFavEvent
   * @param {string} favoriteId - ID of the favorite record
   */
  const toggleFavorite = useCallback(async (favoriteId) => {
    try {
      const response = await favoritesService.removeFavorite(favoriteId);
      
      if (response.success) {
        toast.success(response.message || 'Removed from favorites');
        // Refresh the favorites list
        await refreshFavorites();
        return true;
      } else {
        toast.error(response.message || 'Failed to update favorites');
        return false;
      }
    } catch (err) {
      console.error('❌ useFavorites: Error toggling favorite:', err);
      toast.error(err.message || 'Failed to update favorites');
      return false;
    }
  }, [refreshFavorites]);

  /**
   * Check if an item is in favorites
   * @param {string} selectionId - ID of the item to check
   * @param {string} type - Type of item ('category' or 'subcategory')
   * @returns {Object|null} Favorite record if found, null otherwise
   */
  const isFavorite = useCallback((selectionId, type) => {
    return favorites.find(fav => 
      fav.selection_id === selectionId && fav.type === type
    ) || null;
  }, [favorites]);

  /**
   * Get favorites count
   */
  const favoritesCount = favorites.length;

  /**
   * Check if favorites list is empty
   */
  const isEmpty = favorites.length === 0;

  // Initial fetch on mount
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    // Data
    favorites,
    favoritesCount,
    isEmpty,
    
    // States
    loading,
    error,
    refreshing,
    
    // Actions
    fetchFavorites,
    refreshFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  };
};
