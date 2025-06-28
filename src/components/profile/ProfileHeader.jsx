import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Camera, User } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile.js';
import { Button } from '../ui/button.jsx';

/**
 * ProfileHeader - Displays user profile information with avatar and edit functionality
 * Features responsive design, smooth animations, and image upload capability
 */
const ProfileHeader = ({ 
  onEditProfile, 
  onImageUpload,
  showEditButton = true,
  showImageEdit = true,
  className = ""
}) => {
  const { 
    user, 
    loading, 
    imageUploading, 
    displayName, 
    userInitials, 
    profileImageUrl, 
    isLoading 
  } = useProfile();

  const [imageHover, setImageHover] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageClick = () => {
    if (onImageUpload && showImageEdit) {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          onImageUpload(file);
        }
      };
      input.click();
    }
  };

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const avatarVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const editIconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={`rounded-xl shadow-sm border border-gray-200 p-8 relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.3) 0%, rgba(254, 215, 170, 0.2) 50%, rgba(255, 255, 255, 1) 100%)'
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      <div className="relative z-10">
        {isLoading ? (
          // Loading skeleton
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto mb-2 w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded mx-auto w-48 mb-6 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded mx-auto w-32 animate-pulse"></div>
          </div>
        ) : (
          <div className="text-center">
            {/* Profile Avatar */}
            <div className="relative inline-block mb-6">
              <motion.div
                className="relative cursor-pointer"
                variants={avatarVariants}
                whileHover="hover"
                whileTap="tap"
                onMouseEnter={() => setImageHover(true)}
                onMouseLeave={() => setImageHover(false)}
                onClick={handleImageClick}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-lg relative overflow-hidden border-4 border-white">
                  {profileImageUrl && !imageLoadError ? (
                    <img
                      src={profileImageUrl}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>{userInitials}</span>
                  )}
                  
                  {/* Image upload overlay */}
                  {showImageEdit && (
                    <motion.div
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: imageHover ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {imageUploading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Edit icon overlay */}
                {showImageEdit && (
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 transition-colors"
                    variants={editIconVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h2>
              <p className="text-gray-600 mb-6">{user?.email}</p>
              
              {/* Additional user info */}
              {user?.mobile && (
                <p className="text-sm text-gray-500 mb-4">
                  +{user.country_code || '91'} {user.mobile}
                </p>
              )}
            </motion.div>

            {/* Edit Profile Button */}
            {showEditButton && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={handleEditProfile}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>


    </motion.div>
  );
};

/**
 * ProfileHeaderCompact - Compact version of profile header for smaller spaces
 */
export const ProfileHeaderCompact = ({
  onEditProfile,
  showEditButton = true,
  className = ""
}) => {
  const {
    user,
    loading,
    displayName,
    userInitials,
    profileImageUrl,
    isLoading
  } = useProfile();

  const [compactImageLoadError, setCompactImageLoadError] = useState(false);

  const handleCompactImageError = () => {
    setCompactImageLoadError(true);
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Compact Avatar */}
      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
        {profileImageUrl && !compactImageLoadError ? (
          <img
            src={profileImageUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
            onError={handleCompactImageError}
          />
        ) : (
          <span className="text-white text-base font-bold tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>{userInitials}</span>
        )}
      </div>

      {/* Compact User Info */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 truncate">{displayName}</h3>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
        )}
      </div>

      {/* Compact Edit Button */}
      {showEditButton && (
        <Button
          onClick={onEditProfile}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
          disabled={loading}
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;
