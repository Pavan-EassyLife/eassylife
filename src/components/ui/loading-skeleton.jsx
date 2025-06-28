import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const LoadingSkeleton = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'h-4 bg-gray-200 rounded',
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-6 bg-gray-200 rounded',
    button: 'h-12 bg-gray-200 rounded-lg',
    input: 'h-14 bg-gray-200 rounded-lg',
    avatar: 'w-10 h-10 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-lg'
  };

  return (
    <motion.div
      className={cn(variants[variant], className)}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      {...props}
    />
  );
};

const ShimmerEffect = ({ children, className }) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

export { LoadingSkeleton, ShimmerEffect };
