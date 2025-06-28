import React from 'react';
import { SmoothCard, SmoothButton, SmoothSubtle } from '../ui/SmoothHover';
import { Card, CardContent } from '../ui/card';

/**
 * Examples showing how to fix shaking/jittery hover animations
 * 
 * BEFORE: Cards shake and text becomes blurry during hover
 * AFTER: Smooth, professional hover animations
 */

// Example 1: Service Card (like in your Home page)
export const SmoothServiceCard = ({ service, onClick }) => {
  return (
    <SmoothCard
      onClick={onClick}
      className="p-4 text-center cursor-pointer bg-white rounded-lg border border-gray-100"
    >
      <div className="w-16 h-16 mx-auto mb-3 bg-orange-50 rounded-lg flex items-center justify-center">
        <img 
          src={service.icon} 
          alt={service.name} 
          className="w-10 h-10 object-contain"
          style={{
            // Prevent image distortion during scale
            imageRendering: 'crisp-edges',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
    </SmoothCard>
  );
};

// Example 2: Package Card (like in your packages section)
export const SmoothPackageCard = ({ package: pkg, onBookNow }) => {
  return (
    <SmoothCard className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <img 
          src={pkg.image} 
          alt={pkg.name}
          className="w-full h-full object-cover"
          style={{
            // Prevent image shaking during hover
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-orange-600">₹{pkg.price}</span>
          {pkg.originalPrice && (
            <span className="text-sm text-gray-500 line-through">₹{pkg.originalPrice}</span>
          )}
        </div>
        <SmoothButton
          type="button"
          onClick={onBookNow}
          className="w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg font-medium"
        >
          Book Now
        </SmoothButton>
      </div>
    </SmoothCard>
  );
};

// Example 3: Button with smooth hover (no shaking)
export const SmoothActionButton = ({ children, onClick, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-300";
  const variants = {
    primary: "bg-gradient-to-r from-orange-400 to-orange-500 text-white",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border-2 border-orange-400 text-orange-600 hover:bg-orange-50"
  };

  return (
    <SmoothButton
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
      {...props}
    >
      {children}
    </SmoothButton>
  );
};

// Example 4: Text hover without shaking
export const SmoothTextLink = ({ children, href, onClick }) => {
  return (
    <SmoothSubtle
      as={href ? 'a' : 'button'}
      href={href}
      onClick={onClick}
      className="text-orange-600 hover:text-orange-700 font-medium"
    >
      {children}
    </SmoothSubtle>
  );
};

// Example 5: Icon hover without distortion
export const SmoothIconButton = ({ icon: Icon, onClick, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <SmoothButton
      onClick={onClick}
      className={`${sizes[size]} rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center`}
    >
      <Icon className="w-5 h-5 text-gray-600" />
    </SmoothButton>
  );
};

// Example 6: Complex card with multiple hover elements
export const SmoothComplexCard = ({ title, description, image, price, onAction }) => {
  return (
    <SmoothCard className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Image section - no distortion on hover */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
          style={{
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            imageRendering: 'crisp-edges'
          }}
        />
      </div>
      
      {/* Content section - text doesn't shake */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">₹{price}</span>
          
          {/* Button inside card - independent smooth hover */}
          <SmoothButton
            onClick={onAction}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
            type="button"
          >
            Book Now
          </SmoothButton>
        </div>
      </div>
    </SmoothCard>
  );
};

// Example 7: Grid of cards (like your services grid)
export const SmoothServicesGrid = ({ services, onServiceClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {services.map((service) => (
        <SmoothServiceCard
          key={service.id}
          service={service}
          onClick={() => onServiceClick(service)}
        />
      ))}
    </div>
  );
};

// Example 8: CSS-only solution (for when you can't use React components)
export const CSSOnlyCard = ({ children }) => {
  return (
    <div 
      className="smooth-card bg-white rounded-lg border border-gray-100 p-4"
      style={{
        // Hardware acceleration
        willChange: 'transform, box-shadow',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        // Smooth transitions
        transition: 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        // Prevent layout shifts
        transformOrigin: 'center center'
      }}
    >
      {children}
    </div>
  );
};

export default {
  SmoothServiceCard,
  SmoothPackageCard,
  SmoothActionButton,
  SmoothTextLink,
  SmoothIconButton,
  SmoothComplexCard,
  SmoothServicesGrid,
  CSSOnlyCard
};
