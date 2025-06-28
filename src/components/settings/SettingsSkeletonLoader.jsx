import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSkeleton, ShimmerEffect } from '../ui/loading-skeleton';
import { cn } from '../../lib/utils';

/**
 * SettingsSkeletonLoader - Skeleton loader for settings page
 * Provides loading states that match the actual settings layout
 */
const SettingsSkeletonLoader = ({ className = '' }) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Header Skeleton - Centered */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="flex justify-center">
          <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <LoadingSkeleton variant="avatar" className="w-8 h-8" />
                <LoadingSkeleton variant="title" className="w-24" />
              </div>
              <LoadingSkeleton variant="button" className="w-32 h-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton - Centered */}
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="flex max-w-7xl w-full overflow-hidden">
          {/* Sidebar Skeleton */}
          <div className="w-80 bg-white border-r border-gray-200 hidden lg:block">
            <div className="p-6 border-b border-gray-200">
              <LoadingSkeleton variant="title" className="w-20 h-6 mb-2" />
              <LoadingSkeleton variant="text" className="w-48 h-4" />
            </div>
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4].map((index) => (
                <ShimmerEffect key={index} className="p-4 rounded-xl border-2 border-transparent">
                  <div className="flex items-start gap-4">
                    <LoadingSkeleton variant="avatar" className="w-9 h-9 rounded-lg" />
                    <div className="flex-1">
                      <LoadingSkeleton variant="text" className="w-32 h-5 mb-2" />
                      <LoadingSkeleton variant="text" className="w-40 h-4" />
                    </div>
                    <LoadingSkeleton variant="avatar" className="w-4 h-4" />
                  </div>
                </ShimmerEffect>
              ))}
            </div>
          </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 bg-gray-50">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-start gap-4">
              <LoadingSkeleton variant="avatar" className="w-12 h-12 rounded" />
              <div className="flex-1">
                <LoadingSkeleton variant="title" className="w-64 h-8 mb-2" />
                <LoadingSkeleton variant="text" className="w-96 h-5" />
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8">
            <div className="max-w-4xl space-y-6">
              {[1, 2, 3].map((section) => (
                <ShimmerEffect key={section} className="bg-white rounded-lg p-6 border border-gray-200">
                  <LoadingSkeleton variant="title" className="w-48 h-6 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <LoadingSkeleton variant="avatar" className="w-8 h-8 rounded-lg" />
                          <div>
                            <LoadingSkeleton variant="text" className="w-32 h-4 mb-1" />
                            <LoadingSkeleton variant="text" className="w-48 h-3" />
                          </div>
                        </div>
                        <LoadingSkeleton variant="button" className="w-12 h-6 rounded-full" />
                      </div>
                    ))}
                  </div>
                </ShimmerEffect>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

/**
 * NotificationSettingsSkeleton - Specific skeleton for notification settings
 */
export const NotificationSettingsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LoadingSkeleton variant="avatar" className="w-5 h-5" />
          <LoadingSkeleton variant="title" className="w-40" />
        </div>
        <LoadingSkeleton variant="text" className="w-20 h-4" />
      </div>

      {/* Notification Groups */}
      {[1, 2, 3].map((group) => (
        <div key={group} className="bg-gray-50/50 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="w-32" />
            <LoadingSkeleton variant="text" className="w-48 h-3" />
          </div>
          
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <LoadingSkeleton variant="avatar" className="w-4 h-4" />
                  <LoadingSkeleton variant="text" className="w-36" />
                </div>
                <LoadingSkeleton variant="button" className="w-14 h-7 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * AccountPreferencesSkeleton - Specific skeleton for account preferences
 */
export const AccountPreferencesSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LoadingSkeleton variant="avatar" className="w-5 h-5" />
        <LoadingSkeleton variant="title" className="w-36" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-start justify-between py-4 border-b border-gray-100">
            <div className="flex items-start gap-3 flex-1">
              <LoadingSkeleton variant="avatar" className="w-5 h-5 mt-0.5" />
              <div className="space-y-2">
                <LoadingSkeleton variant="text" className="w-24" />
                <LoadingSkeleton variant="text" className="w-40 h-3" />
              </div>
            </div>
            <LoadingSkeleton variant="input" className="w-32 h-8" />
          </div>
        ))}
      </div>

      {/* Theme Selection Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LoadingSkeleton variant="avatar" className="w-5 h-5" />
          <LoadingSkeleton variant="text" className="w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((theme) => (
            <LoadingSkeleton key={theme} variant="card" className="h-20" />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * PrivacySecuritySkeleton - Specific skeleton for privacy & security
 */
export const PrivacySecuritySkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LoadingSkeleton variant="avatar" className="w-5 h-5" />
        <LoadingSkeleton variant="title" className="w-32" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-start justify-between py-4 border-b border-gray-100">
            <div className="flex items-start gap-3 flex-1">
              <LoadingSkeleton variant="avatar" className="w-5 h-5 mt-0.5" />
              <div className="space-y-2">
                <LoadingSkeleton variant="text" className="w-28" />
                <LoadingSkeleton variant="text" className="w-44 h-3" />
              </div>
            </div>
            <LoadingSkeleton variant="button" className="w-16" />
          </div>
        ))}
      </div>

      {/* Security Status Skeleton */}
      <div className="bg-green-50/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <LoadingSkeleton variant="avatar" className="w-5 h-5 mt-0.5" />
          <div className="space-y-3 flex-1">
            <LoadingSkeleton variant="text" className="w-32" />
            <LoadingSkeleton variant="text" className="w-full h-3" />
            <div className="space-y-1">
              {[1, 2, 3].map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <LoadingSkeleton variant="avatar" className="w-3 h-3" />
                  <LoadingSkeleton variant="text" className="w-36 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * AccountActionsSkeleton - Specific skeleton for account actions
 */
export const AccountActionsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LoadingSkeleton variant="avatar" className="w-5 h-5" />
        <LoadingSkeleton variant="title" className="w-28" />
      </div>

      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="flex items-start justify-between py-4 border-b border-gray-100">
            <div className="flex items-start gap-3 flex-1">
              <LoadingSkeleton variant="avatar" className="w-5 h-5 mt-0.5" />
              <div className="space-y-2">
                <LoadingSkeleton variant="text" className="w-24" />
                <LoadingSkeleton variant="text" className="w-40 h-3" />
              </div>
            </div>
            <LoadingSkeleton variant="button" className="w-16" />
          </div>
        ))}
      </div>

      {/* Delete Account Section Skeleton */}
      <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
        <div className="flex items-start justify-between py-4">
          <div className="flex items-start gap-3 flex-1">
            <LoadingSkeleton variant="avatar" className="w-5 h-5 mt-0.5" />
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="w-28" />
              <LoadingSkeleton variant="text" className="w-48 h-3" />
            </div>
          </div>
          <LoadingSkeleton variant="button" className="w-16" />
        </div>
        
        <div className="mt-3 flex items-start gap-2">
          <LoadingSkeleton variant="avatar" className="w-3 h-3 mt-0.5" />
          <LoadingSkeleton variant="text" className="w-full h-3" />
        </div>
      </div>

      {/* Support Info Skeleton */}
      <div className="bg-blue-50/30 rounded-lg p-4 space-y-3">
        <LoadingSkeleton variant="text" className="w-20" />
        <LoadingSkeleton variant="text" className="w-full h-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((info) => (
            <div key={info} className="flex items-center gap-2">
              <LoadingSkeleton variant="avatar" className="w-3 h-3" />
              <LoadingSkeleton variant="text" className="w-32 h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeletonLoader;
