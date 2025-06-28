import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

/**
 * LanguageSelector - 4-button toggle component for language selection
 * Features smooth animations and visual feedback
 */
const LanguageSelector = ({ 
  value = 'en', 
  onChange, 
  error,
  disabled = false,
  className = ""
}) => {
  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'hi', label: 'हि', name: 'Hindi' },
    { code: 'pu', label: 'ਪੰ', name: 'Punjabi' },
    { code: 'mr', label: 'मर', name: 'Marathi' }
  ];

  const handleLanguageSelect = (languageCode) => {
    if (!disabled && onChange) {
      onChange(languageCode);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const selectedVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <motion.div
        className="grid grid-cols-4 gap-2 p-1 bg-gray-100 rounded-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {languages.map((language) => {
          const isSelected = value === language.code;
          
          return (
            <motion.button
              key={language.code}
              type="button"
              onClick={() => handleLanguageSelect(language.code)}
              disabled={disabled}
              className={`
                relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-white hover:shadow-sm'
                }
                ${isSelected
                  ? 'text-orange-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
              variants={buttonVariants}
              whileHover={!disabled ? "hover" : undefined}
              whileTap={!disabled ? "tap" : undefined}
              title={language.name}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md opacity-10"
                  variants={selectedVariants}
                  initial="initial"
                  animate="animate"
                />
              )}
              
              {/* Language label */}
              <span className="relative z-10 flex items-center justify-center">
                {language.label}
              </span>
              
              {/* Active indicator dot */}
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
                  variants={selectedVariants}
                  initial="initial"
                  animate="animate"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Language name display */}
      <motion.div
        className="flex items-center justify-center space-x-2 text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Globe className="w-4 h-4" />
        <span>
          {languages.find(lang => lang.code === value)?.name || 'English'}
        </span>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          className="text-sm text-red-600 flex items-center space-x-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
};

/**
 * LanguageSelectorCompact - Compact version for smaller spaces
 */
export const LanguageSelectorCompact = ({ 
  value = 'en', 
  onChange, 
  disabled = false,
  className = ""
}) => {
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हि' },
    { code: 'pu', label: 'ਪੰ' },
    { code: 'mr', label: 'मर' }
  ];

  const handleLanguageSelect = (languageCode) => {
    if (!disabled && onChange) {
      onChange(languageCode);
    }
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {languages.map((language) => {
        const isSelected = value === language.code;
        
        return (
          <motion.button
            key={language.code}
            type="button"
            onClick={() => handleLanguageSelect(language.code)}
            disabled={disabled}
            className={`
              px-2 py-1 rounded text-xs font-medium transition-all duration-200
              ${disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
              }
              ${isSelected
                ? 'text-orange-600 bg-orange-50 border border-orange-200'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border border-transparent'
              }
            `}
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
          >
            {language.label}
          </motion.button>
        );
      })}
    </div>
  );
};

/**
 * LanguageSelectorDropdown - Dropdown version for limited space
 */
export const LanguageSelectorDropdown = ({ 
  value = 'en', 
  onChange, 
  disabled = false,
  className = ""
}) => {
  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'pu', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' }
  ];

  const selectedLanguage = languages.find(lang => lang.code === value) || languages[0];

  return (
    <select
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={disabled}
      className={`
        px-3 py-2 border border-gray-300 rounded-md text-sm
        focus:ring-2 focus:ring-orange-500 focus:border-orange-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.flag} {language.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
