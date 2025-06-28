import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/toast';
import geocodingService from '../../api/services/geocodingService';

/**
 * Enhanced Places Autocomplete Component
 * Implements address autocomplete with max 5 suggestions, smooth transitions, and shadcn/ui styling
 */
const EnhancedPlacesAutocomplete = ({
  onPlaceSelect,
  onInputChange,
  placeholder = 'Search for an address...',
  className = '',
  disabled = false,
  initialValue = '',
  maxSuggestions = 5
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

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery) => {
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

        // Limit to maxSuggestions
        const limitedResults = results.slice(0, maxSuggestions);
        setPredictions(limitedResults);
        setIsOpen(limitedResults.length > 0);
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
  }, [showError, maxSuggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);

    // Notify parent component of input change
    if (onInputChange) {
      onInputChange(value);
    }
  };

  // Handle place selection
  const handlePlaceSelect = async (prediction) => {
    try {
      setIsLoading(true);
      setQuery(prediction.description);
      setIsOpen(false);
      setPredictions([]);

      // Get detailed place information
      const placeDetails = await geocodingService.getPlaceDetails(prediction.placeId);

      if (placeDetails && placeDetails.success && onPlaceSelect) {
        onPlaceSelect({
          success: true,
          prediction,
          geometry: {
            location: {
              lat: placeDetails.coordinates.latitude,
              lng: placeDetails.coordinates.longitude
            }
          },
          formattedAddress: placeDetails.formattedAddress,
          addressComponents: placeDetails.addressComponents
        });
      }
    } catch (error) {
      console.error('Place selection error:', error);
      showError('Failed to get place details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        );
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

  // Close dropdown when clicking outside
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) {
              setIsOpen(true);
            } else if (query.length >= 2) {
              debouncedSearch(query);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-10 pr-10 transition-all duration-200',
            isOpen && 'ring-2 ring-orange-500 border-orange-500'
          )}
        />

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown with Suggestions */}
      <AnimatePresence>
        {isOpen && predictions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.placeId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors duration-150',
                    selectedIndex === index
                      ? 'bg-orange-50 border-l-4 border-orange-500'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handlePlaceSelect(prediction)}
                >
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {prediction.mainText || prediction.description}
                    </p>
                    {prediction.secondaryText && (
                      <p className="text-xs text-gray-500 truncate">
                        {prediction.secondaryText}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedPlacesAutocomplete;
