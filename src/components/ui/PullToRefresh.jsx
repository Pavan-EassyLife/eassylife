import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80, 
  maxPullDistance = 120,
  refreshingText = "Refreshing...",
  pullText = "Pull to refresh",
  releaseText = "Release to refresh"
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);
  
  const containerRef = useRef(null);
  const touchStartRef = useRef(0);

  // Check if we can pull (at top of scroll)
  const checkCanPull = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      return scrollTop <= 0;
    }
    return false;
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    if (isRefreshing) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    touchStartRef.current = touch.clientY;
    setCanPull(checkCanPull());
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (isRefreshing || !canPull) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && checkCanPull()) {
      e.preventDefault(); // Prevent default scroll behavior
      
      const distance = Math.min(deltaY * 0.5, maxPullDistance);
      setPullDistance(distance);
      setIsPulling(distance > 10);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (isRefreshing) return;

    if (pullDistance >= threshold && canPull) {
      // Trigger refresh
      setIsRefreshing(true);
      setIsPulling(false);
      
      // Call the refresh function
      const refreshPromise = onRefresh();
      
      // Handle promise or timeout
      if (refreshPromise && typeof refreshPromise.then === 'function') {
        refreshPromise
          .finally(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          });
      } else {
        // Fallback timeout
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      }
    } else {
      // Reset state
      setIsPulling(false);
      setPullDistance(0);
    }
    
    setCanPull(false);
  };

  // Get current status text
  const getStatusText = () => {
    if (isRefreshing) return refreshingText;
    if (pullDistance >= threshold) return releaseText;
    return pullText;
  };

  // Calculate refresh indicator opacity and rotation
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorRotation = isRefreshing ? 360 : (pullDistance / threshold) * 180;

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${isPulling || isRefreshing ? Math.min(pullDistance, 60) : 0}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center bg-white z-10"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
          transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`,
          opacity: indicatorOpacity,
          transition: isPulling ? 'none' : 'all 0.3s ease-out'
        }}
      >
        <div className="flex flex-col items-center space-y-2 py-4">
          <RefreshCw 
            className={`w-6 h-6 text-orange-500 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${indicatorRotation}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
            }}
          />
          <span className="text-sm text-gray-600 font-medium">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
