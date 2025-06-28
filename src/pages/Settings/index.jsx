import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsNavigation from '../../components/settings/SettingsNavigation';
import SettingsContent, { EmptySettingsContent } from '../../components/settings/SettingsContent';
import { useResponsive } from '../../hooks/useResponsive';
import { useSettings } from '../../hooks/useSettings';

/**
 * SettingsPage - Responsive settings page
 * Desktop: Sidebar navigation with content area
 * Mobile: Flutter app-style single list
 */
const SettingsPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [activeSection, setActiveSection] = useState('notifications');

  // Settings hook for desktop functionality
  const {
    settings,
    loading,
    saving,
    updateNotifications,
    updatePreferences,
    changePassword,
    toggleTwoFactor,
    deleteAccount,
    exportData
  } = useSettings();

  // Handle back navigation
  const handleBack = () => {
    navigate('/profile');
  };

  // Handle section change for desktop
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <>
      <Helmet>
        <title>Settings - EassyLife</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Helmet>

      {isMobile ? (
        // Mobile View - Flutter app style
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="py-6 px-0 bg-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SettingsNavigation isMobile={true} />
            </motion.div>
          </div>
        </div>
      ) : (
        // Desktop View - Clean Layout with Top Header
        <div className="min-h-screen bg-gray-50">
          {/* Top Header - Full Width */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="px-6 py-4 max-w-6xl mx-auto">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group mr-3"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex w-full max-w-6xl mx-auto">
            {/* Desktop Sidebar - No Background Card */}
            <div className="w-80 flex-shrink-0">
              <SettingsNavigation
                isMobile={false}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </div>

            {/* Desktop Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Desktop Settings Content */}
              {loading ? (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <SettingsContent
                  activeSection={activeSection}
                  settings={settings}
                  onUpdateNotifications={updateNotifications}
                  onUpdatePreferences={updatePreferences}
                  onChangePassword={changePassword}
                  onToggleTwoFactor={toggleTwoFactor}
                  onDeleteAccount={deleteAccount}
                  onExportData={exportData}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
