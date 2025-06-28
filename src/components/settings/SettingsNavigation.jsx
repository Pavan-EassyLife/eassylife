import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  HelpCircle,
  FileText,
  Shield,
  Info,
  MessageCircle,
  Trash2,
  ChevronRight,
  Globe,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

/**
 * SettingsNavigation - Responsive settings navigation
 * Desktop: Sidebar navigation, Mobile: Flutter app list structure
 */
const SettingsNavigation = ({
  activeSection,
  onSectionChange,
  className = '',
  isMobile = false
}) => {
  const navigate = useNavigate();

  // Mobile navigation items (Flutter app structure)
  const mobileNavigationItems = [
    {
      id: 'notifications',
      label: 'Notification Preferences',
      icon: Bell,
      action: () => navigate('/settings/notifications')
    },
    {
      id: 'help',
      label: 'Help & FAQs',
      icon: HelpCircle,
      action: () => window.open('https://eassylife.in/faq', '_blank')
    },
    {
      id: 'terms',
      label: 'Terms & Condition',
      icon: FileText,
      action: () => window.open('https://eassylife.in/terms', '_blank')
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: Shield,
      action: () => window.open('https://eassylife.in/privacy', '_blank')
    },
    {
      id: 'about',
      label: 'About Us',
      icon: Info,
      action: () => window.open('https://eassylife.in/about', '_blank')
    },
    {
      id: 'contact',
      label: 'Contact us',
      icon: MessageCircle,
      action: () => navigate('/contact')
    },
    {
      id: 'delete',
      label: 'Delete Account',
      icon: Trash2,
      action: () => navigate('/settings/delete-account'),
      isDestructive: true
    }
  ];

  // Desktop navigation items (matching mobile app exactly)
  const desktopNavigationItems = [
    {
      id: 'notifications',
      label: 'Notification Preferences',
      description: 'Manage how you receive notifications and updates',
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'help',
      label: 'Help & FAQs',
      description: 'Get help and find answers to common questions',
      icon: HelpCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      external: true,
      action: () => window.open('https://eassylife.in/faq', '_blank')
    },
    {
      id: 'terms',
      label: 'Terms & Condition',
      description: 'Read our terms and conditions',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      external: true,
      action: () => window.open('https://eassylife.in/terms', '_blank')
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      description: 'Learn about our privacy practices',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      external: true,
      action: () => window.open('https://eassylife.in/privacy', '_blank')
    },
    {
      id: 'about',
      label: 'About Us',
      description: 'Learn more about EassyLife',
      icon: Info,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      external: true,
      action: () => window.open('https://eassylife.in/about', '_blank')
    },
    {
      id: 'contact',
      label: 'Contact us',
      description: 'Get in touch with our support team',
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'delete',
      label: 'Delete Account',
      description: 'Permanently delete your account',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      isDestructive: true
    }
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    }
  };

  const handleSectionClick = (sectionId) => {
    // Find the item to check if it has an action
    const item = desktopNavigationItems.find(item => item.id === sectionId);

    if (item && item.action) {
      // Execute the action (like opening external links)
      item.action();
    } else if (sectionId === 'notifications' && !isMobile) {
      // For notifications in desktop view, show content in sidebar instead of navigating
      if (onSectionChange) {
        onSectionChange(sectionId);
      }
    } else if (onSectionChange) {
      // Regular section change for internal pages
      onSectionChange(sectionId);
    }
  };

  // Mobile view (Flutter app style)
  if (isMobile) {
    return (
      <div className={cn('bg-white', className)}>
        {/* Settings Container - Matching Flutter app design exactly */}
        <div className="mx-6 bg-white rounded-2xl shadow-md border border-gray-100">
          {mobileNavigationItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === mobileNavigationItems.length - 1;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-4 transition-all duration-200 hover:bg-gray-50',
                  !isLast && 'border-b border-gray-100',
                  index === 0 && 'rounded-t-2xl',
                  isLast && 'rounded-b-2xl',
                  item.isDestructive && 'hover:bg-red-50'
                )}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon - Matching Flutter app style */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    item.isDestructive
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-700'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label */}
                  <span className={cn(
                    'text-base font-medium text-left',
                    item.isDestructive
                      ? 'text-red-600'
                      : 'text-gray-900'
                  )}>
                    {item.label}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  item.isDestructive
                    ? 'text-red-400'
                    : 'text-gray-400'
                )} />
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop view (Sidebar style)
  return (
    <div className={cn('h-full bg-transparent', className)}>
      {/* Navigation Items */}
      <div className="p-6 space-y-3">
        {desktopNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={cn(
                'w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden border-2',
                isActive
                  ? `${item.bgColor} ${item.borderColor} shadow-md`
                  : item.isDestructive
                    ? 'bg-white hover:bg-red-50 border-gray-200 hover:border-red-200 shadow-sm hover:shadow-md'
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-orange-200 shadow-sm hover:shadow-md'
              )}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {/* Background gradient for active state */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'p-2 rounded-lg transition-colors duration-200',
                  isActive
                    ? `${item.bgColor} ${item.color}`
                    : item.isDestructive
                      ? 'bg-red-100 text-red-600 group-hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      'font-medium transition-colors duration-200',
                      isActive
                        ? item.color
                        : item.isDestructive
                          ? 'text-red-600 group-hover:text-red-700'
                          : 'text-gray-900 group-hover:text-gray-700'
                    )}>
                      {item.label}
                    </h3>
                    {item.external ? (
                      <ExternalLink className={cn(
                        'w-4 h-4 transition-all duration-200',
                        isActive
                          ? item.color
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                      )} />
                    ) : (
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-all duration-200',
                        isActive
                          ? `${item.color} transform rotate-90`
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                      )} />
                    )}
                  </div>
                  <p className={cn(
                    'text-sm mt-1 transition-colors duration-200',
                    isActive ? 'text-gray-700' : 'text-gray-500'
                  )}>
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-r', item.color.replace('text-', 'bg-'))}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>


    </div>
  );
};

/**
 * MobileSettingsNavigation - Mobile version with dropdown/modal for desktop sidebar
 */
export const MobileSettingsNavigation = ({
  activeSection,
  onSectionChange,
  isOpen,
  onClose,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        className={cn('w-80 h-full bg-white shadow-xl', className)}
        onClick={(e) => e.stopPropagation()}
      >
        <SettingsNavigation
          activeSection={activeSection}
          onSectionChange={(section) => {
            onSectionChange(section);
            onClose();
          }}
          isMobile={false} // Use desktop sidebar in modal
        />
      </motion.div>
    </motion.div>
  );
};

export default SettingsNavigation;
