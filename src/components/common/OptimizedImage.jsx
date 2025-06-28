import React, { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage Component - Performance-optimized image loading
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Progressive loading with blur effect
 * - WebP format support with fallback
 * - Responsive image sizing
 * - Error handling with fallback
 */
const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIj5JbWFnZTwvdGV4dD48L3N2Zz4=",
  fallback = null,
  lazy = true,
  quality = 80,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lazy ? placeholder : src);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setHasError(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      if (fallback) {
        setCurrentSrc(fallback);
        setIsLoaded(true);
      }
    };

    // Try WebP format first if supported
    if (supportsWebP() && src && !src.includes('.webp')) {
      const webpSrc = convertToWebP(src);
      img.src = webpSrc;
      
      // Fallback to original format if WebP fails
      img.onerror = () => {
        img.onerror = () => {
          setHasError(true);
          if (fallback) {
            setCurrentSrc(fallback);
            setIsLoaded(true);
          }
        };
        img.src = src;
      };
    } else {
      img.src = src;
    }
  }, [isInView, src, fallback]);

  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Convert image URL to WebP format (simple implementation)
  const convertToWebP = (url) => {
    // This is a simplified example - in production, you'd have a proper image service
    if (url.includes('cloudinary.com')) {
      return url.replace(/\.(jpg|jpeg|png)/, '.webp');
    }
    return url;
  };

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || hasError) return '';
    
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  // Generate sizes attribute
  const generateSizes = () => {
    return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
  };

  if (hasError && !fallback) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        {...props}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        srcSet={isLoaded && !hasError ? generateSrcSet(src) : undefined}
        sizes={isLoaded && !hasError ? generateSizes() : undefined}
        className={`
          transition-all duration-500 ease-in-out
          ${isLoaded ? 'opacity-100 blur-0' : 'opacity-70 blur-sm'}
          ${className}
        `}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />
      
      {/* Loading overlay */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
