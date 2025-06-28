import React from 'react';
import { ManageAddressProvider } from '../../contexts/ManageAddressContext';
import AddressPageContent from '../../components/address/AddressPageContent';

/**
 * AddressPage - Main wrapper component that provides ManageAddressContext
 * The actual content is handled by AddressPageContent which has access to the context
 * This structure allows the inner component to access ManageAddressContext and call refreshAddresses()
 */
const AddressPage = () => {
  return (
    <ManageAddressProvider>
      <AddressPageContent />
    </ManageAddressProvider>
  );
};

export default AddressPage;
