import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const AnimatedButton = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  success = false,
  disabled = false,
  className,
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden';

  const variants = {
    primary: 'bg-palette-orange text-white hover:bg-[#e89200] focus:ring-palette-orange shadow-medium hover:shadow-high',
    secondary: 'bg-white text-palette-orange border-2 border-palette-orange hover:bg-palette-orange hover:text-white focus:ring-palette-orange shadow-low hover:shadow-medium',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-low hover:shadow-medium',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    social: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-low hover:shadow-medium'
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    default: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    icon: 'h-10 w-10'
  };

  const isDisabled = disabled || loading;

  const handleClick = (e) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98, y: 0 } : {}}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      {...props}
    >
      {/* Ripple Effect Background */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileTap={!isDisabled ? { opacity: [0, 0.3, 0] } : {}}
        transition={{ duration: 0.3 }}
      />

      {/* Button Content */}
      <div className="relative flex items-center justify-center gap-2 z-10">
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        )}

        {success && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}

        <motion.span
          animate={{
            opacity: loading ? 0.7 : 1,
            x: (loading || success) ? 4 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </div>

      {/* Gradient Overlay for Primary Button */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#ff8c00] to-[#ffa500] opacity-0"
          whileHover={!isDisabled ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton };
