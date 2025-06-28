import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * SettingsErrorBoundary - Error boundary specifically for settings page
 * Provides graceful error handling with recovery options
 */
class SettingsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Settings Error Boundary caught an error:', error, errorInfo);
    }

    // TODO: Log error to monitoring service in production
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <SettingsErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * SettingsErrorFallback - Error fallback UI for settings page
 */
const SettingsErrorFallback = ({ error, errorInfo, onRetry, retryCount }) => {
  const navigate = useNavigate();

  const errorMessages = {
    ChunkLoadError: {
      title: 'Loading Error',
      message: 'Failed to load settings components. This might be due to a network issue.',
      suggestion: 'Please refresh the page or try again later.'
    },
    NetworkError: {
      title: 'Network Error',
      message: 'Unable to connect to the server.',
      suggestion: 'Please check your internet connection and try again.'
    },
    AuthenticationError: {
      title: 'Authentication Error',
      message: 'Your session has expired.',
      suggestion: 'Please log in again to access your settings.'
    },
    default: {
      title: 'Something went wrong',
      message: 'An unexpected error occurred while loading your settings.',
      suggestion: 'Please try refreshing the page or contact support if the problem persists.'
    }
  };

  // Determine error type
  const getErrorType = (error) => {
    if (error?.name === 'ChunkLoadError') return 'ChunkLoadError';
    if (error?.message?.includes('Network')) return 'NetworkError';
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) return 'AuthenticationError';
    return 'default';
  };

  const errorType = getErrorType(error);
  const errorConfig = errorMessages[errorType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-25 via-orange-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Go back"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Error Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
          >
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {errorConfig.title}
            </h2>
            <p className="text-gray-600 mb-2">
              {errorConfig.message}
            </p>
            <p className="text-sm text-gray-500">
              {errorConfig.suggestion}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
              {retryCount > 0 && (
                <span className="text-xs opacity-75">({retryCount})</span>
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              Back to Profile
            </button>

            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </motion.div>



          {/* Support Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              If this problem persists, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 text-xs text-blue-600">
              <span>📧 support@eassylife.in</span>
              <span className="hidden sm:inline">•</span>
              <span>📞 +91-XXXX-XXXXXX</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * withSettingsErrorBoundary - HOC to wrap components with settings error boundary
 */
export const withSettingsErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <SettingsErrorBoundary>
        <Component {...props} />
      </SettingsErrorBoundary>
    );
  };
};

export default SettingsErrorBoundary;
