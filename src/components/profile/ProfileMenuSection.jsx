import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Heart,
  Gift,
  HelpCircle,
  Phone,
  FileText,
  Shield,
  Info,
  Trash2,
  ChevronRight,
  ExternalLink,
  Wallet,
  Star,
  Users,
  MessageCircle,
  Settings,
  Calendar,
  MapPin,
  Bell,
  Plane
} from 'lucide-react';

/**
 * MenuItemCard - Individual menu item component
 */
const MenuItemCard = ({ 
  icon: Icon, 
  label, 
  description,
  onClick, 
  external = false,
  destructive = false,
  badge = null,
  disabled = false,
  className = ""
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`
        flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 group
        ${destructive 
          ? 'hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent border border-red-100 hover:border-red-200' 
          : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent border border-gray-200 hover:border-orange-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      whileHover={!disabled ? { x: 4, scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className={`
          p-2.5 rounded-lg transition-all duration-300
          ${destructive 
            ? 'bg-red-100 text-red-600 group-hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600'
          }
        `}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`
              text-sm font-medium transition-colors duration-300
              ${destructive 
                ? 'text-red-700 group-hover:text-red-800' 
                : 'text-gray-900 group-hover:text-gray-900'
              }
            `}>
              {label}
            </h4>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className={`
              text-xs mt-1 transition-colors duration-300 truncate
              ${destructive 
                ? 'text-red-600 group-hover:text-red-700' 
                : 'text-gray-500 group-hover:text-gray-600'
              }
            `}>
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {external && (
          <ExternalLink className={`
            w-3 h-3 transition-colors duration-300
            ${destructive ? 'text-red-400' : 'text-gray-400 group-hover:text-orange-500'}
          `} />
        )}
        <ChevronRight className={`
          w-4 h-4 transition-all duration-300
          ${destructive 
            ? 'text-red-400 group-hover:text-red-500' 
            : 'text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1'
          }
        `} />
      </div>
    </motion.div>
  );
};

/**
 * ProfileMenuSection - Main menu sections component
 */
const ProfileMenuSection = ({ 
  className = "",
  onMenuItemClick 
}) => {
  const navigate = useNavigate();

  // Menu items configuration - matching Flutter app structure
  const menuSections = [
    {
      title: "Bookings & Services",
      icon: Calendar,
      items: [
        {
          icon: Calendar,
          label: "My Bookings",
          description: "View your service bookings and history",
          key: "bookings",
          onClick: () => handleMenuClick("bookings")
        },
        {
          icon: MapPin,
          label: "Manage Address",
          description: "Add and manage your addresses",
          key: "address",
          onClick: () => handleMenuClick("address")
        },
        {
          icon: Plane,
          label: "Flight Booking",
          description: "Book flights (Coming Soon)",
          key: "flight",
          disabled: true,
          onClick: () => handleMenuClick("flight")
        }
      ]
    },
    {
      title: "Account & Features",
      icon: CreditCard,
      items: [
        {
          icon: Wallet,
          label: "Wallet History",
          description: "View transactions and balance",
          key: "wallet",
          onClick: () => handleMenuClick("wallet")
        },
        {
          icon: Heart,
          label: "Favourites",
          description: "Your saved services and providers",
          key: "favourites",
          onClick: () => handleMenuClick("favourites")
        },
        {
          icon: Gift,
          label: "Refer & Earn",
          description: "Invite friends and earn rewards",
          key: "referral",
          badge: "New",
          onClick: () => handleMenuClick("referral")
        },
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage your notification preferences",
          key: "notifications",
          onClick: () => handleMenuClick("notifications")
        }
      ]
    },
    {
      title: "Account Actions",
      icon: Settings,
      items: [
        {
          icon: Settings,
          label: "Settings",
          description: "Manage app preferences and configurations",
          key: "settings",
          onClick: () => handleMenuClick("settings")
        }
      ]
    }
  ];

  const handleMenuClick = (key) => {
    if (onMenuItemClick) {
      onMenuItemClick(key);
    }

    // Handle navigation based on menu item - matching Flutter app navigation
    switch (key) {
      case 'bookings':
        navigate('/orders');
        break;
      case 'address':
        navigate('/address');
        break;
      case 'flight':
        // Flight booking not implemented yet
        console.log('Flight booking coming soon');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'favourites':
        navigate('/favorites');
        break;
      case 'referral':
        navigate('/refer-earn');
        break;
      case 'notifications':
        // Notifications should do nothing as per user request
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        console.log(`Menu item clicked: ${key}`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      className={`grid gap-6 lg:grid-cols-2 xl:grid-cols-3 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {menuSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
          variants={sectionVariants}
        >
          {/* Section Header */}
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <section.icon className="w-5 h-5 mr-2 text-orange-500" />
            {section.title}
          </h3>

          {/* Menu Items */}
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <MenuItemCard
                key={item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                onClick={item.onClick}
                external={item.external}
                destructive={item.destructive}
                badge={item.badge}
                disabled={item.disabled}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * ProfileMenuSectionCompact - Compact version for smaller screens
 */
export const ProfileMenuSectionCompact = ({ 
  className = "",
  onMenuItemClick 
}) => {
  const allItems = [
    { icon: Calendar, label: "My Bookings", key: "bookings" },
    { icon: MapPin, label: "Address", key: "address" },
    { icon: Wallet, label: "Wallet", key: "wallet" },
    { icon: Heart, label: "Favourites", key: "favourites" },
    { icon: Gift, label: "Refer & Earn", key: "referral", badge: "New" },
    { icon: Bell, label: "Notifications", key: "notifications" }
  ];

  const handleMenuClick = (key) => {
    if (onMenuItemClick) {
      onMenuItemClick(key);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {allItems.map((item) => (
          <motion.button
            key={item.key}
            onClick={() => handleMenuClick(item.key)}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors duration-200">
              <item.icon className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-2 text-center">
              {item.label}
            </span>
            {item.badge && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full mt-1">
                {item.badge}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ProfileMenuSection;
