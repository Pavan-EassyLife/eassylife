import React from 'react';
import { AuthProvider } from './AuthContext';
import { AddressProvider } from './AddressContext';
import { OrderProvider } from './OrderContext';
import { CartProvider } from './CartContext';
import { VipProvider } from './VipContext';
import { MobileNavigationProvider } from './MobileNavigationContext';
import { ToastProvider } from '../components/ui/toast';

/**
 * AppProvider - Combines all context providers for the application
 * This ensures proper provider hierarchy and makes it easy to add new contexts
 */
const AppProvider = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AddressProvider>
          <CartProvider>
            <VipProvider>
              <OrderProvider>
                <MobileNavigationProvider>
                  {children}
                </MobileNavigationProvider>
              </OrderProvider>
            </VipProvider>
          </CartProvider>
        </AddressProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default AppProvider;
