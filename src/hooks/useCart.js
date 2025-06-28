import { useCartContext } from '../contexts/CartContext';

/**
 * Cart State Management Hook - Context Version
 * Now uses CartContext for shared state across components
 * Handles: Address, Selected Services, Frequently Added, Notes, VIP Plans, Payment Options
 */
export const useCart = () => {
  // Use cart context instead of local state
  return useCartContext();
};



