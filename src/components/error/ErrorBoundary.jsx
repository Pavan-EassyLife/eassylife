import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI instead of crashing the entire application
 */
class ErrorBoundary extends React.Component {
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
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    console.log('🔄 ErrorBoundary: Retrying...');
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    console.log('🏠 ErrorBoundary: Navigating to home...');
    window.location.href = '/home';
  };

  handleReload = () => {
    console.log('🔄 ErrorBoundary: Reloading page...');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const { fallback: CustomFallback } = this.props;

      // If a custom fallback is provided, use it
      if (CustomFallback) {
        return <CustomFallback error={error} errorInfo={errorInfo} onRetry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Error Icon Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative mx-auto w-24 h-24">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-red-100 rounded-full flex items-center justify-center"
                >
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
              
              {/* Show retry count if user has tried multiple times */}
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  Retry attempts: {retryCount}
                </p>
              )}

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && error && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-left bg-gray-100 rounded-lg p-4"
                >
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details (Development Mode)
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.toString()}
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.details>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {/* Retry Button */}
              <button
                onClick={this.handleRetry}
                className="group relative overflow-hidden px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  background: 'linear-gradient(-45deg, #fb923c, #ea580c, #fdba74)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient 8s ease infinite'
                }}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </div>
              </button>

              {/* Go Home Button */}
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 rounded-lg bg-white"
              >
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Go to Home
                </div>
              </button>

              {/* Reload Page Button */}
              <button
                onClick={this.handleReload}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </div>
              </button>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-500 text-sm">
                If the problem persists, please contact our support team.
              </p>
            </motion.div>
          </div>

          {/* Global CSS for gradient animation */}
          <style>{`
            @keyframes gradient {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}</style>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
