import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';

/**
 * Booking Notes Section Component
 * Matches Flutter bookingNotesTextfield implementation
 * Provides text input for booking notes with character limit
 */
const BookingNotesSection = ({ cartState }) => {
  const { updateCartState } = useCart();
  const [bookingNotes, setBookingNotes] = useState('');
  const [notesCharCount, setNotesCharCount] = useState(0);

  // Maximum character limit (matches Flutter implementation)
  const MAX_CHAR_LIMIT = 500;

  // Handle notes change (matches Flutter TextEditingController)
  const handleNotesChange = useCallback((event) => {
    const notes = event.target.value;
    
    // Enforce character limit
    if (notes.length <= MAX_CHAR_LIMIT) {
      setBookingNotes(notes);
      setNotesCharCount(notes.length);
      
      // Update cart state with booking notes
      updateCartState({ bookingNotes: notes });
      
      // Optional: Save to local storage for persistence
      localStorage.setItem('cart_booking_notes', notes);
    }
  }, [updateCartState]);

  // Debounced save function (optional for auto-save)
  const debouncedSaveNotes = useCallback(
    debounce((notes) => {
      localStorage.setItem('cart_booking_notes', notes);
    }, 1000),
    []
  );

  // Load saved notes on component mount
  React.useEffect(() => {
    const savedNotes = localStorage.getItem('cart_booking_notes');
    if (savedNotes) {
      setBookingNotes(savedNotes);
      setNotesCharCount(savedNotes.length);
      updateCartState({ bookingNotes: savedNotes });
    }
  }, [updateCartState]);

  return (
    <motion.div 
      className="mx-6 mb-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Container with Flutter-matching styling */}
      <div className="bg-gray-200 rounded-2xl px-4 py-0">
        <textarea
          value={bookingNotes}
          onChange={handleNotesChange}
          placeholder="Booking notes for the Service Provider"
          className="w-full h-24 bg-transparent border-none outline-none resize-none text-base text-gray-900 placeholder:text-gray-500 py-4"
          maxLength={MAX_CHAR_LIMIT}
          rows={4}
          style={{
            fontFamily: 'inherit',
            fontSize: '16px',
            lineHeight: '1.5'
          }}
        />
      </div>
      
      {/* Character Counter (optional - not in Flutter but useful) */}
      {bookingNotes.length > 0 && (
        <motion.div 
          className="flex justify-end mt-2 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`text-xs ${
            notesCharCount >= MAX_CHAR_LIMIT * 0.9 
              ? 'text-orange-600' 
              : 'text-gray-400'
          }`}>
            {notesCharCount}/{MAX_CHAR_LIMIT}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default BookingNotesSection;
