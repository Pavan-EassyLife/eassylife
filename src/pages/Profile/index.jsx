import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile.js';
import { useResponsive } from '../../hooks/useResponsive.js';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfileEditSection from '../../components/profile/ProfileEditSection.jsx';
import ImageUpload from '../../components/profile/ImageUpload.jsx';
import NotificationPreferences from '../../components/profile/NotificationPreferences.jsx';
import ProfileMenuSection from '../../components/profile/ProfileMenuSection.jsx';
import MobileProfileLayout from '../../components/profile/MobileProfileLayout.jsx';
import { ProfileBackgroundSimple } from '../../components/profile/ProfileBackground.jsx';
import { handleSuccess } from '../../utils/errorHandler.js';

/**
 * ProfilePage - Responsive profile page
 * Desktop: Comprehensive profile management with sections
 * Mobile: Flutter app-style layout with profile header and menu list
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading, displayName, userInitials, profileImageUrl, isLoading } = useProfile();
  const { isMobile } = useResponsive();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleImageUpload = (file) => {
    // Image upload is handled by the ImageUpload component
    console.log('Image uploaded:', file);
  };

  const handleEditSuccess = (data) => {
    handleSuccess('Profile updated successfully!');
    setShowEditProfile(false);
  };

  const handleImageUploadSuccess = (data) => {
    handleSuccess('Profile picture updated successfully!');
    setShowImageUpload(false);
  };

  const handleMenuItemClick = (item) => {
    console.log(`Clicked: ${item}`);

    // Handle specific menu items
    switch (item) {
      case 'notifications':
        // Do nothing as per user request
        break;
      case 'personal':
        setShowEditProfile(true);
        break;
      case 'language':
        setShowEditProfile(true);
        break;
      default:
        // TODO: Implement navigation to specific sections
        console.log(`Navigate to: ${item}`);
    }
  };

  // Handle back navigation for mobile
  const handleBack = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>{isMobile ? 'Profile' : 'Profile Settings'} - EassyLife</title>
        <meta name="description" content="Manage your profile, preferences, and account settings" />
      </Helmet>

      {isMobile ? (
        // Mobile View - Flutter app style
        <div className="min-h-screen bg-white">
          {/* Mobile Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="px-4 sm:px-6">
              <div className="flex items-center h-16">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                </button>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Profile</h1>
              </div>
            </div>
          </div>

          {/* Mobile Profile Content */}
          <MobileProfileLayout />
        </div>
      ) : (
        // Desktop View - Original comprehensive layout
        <>
          {/* Animated Background */}
          <ProfileBackgroundSimple />

          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative z-10">
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
              {/* Page Header */}
              <motion.div
                className="mb-6 sm:mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage your account information and preferences</p>
              </motion.div>

              {/* Profile Content */}
              <motion.div
                className="space-y-6 sm:space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Profile Header Section */}
                <motion.div variants={itemVariants}>
                  <ProfileHeader
                    onEditProfile={handleEditProfile}
                    onImageUpload={() => setShowImageUpload(true)}
                    className="hover:shadow-lg transition-all duration-500"
                  />
                </motion.div>

                {/* Profile Edit Section */}
                <ProfileEditSection
                  isOpen={showEditProfile}
                  onClose={() => setShowEditProfile(false)}
                  onSuccess={handleEditSuccess}
                />

                {/* Notification Preferences Section */}
                {showNotifications && (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <NotificationPreferences className="hover:shadow-lg transition-all duration-500" />
                  </motion.div>
                )}

                {/* Profile Menu Sections */}
                <motion.div variants={itemVariants}>
                  <ProfileMenuSection
                    onMenuItemClick={handleMenuItemClick}
                    className="hover:shadow-lg transition-all duration-500"
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Modals */}
            <ImageUpload
              isOpen={showImageUpload}
              onClose={() => setShowImageUpload(false)}
              onSuccess={handleImageUploadSuccess}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ProfilePage;
