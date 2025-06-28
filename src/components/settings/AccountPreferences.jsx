import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Clock, 
  DollarSign, 
  Moon, 
  Sun,
  Monitor,
  ChevronDown,
  Check
} from 'lucide-react';
import { SettingItemWithSelect } from './SettingItem';
import { ToggleWithLabel } from './ToggleSwitch';
import { InlineSpinner } from '../common/LoadingSpinner';
import { cn } from '../../lib/utils';

/**
 * AccountPreferences - Account preferences management component
 * Includes language, timezone, currency, and theme settings
 * Following design specifications and Flutter app patterns
 */
const AccountPreferences = ({
  preferences = {},
  onUpdate,
  saving = false,
  className = ''
}) => {
  const [localPreferences, setLocalPreferences] = useState({
    language: preferences.language ?? 'en',
    timezone: preferences.timezone ?? 'Asia/Kolkata',
    currency: preferences.currency ?? 'INR',
    theme: preferences.theme ?? 'light'
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Handle preference change
  const handleChange = (key, value) => {
    const newPreferences = {
      ...localPreferences,
      [key]: value
    };
    
    setLocalPreferences(newPreferences);
    setHasChanges(true);
    
    // Auto-save after a short delay
    if (onUpdate) {
      setTimeout(() => {
        onUpdate(newPreferences);
        setHasChanges(false);
      }, 500);
    }
  };

  // Configuration options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी (Hindi)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'te', label: 'తెలుగు (Telugu)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
  ];

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'IST (UTC+05:30)' },
    { value: 'Asia/Dubai', label: 'GST (UTC+04:00)' },
    { value: 'Asia/Singapore', label: 'SGT (UTC+08:00)' },
    { value: 'Europe/London', label: 'GMT (UTC+00:00)' },
    { value: 'America/New_York', label: 'EST (UTC-05:00)' },
    { value: 'America/Los_Angeles', label: 'PST (UTC-08:00)' }
  ];

  const currencyOptions = [
    { value: 'INR', label: 'INR (₹) - Indian Rupee' },
    { value: 'USD', label: 'USD ($) - US Dollar' },
    { value: 'EUR', label: 'EUR (€) - Euro' },
    { value: 'GBP', label: 'GBP (£) - British Pound' },
    { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
    { value: 'SGD', label: 'SGD (S$) - Singapore Dollar' }
  ];

  const themeOptions = [
    { 
      value: 'light', 
      label: 'Light Mode',
      icon: Sun,
      description: 'Clean and bright interface'
    },
    { 
      value: 'dark', 
      label: 'Dark Mode',
      icon: Moon,
      description: 'Easy on the eyes in low light'
    },
    { 
      value: 'system', 
      label: 'System Default',
      icon: Monitor,
      description: 'Follows your device settings'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={cn('space-y-6', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Account Preferences
          </h3>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {saving && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <InlineSpinner size="xs" />
              <span>Saving...</span>
            </div>
          )}
          {hasChanges && !saving && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Changes pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Language Setting */}
      <motion.div variants={itemVariants}>
        <SettingItemWithSelect
          icon={Globe}
          label="Language"
          description="Choose your preferred language for the interface"
          value={localPreferences.language}
          options={languageOptions}
          onChange={(value) => handleChange('language', value)}
          disabled={saving}
          placeholder="Select language"
        />
      </motion.div>

      {/* Timezone Setting */}
      <motion.div variants={itemVariants}>
        <SettingItemWithSelect
          icon={Clock}
          label="Timezone"
          description="Set your local timezone for accurate scheduling"
          value={localPreferences.timezone}
          options={timezoneOptions}
          onChange={(value) => handleChange('timezone', value)}
          disabled={saving}
          placeholder="Select timezone"
        />
      </motion.div>

      {/* Currency Setting */}
      <motion.div variants={itemVariants}>
        <SettingItemWithSelect
          icon={DollarSign}
          label="Currency"
          description="Display prices in your preferred currency"
          value={localPreferences.currency}
          options={currencyOptions}
          onChange={(value) => handleChange('currency', value)}
          disabled={saving}
          placeholder="Select currency"
        />
      </motion.div>

      {/* Theme Setting */}
      <motion.div variants={itemVariants}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Theme</h4>
              <p className="text-sm text-gray-600">Choose your preferred interface theme</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = localPreferences.theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleChange('theme', option.value)}
                  disabled={saving}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
                    isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    saving && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn(
                      'w-5 h-5 mt-0.5',
                      isSelected ? 'text-orange-600' : 'text-gray-500'
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-medium text-sm',
                          isSelected ? 'text-orange-900' : 'text-gray-900'
                        )}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <p className={cn(
                        'text-xs mt-1',
                        isSelected ? 'text-orange-700' : 'text-gray-600'
                      )}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Data Usage Monitor */}
      <motion.div variants={itemVariants}>
        <div className="bg-blue-50/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Data Usage</h4>
                <p className="text-sm text-gray-600">Monitor your data consumption</p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              onClick={() => {
                // TODO: Implement data usage view
                console.log('View data usage');
              }}
            >
              View
            </button>
          </div>
        </div>
      </motion.div>

      {/* Auto-save notice */}
      <motion.div 
        variants={itemVariants}
        className="text-center pt-4 border-t border-gray-200"
      >
        <p className="text-sm text-gray-600">
          Your preferences are saved automatically
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AccountPreferences;
