import React from 'react';

/**
 * ProfileBackground - CSS-based animated background for profile page
 * Creates subtle floating particles and gradient effects using CSS animations
 */
const ProfileBackground = ({ className = "" }) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.15) 0%, rgba(254, 215, 170, 0.1) 50%, rgba(249, 250, 251, 1) 100%)'
      }}
    ></div>
  );
};

/**
 * ProfileBackgroundSimple - Fallback CSS-only background for better performance
 */
export const ProfileBackgroundSimple = ({ className = "" }) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.15) 0%, rgba(254, 215, 170, 0.1) 50%, rgba(249, 250, 251, 1) 100%)'
      }}
    ></div>
  );
};

export default ProfileBackground;
