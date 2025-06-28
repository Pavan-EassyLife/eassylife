import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import serviceDetailsService from '../../api/services/serviceDetailsService';

/**
 * ServiceSelectionPage - Complete Rewrite with Optimized API and Video Implementation
 * 
 * Key Improvements:
 * 1. Single API call with proper state management
 * 2. Inline video player to avoid React timing issues
 * 3. Proper error handling and loading states
 * 4. Performance optimized rendering
 */

// Inline Video Player Component - Avoids timing issues
const OptimizedVideoPlayer = ({ videoUrl, onBack, showBackButton = true, className = "" }) => {
  const videoRef = useRef(null);
  const [videoState, setVideoState] = useState({
    isLoading: true,
    hasError: false,
    isMuted: true,
    isPlaying: false
  });

  useEffect(() => {
    if (!videoUrl) {
      console.log('🎥 OptimizedVideoPlayer: No video URL provided');
      setVideoState(prev => ({ ...prev, hasError: true, isLoading: false }));
      return;
    }

    console.log('🎥 OptimizedVideoPlayer: Initializing with URL:', videoUrl);

    const video = videoRef.current;
    if (!video) {
      // Video element not ready, retry after a short delay
      const timer = setTimeout(() => {
        if (videoRef.current) {
          initializeVideo();
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    initializeVideo();

    function initializeVideo() {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedData = () => {
        setVideoState(prev => ({ ...prev, isLoading: false, hasError: false }));
        // Auto-play muted (Flutter behavior)
        video.play().then(() => {
          setVideoState(prev => ({ ...prev, isPlaying: true }));
        }).catch(() => {
          setVideoState(prev => ({ ...prev, isPlaying: false }));
        });
      };

      const handleError = () => {
        setVideoState(prev => ({ ...prev, hasError: true, isLoading: false }));
      };

      const handlePlay = () => setVideoState(prev => ({ ...prev, isPlaying: true }));
      const handlePause = () => setVideoState(prev => ({ ...prev, isPlaying: false }));

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      // Set video properties
      video.muted = videoState.isMuted;
      video.loop = true;
      video.preload = 'metadata';
      video.src = videoUrl;

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [videoUrl, videoState.isMuted]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoState.isMuted;
      setVideoState(prev => ({ ...prev, isMuted: newMuted }));
      videoRef.current.muted = newMuted;
    }
  }, [videoState.isMuted]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [videoState.isPlaying]);

  if (videoState.hasError) {
    return (
      <div className={`relative w-full bg-orange-50 flex items-center justify-center ${className ? className : 'h-56'}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🎬</div>
          <p>Video not available</p>
        </div>
        {showBackButton && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full bg-orange-50 ${className ? className : 'h-56'}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={videoState.isMuted}
        loop
      />

      {videoState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          {videoState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          {videoState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Conditional Back Button */}
      {showBackButton && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
      )}
    </div>
  );
};

const ServiceSelectionPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Optimized state management - single API response
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single optimized API call
  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 ServiceSelection: Making single API call for categoryId:', categoryId);
      
      const response = await serviceDetailsService.getSubServices(categoryId);
      
      if (response.success && response.data) {
        setApiResponse(response.data);
        console.log('✅ ServiceSelection: API call successful:', response.data);
      } else {
        setError(response.message || 'Failed to load services');
        console.error('❌ ServiceSelection: API call failed:', response.message);
      }
    } catch (err) {
      console.error('❌ ServiceSelection: API error:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Single useEffect for API call - no dependencies that cause re-renders
  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]); // Only depend on categoryId

  // Memoized data extraction
  const { videoUrl, categoryName, subServices } = React.useMemo(() => {
    if (!apiResponse) {
      return { videoUrl: null, categoryName: '', subServices: [] };
    }

    // Extract video URL with better error handling
    let extractedVideoUrl = null;

    console.log('🎥 ServiceSelection: Checking video data:', {
      hasServiceVideos: !!apiResponse.serviceVideos,
      serviceVideos: apiResponse.serviceVideos,
      categoryName: apiResponse.name
    });

    if (apiResponse.serviceVideos?.video_url) {
      extractedVideoUrl = apiResponse.serviceVideos.video_url;
      console.log('✅ ServiceSelection: Video URL found:', extractedVideoUrl);
    } else {
      console.log('❌ ServiceSelection: No video URL found for category:', apiResponse.name);
      // Check if there's any video data structure
      if (apiResponse.serviceVideos) {
        console.log('🔍 ServiceSelection: ServiceVideos structure:', apiResponse.serviceVideos);
      }
    }

    return {
      videoUrl: extractedVideoUrl,
      categoryName: apiResponse.name || '',
      subServices: apiResponse.subcategories || []
    };
  }, [apiResponse]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleServiceSelect = useCallback((subService) => {
    navigate(`/service-details/${subService.id}`, {
      state: {
        categoryId: categoryId,
        subCategoryId: subService.id,
        serviceName: categoryName,
        subServiceName: subService.name || ''
      }
    });
  }, [navigate, categoryId, categoryName]);

  // Loading state with shimmer effect matching Flutter
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Mobile Layout Loading */}
        <div className="block md:hidden">
          {/* Loading Video Player */}
          <div className="relative full-width-breakout">
            <div
              className="w-full h-56 animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, #fdba74 25%, #fb923c 50%, #fdba74 75%)',
                backgroundSize: '200% 100%'
              }}
            ></div>
          </div>

          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Service</h2>

            {/* Loading Service Cards */}
            <div className="grid grid-cols-4 gap-2" style={{ gap: '8px' }}>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, #fdba74 25%, #fb923c 50%, #fdba74 75%)',
                    backgroundSize: '200% 100%',
                    animationDelay: `${index * 0.1}s`,
                    minHeight: '100px'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout Loading */}
        <div className="hidden md:block bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Loading Header */}
            <div className="flex items-center mb-6">
              <div className="w-6 h-6 bg-gray-300 rounded mr-4 animate-pulse"></div>
              <div className="w-64 h-8 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Loading Video Player */}
            <div className="mb-10 rounded-xl max-w-4xl mx-auto">
              <div
                className="w-full h-80 rounded-xl animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, #fdba74 25%, #fb923c 50%, #fdba74 75%)',
                  backgroundSize: '200% 100%'
                }}
              ></div>
            </div>

            {/* Loading Service Grid */}
            <div className="grid grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl min-h-[140px] animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, #fdba74 25%, #fb923c 50%, #fdba74 75%)',
                    backgroundSize: '200% 100%',
                    animationDelay: `${index * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCategoryData}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout - Exactly like Flutter */}
      <div className="block md:hidden">
        {/* Mobile Video Player - Full Width Edge to Edge */}
        <div className="relative full-width-breakout">
          <OptimizedVideoPlayer
            videoUrl={videoUrl}
            onBack={handleBack}
            showBackButton={true}
            className="w-full h-56"
          />
        </div>

        {/* Mobile Service Selection */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Service</h2>

          <div className="grid grid-cols-4" style={{ gap: '8px' }}>
            {subServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-102"
                style={{
                  backgroundColor: '#F6F6F6',
                  paddingTop: '20px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingBottom: '12px',
                  minHeight: '100px'
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 mb-2 flex items-center justify-center flex-shrink-0">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-500 text-lg">🔧</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-900 leading-tight text-center px-1 mt-auto">
                    {service.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Max 70% Width */}
      <div className="hidden md:block bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop Header - With Back Button */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Select Service - {categoryName}</h1>
          </div>

          {/* Desktop Video Player - Optimized Proportions */}
          <div className="mb-10 rounded-xl shadow-lg bg-orange-50 max-w-4xl mx-auto">
            <OptimizedVideoPlayer
              videoUrl={videoUrl}
              showBackButton={false}
              className="w-full h-80"
            />
          </div>

          {/* Desktop Service Grid - Improved Height and Spacing */}
          <div className="grid grid-cols-4 gap-8">
            {subServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 min-h-[140px]"
                style={{ backgroundColor: '#F6F6F6' }}
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className="w-20 h-20 mb-6 flex items-center justify-center">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-500 text-3xl">🔧</span>
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-medium text-gray-900 leading-tight">
                    {service.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
