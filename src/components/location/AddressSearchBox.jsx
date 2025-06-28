import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, X, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import geocodingService from '../../api/services/geocodingService';
import { useToast } from '../ui/toast';

/**
 * Enhanced Address Search Box with Google Places Autocomplete
 * Implements Flutter app's address search functionality
 */
const AddressSearchBox = ({
  onAddressSelect,
  onCurrentLocationClick,
  placeholder = "Search for area, street name...",
  className = "",
  showCurrentLocationButton = true,
  initialValue = "",
  disabled = false
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const { showError } = useToast();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentAddressSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (address) => {
    const newRecentSearches = [
      address,
      ...recentSearches.filter(item => item.description !== address.description)
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentAddressSearches', JSON.stringify(newRecentSearches));
  };

  // Debounced search function
  const performSearch = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 AddressSearchBox: Searching for:', query);

      // Use geocoding service for address search
      const results = await geocodingService.searchAddresses(query);
      
      if (results.success && results.predictions) {
        console.log('✅ AddressSearchBox: Search results:', results.predictions);
        setSuggestions(results.predictions);
      } else {
        console.warn('⚠️ AddressSearchBox: No results found');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('❌ AddressSearchBox: Search error:', error);
      showError('Failed to search addresses. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only search if user is actively typing (not just setting initial value)
    if (value.trim().length >= 3) {
      // Debounce search
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    console.log('📍 AddressSearchBox: Suggestion selected:', suggestion);
    
    setSearchQuery(suggestion.description);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      // Get detailed place information
      const placeDetails = await geocodingService.getPlaceDetails(suggestion.place_id);
      
      if (placeDetails.success) {
        console.log('✅ AddressSearchBox: Place details:', placeDetails);
        
        // Save to recent searches
        saveRecentSearch(suggestion);
        
        // Notify parent component
        if (onAddressSelect) {
          onAddressSelect({
            ...placeDetails,
            searchQuery: suggestion.description
          });
        }
      } else {
        showError('Failed to get address details. Please try again.');
      }
    } catch (error) {
      console.error('❌ AddressSearchBox: Error getting place details:', error);
      showError('Failed to get address details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (recentSearch) => {
    handleSuggestionSelect(recentSearch);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const totalItems = suggestions.length + recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : -1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < recentSearches.length) {
            handleRecentSearchSelect(recentSearches[selectedIndex]);
          } else {
            handleSuggestionSelect(suggestions[selectedIndex - recentSearches.length]);
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setShowSuggestions(true);
    if (!searchQuery.trim() && recentSearches.length > 0) {
      // Show recent searches when input is empty
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-20 transition-all duration-300 ease-in-out focus:border-orange-500 focus:ring-orange-500"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {/* Clear button */}
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Current location button - only show if explicitly enabled */}
          {showCurrentLocationButton && onCurrentLocationClick && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCurrentLocationClick}
              disabled={isLoading}
              className="h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-600"
              title="Get current location"
            >
              <Navigation className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {/* Recent Searches */}
            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleRecentSearchSelect(recent)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                      selectedIndex === index
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {recent.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((suggestion, index) => {
                  const adjustedIndex = index + recentSearches.length;
                  return (
                    <button
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                        selectedIndex === adjustedIndex
                          ? 'bg-orange-50 text-orange-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 truncate block">
                            {suggestion.description}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                  Searching...
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchQuery.trim().length >= 3 && suggestions.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No addresses found for "{searchQuery}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressSearchBox;
