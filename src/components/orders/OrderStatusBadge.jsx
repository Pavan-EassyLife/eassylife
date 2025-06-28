import React, { memo } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

/**
 * Comprehensive Order Status Badge System
 * Provides consistent status badges with proper color coding, icons, and styling
 */

// Status configuration mapping
const STATUS_CONFIG = {
  // Accepted/Active Orders
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: 'text-green-600'
    },
    variant: 'success'
  },
  
  // Running/In Progress Orders
  running: {
    label: 'In Progress',
    icon: Play,
    colors: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: 'text-orange-600'
    },
    variant: 'warning'
  },
  
  // Upcoming Orders
  upcoming: {
    label: 'Upcoming',
    icon: Clock,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: 'text-blue-600'
    },
    variant: 'info'
  },
  
  // Completed Orders
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: 'text-green-600'
    },
    variant: 'success'
  },
  
  // Cancelled Orders
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: 'text-red-600'
    },
    variant: 'destructive'
  },
  
  // Pending Orders
  pending: {
    label: 'Pending',
    icon: Clock,
    colors: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: 'text-yellow-600'
    },
    variant: 'warning'
  },
  
  // Initiated Orders
  initiated: {
    label: 'Initiated',
    icon: RefreshCw,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: 'text-gray-600'
    },
    variant: 'secondary'
  },
  
  // Paused Orders
  paused: {
    label: 'Paused',
    icon: Pause,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: 'text-gray-600'
    },
    variant: 'secondary'
  },
  
  // Default/Unknown Status
  default: {
    label: 'Unknown',
    icon: AlertCircle,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: 'text-gray-600'
    },
    variant: 'secondary'
  }
};

/**
 * OrderStatusBadge Component
 * @param {string} status - The order status
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {boolean} showIcon - Whether to show the status icon
 * @param {boolean} showLabel - Whether to show the status label
 * @param {string} className - Additional CSS classes
 * @param {object} customConfig - Custom configuration to override defaults
 */
const OrderStatusBadge = memo(({
  status,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
  customConfig,
  ...props
}) => {
  // Get status configuration
  const config = customConfig || STATUS_CONFIG[status] || STATUS_CONFIG.default;
  const { label, icon: IconComponent, colors } = config;

  // Size configurations
  const sizeConfig = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'space-x-1'
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4',
      gap: 'space-x-1.5'
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'space-x-2'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  return (
    <Badge
      className={cn(
        'inline-flex items-center font-medium border transition-all duration-200',
        colors.bg,
        colors.text,
        colors.border,
        currentSize.badge,
        showIcon && showLabel && currentSize.gap,
        className
      )}
      {...props}
    >
      {showIcon && IconComponent && (
        <IconComponent 
          className={cn(
            currentSize.icon,
            colors.icon,
            !showLabel && 'mr-0'
          )} 
        />
      )}
      {showLabel && (
        <span className="font-medium">{label}</span>
      )}
    </Badge>
  );
});

OrderStatusBadge.displayName = 'OrderStatusBadge';

/**
 * Utility function to get status configuration
 * @param {string} status - The order status
 * @returns {object} Status configuration object
 */
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.default;
};

/**
 * Utility function to get status color
 * @param {string} status - The order status
 * @returns {string} Status color class
 */
export const getStatusColor = (status) => {
  const config = getStatusConfig(status);
  return config.colors.text;
};

/**
 * Utility function to get status background color
 * @param {string} status - The order status
 * @returns {string} Status background color class
 */
export const getStatusBgColor = (status) => {
  const config = getStatusConfig(status);
  return config.colors.bg;
};

/**
 * Utility function to check if status is active/actionable
 * @param {string} status - The order status
 * @returns {boolean} Whether the status is active
 */
export const isActiveStatus = (status) => {
  return ['accepted', 'running', 'upcoming'].includes(status);
};

/**
 * Utility function to check if status is completed
 * @param {string} status - The order status
 * @returns {boolean} Whether the status is completed
 */
export const isCompletedStatus = (status) => {
  return status === 'completed';
};

/**
 * Utility function to check if status is cancelled
 * @param {string} status - The order status
 * @returns {boolean} Whether the status is cancelled
 */
export const isCancelledStatus = (status) => {
  return status === 'cancelled';
};

/**
 * Utility function to get next possible statuses
 * @param {string} currentStatus - The current order status
 * @returns {array} Array of possible next statuses
 */
export const getNextPossibleStatuses = (currentStatus) => {
  const transitions = {
    initiated: ['accepted', 'cancelled'],
    accepted: ['running', 'cancelled'],
    running: ['completed', 'cancelled', 'paused'],
    paused: ['running', 'cancelled'],
    upcoming: ['accepted', 'cancelled'],
    pending: ['accepted', 'cancelled'],
    completed: [], // Terminal state
    cancelled: []  // Terminal state
  };
  
  return transitions[currentStatus] || [];
};

export default OrderStatusBadge;
