import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Favorites Service - Flutter-aligned API integration
 * Handles all favorites related API calls matching Flutter app functionality
 */
class FavoritesService {
  /**
   * Get user's favorite services/categories
   * Matches Flutter app's getFavouriteList API call
   * @returns {Promise<Object>} User's favorites list
   */
  async getFavorites() {
    try {
      console.log('🚀 FavoritesService: Fetching user favorites...');
      
      const response = await axiosInstance.get('favourites');

      console.log('✅ FavoritesService: Favorites fetched successfully:', {
        status: response.data.status,
        dataLength: response.data.data?.length || 0,
        requestURL: response.config?.url
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Favorites fetched successfully',
        data: response.data.data || [],
      };
    } catch (error) {
      console.error('❌ FavoritesService: Error fetching favorites:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: true,
          message: 'No favorites found',
          data: [],
        };
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch favorites');
    }
  }

  /**
   * Add item to favorites
   * Matches Flutter app's addFavourite API call
   * @param {string} selectionId - ID of the item to add to favorites
   * @param {string} type - Type of item ('category' or 'subcategory')
   * @returns {Promise<Object>} Add favorite response
   */
  async addFavorite(selectionId, type) {
    try {
      console.log('🚀 FavoritesService: Adding to favorites:', { selectionId, type });
      
      const payload = {
        selection_id: selectionId,
        type: type
      };

      const response = await axiosInstance.post('favourites', payload);

      console.log('✅ FavoritesService: Added to favorites successfully:', {
        status: response.data.status,
        message: response.data.message
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Added to favorites successfully',
        data: response.data.data || null,
      };
    } catch (error) {
      console.error('❌ FavoritesService: Error adding to favorites:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add to favorites');
    }
  }

  /**
   * Remove item from favorites
   * Matches Flutter app's deleteFavourite API call
   * @param {string} favoriteId - ID of the favorite item to remove
   * @returns {Promise<Object>} Remove favorite response
   */
  async removeFavorite(favoriteId) {
    try {
      console.log('🚀 FavoritesService: Removing from favorites:', favoriteId);
      
      const response = await axiosInstance.delete(`favourites/${favoriteId}`);

      console.log('✅ FavoritesService: Removed from favorites successfully:', {
        status: response.data.status,
        message: response.data.message
      });

      return {
        success: response.data.status || true,
        message: response.data.message || 'Removed from favorites successfully',
        data: response.data.data || null,
      };
    } catch (error) {
      console.error('❌ FavoritesService: Error removing from favorites:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to remove from favorites');
    }
  }

  /**
   * Toggle favorite status (add if not favorite, remove if already favorite)
   * This is a convenience method that combines add/remove logic
   * @param {string} selectionId - ID of the item
   * @param {string} type - Type of item ('category' or 'subcategory')
   * @param {boolean} isFavorite - Current favorite status
   * @param {string} favoriteId - ID of the favorite record (if already favorite)
   * @returns {Promise<Object>} Toggle favorite response
   */
  async toggleFavorite(selectionId, type, isFavorite, favoriteId = null) {
    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        return await this.removeFavorite(favoriteId);
      } else {
        // Add to favorites
        return await this.addFavorite(selectionId, type);
      }
    } catch (error) {
      console.error('❌ FavoritesService: Error toggling favorite:', error);
      throw error;
    }
  }
}

export default new FavoritesService();
