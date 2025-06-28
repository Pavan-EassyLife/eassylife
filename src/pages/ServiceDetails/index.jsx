import React from 'react';
import { ServiceDetailsProvider } from '../../contexts/ServiceDetailsContext';
import ServiceDetailsContent from './ServiceDetailsContent';

/**
 * ServiceDetails - Main component with context provider
 * Uses Flutter-exact implementation for UI
 */
const ServiceDetails = () => {
  return (
    <ServiceDetailsProvider>
      <ServiceDetailsContent />
    </ServiceDetailsProvider>
  );
};

export default ServiceDetails;