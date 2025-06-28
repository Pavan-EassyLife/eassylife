import React from 'react';
import { motion } from 'framer-motion';

// Import working cart section components
import AddressSection from './AddressSection';
import SelectedServicesSection from './SelectedServicesSection';
import FrequentlyAddedSection from './FrequentlyAddedSection';
import BookingNotesSection from './BookingNotesSection';
import DonationSection from './DonationSection';
import VIPPlansSection from './VIPPlansSection';
import PaymentOptionsSection from './PaymentOptionsSection';
import TipSection from './TipSection';
import PaymentSummarySection from './PaymentSummarySection';
import CheckoutButton from './CheckoutButton';

/**
 * Cart Content Component
 * Main scrollable content area containing all cart sections
 * Exactly matches Flutter cart_screen.dart component order and structure
 * Now supports layoutMode for responsive two-column layout
 */
const CartContent = ({ cartState, onRefresh, isRefreshing, layoutMode = 'full' }) => {
  const { cartData } = cartState;

  console.log('🛒 CartContent: Received cartState:', {
    hasCartState: !!cartState,
    hasCartData: !!cartData,
    cartStateKeys: cartState ? Object.keys(cartState) : null,
    layoutMode: layoutMode
  });

  // Define which sections belong to which column
  const leftColumnSections = [
    'address', 'selectedServices', 'frequentlyAdded',
    'bookingNotes', 'donation', 'vipPlans'
  ];

  const rightColumnSections = [
    'paymentOptions', 'tip', 'paymentSummary'
  ];

  const shouldRenderSection = (sectionName) => {
    if (layoutMode === 'full') return true;
    if (layoutMode === 'left-column') return leftColumnSections.includes(sectionName);
    if (layoutMode === 'right-column') return rightColumnSections.includes(sectionName);
    return true;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <motion.div 
          className="flex justify-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
        </motion.div>
      )}

      <div className="pb-6">
        {/* Conditionally render sections based on layoutMode */}

        {/* LEFT COLUMN SECTIONS */}
        {shouldRenderSection('address') && <AddressSection cartState={cartState} />}
        {shouldRenderSection('selectedServices') && <SelectedServicesSection cartState={cartState} />}
        {shouldRenderSection('frequentlyAdded') && <FrequentlyAddedSection cartState={cartState} />}
        {shouldRenderSection('bookingNotes') && <BookingNotesSection cartState={cartState} />}
        {shouldRenderSection('donation') && <DonationSection cartState={cartState} />}
        {shouldRenderSection('vipPlans') && <VIPPlansSection cartState={cartState} />}

        {/* RIGHT COLUMN SECTIONS */}
        {shouldRenderSection('paymentOptions') && <PaymentOptionsSection cartState={cartState} />}
        {shouldRenderSection('tip') && <TipSection cartState={cartState} />}
        {shouldRenderSection('paymentSummary') && <PaymentSummarySection cartState={cartState} />}

        {/* CheckoutButton only in right column for desktop */}
        {layoutMode === 'right-column' && (
          <div className="mt-6">
            <CheckoutButton cartState={cartState} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartContent;
