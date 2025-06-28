import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for S3 video streaming with CORS handling
 * Based on AWS Community article: Building a React Hook for S3 Video Streaming
 * 
 * This hook handles:
 * - CORS issues by using video element directly instead of fetch
 * - Progressive loading and buffering
 * - Error handling and fallback
 * - Performance optimization
 */
const useS3VideoStream = (videoUrl, options = {}) => {
  const {
    autoPlay = true,
    muted = true,
    loop = true,
    preload = 'metadata',
    fallbackImage = null,
    onError = null,
    onLoad = null
  } = options;

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const [networkState, setNetworkState] = useState(0);
  const [readyState, setReadyState] = useState(0);

  // Video element ref
  const videoRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCanPlay(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    retryCountRef.current = 0;
  }, [videoUrl]);

  // Video event handlers
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    if (import.meta.env.DEV) {
      console.log('🎥 S3VideoStream: Load started for:', videoUrl);
    }
  }, [videoUrl]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setNetworkState(video.networkState);
      setReadyState(video.readyState);
      if (import.meta.env.DEV) {
        console.log('🎥 S3VideoStream: Metadata loaded, duration:', video.duration);
      }
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setCanPlay(true);
    setIsBuffering(false);
    
    if (import.meta.env.DEV) {
      console.log('🎥 S3VideoStream: Can play video');
    }

    // Auto-play if enabled
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(error => {
        if (import.meta.env.DEV) {
          console.log('🎥 S3VideoStream: Auto-play failed (user interaction required):', error);
        }
      });
    }

    // Call onLoad callback
    if (onLoad) {
      onLoad();
    }
  }, [autoPlay, onLoad]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration) {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    }
  }, []);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handlePlaying = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const handleError = useCallback((error) => {
    const video = videoRef.current;
    const errorDetails = {
      code: video?.error?.code,
      message: video?.error?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
      src: video?.src
    };

    if (import.meta.env.DEV) {
      console.error('🎥 S3VideoStream: Video error occurred:', errorDetails);
    }

    // Retry logic for network errors
    if (retryCountRef.current < maxRetries && video?.error?.code === 2) {
      retryCountRef.current += 1;
      if (import.meta.env.DEV) {
        console.log(`🎥 S3VideoStream: Retrying (${retryCountRef.current}/${maxRetries})...`);
      }
      
      setTimeout(() => {
        if (video) {
          video.load();
        }
      }, 1000 * retryCountRef.current); // Exponential backoff
      return;
    }

    setHasError(true);
    setIsLoading(false);
    setCanPlay(false);

    // Call onError callback
    if (onError) {
      onError(errorDetails);
    }
  }, [onError, maxRetries]);

  // Setup video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    // Set video properties
    video.muted = muted;
    video.loop = loop;
    video.preload = preload;
    // Note: Removed crossOrigin as it can cause issues with some S3 configurations
    
    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    // Set source and load
    video.src = videoUrl;
    video.load();

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [
    videoUrl,
    muted,
    loop,
    preload,
    handleLoadStart,
    handleLoadedMetadata,
    handleCanPlay,
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleWaiting,
    handlePlaying,
    handleError
  ]);

  // Control functions
  const play = useCallback(() => {
    if (videoRef.current && canPlay) {
      return videoRef.current.play();
    }
    return Promise.reject(new Error('Video not ready'));
  }, [canPlay]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const seek = useCallback((time) => {
    if (videoRef.current && canPlay) {
      videoRef.current.currentTime = time;
    }
  }, [canPlay]);

  const setVolume = useCallback((volume) => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  const retry = useCallback(() => {
    retryCountRef.current = 0;
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return {
    // Video element ref
    videoRef,
    
    // State
    isLoading,
    isPlaying,
    hasError,
    isBuffering,
    canPlay,
    progress,
    duration,
    currentTime,
    networkState,
    readyState,
    
    // Controls
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    retry,
    
    // Computed values
    isReady: canPlay && !hasError,
    hasVideo: !!videoUrl && !hasError,
    retryCount: retryCountRef.current
  };
};

export default useS3VideoStream;
