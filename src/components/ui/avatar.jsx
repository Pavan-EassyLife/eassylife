import React from 'react';
import { cn } from '../../lib/utils';

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ className, src, alt, ...props }, ref) => {
  const [imageLoadError, setImageLoadError] = React.useState(false);

  const handleError = () => {
    setImageLoadError(true);
  };

  if (imageLoadError || !src) {
    return null;
  }

  return (
    <img
      ref={ref}
      className={cn('aspect-square h-full w-full object-cover', className)}
      src={src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
