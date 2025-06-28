import { z } from 'zod';

/**
 * Validation schemas for profile-related forms
 * Using Zod for type-safe validation with detailed error messages
 */

// Profile validation schema
export const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  last_name: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces')
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || ''),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .transform(val => val.toLowerCase().trim()),
  
  preferred_language: z.enum(['en', 'hi', 'pu', 'mr'], {
    errorMap: () => ({ message: 'Please select a valid language' }),
  }),
});

// Notification preferences validation schema
export const notificationPreferencesSchema = z.object({
  is_whatsapp_checked: z.boolean({
    required_error: 'WhatsApp notification preference is required',
    invalid_type_error: 'WhatsApp notification preference must be true or false',
  }),
  
  service_update: z.boolean({
    required_error: 'Service update preference is required',
    invalid_type_error: 'Service update preference must be true or false',
  }),
  
  marketing_update: z.boolean({
    required_error: 'Marketing update preference is required',
    invalid_type_error: 'Marketing update preference must be true or false',
  }),
}).refine(
  (data) => {
    // If WhatsApp is disabled, individual preferences should also be disabled
    if (!data.is_whatsapp_checked) {
      return !data.service_update && !data.marketing_update;
    }
    return true;
  },
  {
    message: 'Individual notification preferences must be disabled when WhatsApp notifications are disabled',
    path: ['is_whatsapp_checked'],
  }
);

// Image upload validation schema
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a valid file' })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      'File size must be less than 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
});

// Wallet transaction validation schema
export const walletTransactionSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .min(10, 'Minimum amount is ₹10')
    .max(50000, 'Maximum amount is ₹50,000')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  
  payment_method: z
    .string()
    .min(1, 'Payment method is required')
    .max(50, 'Payment method name is too long'),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  category: z.enum(['general', 'technical', 'billing', 'feedback'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
});

// Password validation schema (for future use)
export const passwordSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  
  confirm_password: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  }
);

// Address validation schema (for future use)
export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other'], {
    errorMap: () => ({ message: 'Please select a valid address type' }),
  }),
  
  address_line_1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 is too long'),
  
  address_line_2: z
    .string()
    .max(255, 'Address line 2 is too long')
    .optional()
    .or(z.literal('')),
  
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name is too long'),
  
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State name is too long'),
  
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  
  landmark: z
    .string()
    .max(255, 'Landmark is too long')
    .optional()
    .or(z.literal('')),
  
  is_default: z.boolean().optional(),
});

// Validation helper functions
export const validateProfileData = (data) => {
  try {
    const validatedData = profileSchema.parse(data);
    return { success: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

export const validateNotificationPreferences = (data) => {
  try {
    const validatedData = notificationPreferencesSchema.parse(data);
    return { success: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

export const validateImageUpload = (file) => {
  try {
    const validatedData = imageUploadSchema.parse({ file });
    return { success: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        errors.file = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { file: 'File validation failed' } };
  }
};

export const validateWalletTransaction = (data) => {
  try {
    const validatedData = walletTransactionSchema.parse(data);
    return { success: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

// Common validation patterns
export const validationPatterns = {
  name: /^[a-zA-Z\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{10}$/,
  pincode: /^\d{6}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
};

// Error message constants
export const errorMessages = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid 10-digit phone number',
  invalidPincode: 'Please enter a valid 6-digit pincode',
  passwordTooShort: 'Password must be at least 8 characters',
  passwordTooWeak: 'Password must contain uppercase, lowercase, number, and special character',
  passwordMismatch: 'Passwords do not match',
  fileTooLarge: 'File size must be less than 5MB',
  invalidFileType: 'Only JPEG, PNG, and WebP images are allowed',
  amountTooSmall: 'Minimum amount is ₹10',
  amountTooLarge: 'Maximum amount is ₹50,000',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Something went wrong. Please try again.',
  validationError: 'Please fix the errors and try again.',
};

// Form field validation helpers
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

export const hasFieldError = (errors, fieldName) => {
  return !!errors[fieldName];
};

export const getFirstError = (errors) => {
  const errorKeys = Object.keys(errors);
  return errorKeys.length > 0 ? errors[errorKeys[0]] : null;
};

export const formatValidationErrors = (zodError) => {
  const errors = {};
  zodError.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};
