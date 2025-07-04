import React, { useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Phone } from 'lucide-react';
import { Button } from '../ui/button';

// Custom WhatsApp Icon Component matching Flutter app design
const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
);

/**
 * BottomSearchBar - Search bar with action buttons matching Flutter design
 * Features:
 * - Search input with placeholder text
 * - WhatsApp button for customer support
 * - Call button for direct contact
 * - Positioned above bottom navigation
 * - Only visible on mobile screens (<768px)
 * - Rounded top corners matching Flutter design
 */
const BottomSearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide search bar on service details pages
  const isServiceDetailsPage = location.pathname.includes('/service-details/');

  // Don't render if on service details page
  if (isServiceDetailsPage) {
    return null;
  }

  // Configuration - these should ideally come from environment variables or settings
  const WHATSAPP_NUMBER = '+918888888888'; // Replace with actual WhatsApp business number
  const PHONE_NUMBER = '+918888888888'; // Replace with actual business phone number

  // Memoized handlers
  const handleSearchClick = useCallback(() => {
    // Navigate to search page (similar to Flutter app)
    navigate('/search');
  }, [navigate]);

  const handleWhatsAppClick = useCallback(async () => {
    try {
      // Create WhatsApp URL with pre-filled message
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hello! I need help with EassyLife services.`;

      // Open WhatsApp in new tab/window
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback: copy number to clipboard or show error message
      alert('WhatsApp not available. Please call us directly.');
    }
  }, [WHATSAPP_NUMBER]);

  const handleCallClick = useCallback(() => {
    try {
      // Open phone dialer
      window.location.href = `tel:${PHONE_NUMBER}`;
    } catch (error) {
      console.error('Error opening phone dialer:', error);
      // Fallback: copy number to clipboard
      navigator.clipboard?.writeText(PHONE_NUMBER);
      alert(`Phone number copied: ${PHONE_NUMBER}`);
    }
  }, [PHONE_NUMBER]);

  return (
    <div className="mobile-search-bar md:hidden fixed bottom-20 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div
        className="px-4 py-3 w-full"
        style={{
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="flex items-center gap-3 w-full max-w-full">

          {/* Search Input - Longer bar */}
          <div className="flex-1 min-w-0">
            <Button
              variant="ghost"
              onClick={handleSearchClick}
              className="w-full h-11 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 justify-start transition-colors duration-300"
            >
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 text-sm flex-1 text-left truncate">
                Try Searching a Service
              </span>
            </Button>
          </div>

          {/* Action Buttons - Right aligned */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppClick}
              className="w-11 h-11 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <WhatsAppIcon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
            </Button>

            {/* Call Button */}
            <Button
              onClick={handleCallClick}
              className="w-11 h-11 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <Phone className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(BottomSearchBar);
