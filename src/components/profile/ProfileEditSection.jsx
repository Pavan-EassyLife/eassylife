import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  X, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Globe,
  Check,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile.js';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import LanguageSelector from './LanguageSelector.jsx';

// Validation schema
const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  last_name: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces')
    .optional()
    .or(z.literal('')),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  preferred_language: z.enum(['en', 'hi', 'pu', 'mr'], {
    errorMap: () => ({ message: 'Please select a valid language' }),
  }),
});

/**
 * ProfileEditSection - Inline profile editing component
 * Features form validation, language selector, and smooth transitions
 */
const ProfileEditSection = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  className = ""
}) => {
  const { user, updateProfile, loading } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      preferred_language: 'en',
    },
    mode: 'onChange'
  });

  const watchedLanguage = watch('preferred_language');

  // Update form when user data changes
  useEffect(() => {
    if (user && isOpen) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        preferred_language: user.preferred_language || 'en',
      });
    }
  }, [user, isOpen, reset]);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitSuccess(false);
      if (onClose) {
        onClose();
      }
    }
  };

  // Handle language change
  const handleLanguageChange = (language) => {
    setValue('preferred_language', language, { shouldDirty: true });
  };

  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.1,
        duration: 0.3 
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="p-6"
            variants={contentVariants}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-500" />
                Edit Profile
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Personal Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <Input
                      {...register('first_name')}
                      placeholder="Enter your first name"
                      error={errors.first_name?.message}
                      className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Input
                      {...register('last_name')}
                      placeholder="Enter your last name"
                      error={errors.last_name?.message}
                      className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email Address *
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email address"
                    error={errors.email?.message}
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Mobile Number (Read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Mobile Number
                  </label>
                  <Input
                    value={`+${user?.country_code || '91'} ${user?.mobile || ''}`}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    Contact support to change your mobile number
                  </p>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-gray-500" />
                  Preferences
                </h4>

                {/* Language Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Preferred Language
                  </label>
                  <LanguageSelector
                    value={watchedLanguage}
                    onChange={handleLanguageChange}
                    error={errors.preferred_language?.message}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {submitSuccess && (
                    <motion.div
                      className="flex items-center text-green-600"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      <span className="text-sm">Profile updated!</span>
                    </motion.div>
                  )}
                  
                  {Object.keys(errors).length > 0 && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Please fix the errors above</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isDirty || !isValid || isSubmitting || loading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileEditSection;
