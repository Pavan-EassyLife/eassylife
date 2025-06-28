import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import geocodingService from '../../api/services/geocodingService';
import { useToast } from '../ui/toast';

/**
 * Google Places Autocomplete Component
 * Implements Flutter app's place search and autocomplete functionality
 */
const PlacesAutocomplete = ({
  onPlaceSelect,
  placeholder = 'Search for an address...',
  className = '',
  disabled = false,
  initialValue = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const { showError } = useToast();

  /**
   * Debounced search function
   */
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);

      try {
        const results = await geocodingService.getPlacePredictions(searchQuery, {
          componentRestrictions: { country: 'in' },
          types: ['address', 'establishment', 'geocode']
        });

        setPredictions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Places search error:', error);
        setPredictions([]);
        setIsOpen(false);

        if (error.message.includes('API') || error.message.includes('temporarily')) {
          showError('Search service temporarily unavailable');
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [showError]);

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  /**
   * Handle place selection
   */
  const handlePlaceSelect = async (prediction) => {
    setQuery(prediction.description);
    setIsOpen(false);
    setPredictions([]);
    setIsLoading(true);

    try {
      const placeDetails = await geocodingService.getPlaceDetails(prediction.placeId);

      if (placeDetails.success && onPlaceSelect) {
        onPlaceSelect({
          ...placeDetails,
          prediction
        });
      }
    } catch (error) {
      console.error('Place details error:', error);
      showError('Failed to get place details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handlePlaceSelect(predictions[selectedIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    setQuery('');
    setPredictions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Cleanup debounce on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-palette-orange animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) {
              setIsOpen(true);
            } else if (query.length >= 2) {
              // Trigger search if we have a query but no predictions
              debouncedSearch(query);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-12 pr-12 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            type="button"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && predictions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {predictions.map((prediction, index) => (
              <motion.button
                key={prediction.placeId}
                onClick={() => handlePlaceSelect(prediction)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-orange-50' : ''
                }`}
                whileHover={{ backgroundColor: 'rgba(255, 163, 1, 0.05)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {prediction.mainText}
                    </p>
                    {prediction.secondaryText && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {prediction.secondaryText}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      <AnimatePresence>
        {isOpen && !isLoading && query.length >= 2 && predictions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center"
          >
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No places found</p>
            <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacesAutocomplete;
