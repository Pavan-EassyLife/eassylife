import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

/**
 * OrderErrorBoundary Component
 * Catches JavaScript errors in the order components and displays a fallback UI
 */
class OrderErrorBoundary extends React.Component {
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
    // Log the error to console and error reporting service
    console.error('OrderErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Here you could also log the error to an error reporting service
    // like Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const maxRetries = 3;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              {/* Error Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>

              {/* Error Description */}
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {retryCount >= maxRetries 
                  ? "We're experiencing technical difficulties. Please try again later or contact support if the problem persists."
                  : "An unexpected error occurred while loading your orders. Please try again."
                }
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="mb-6 p-3 bg-gray-100 rounded-lg text-left">
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {error.toString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {retryCount < maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {/* Retry Counter */}
              {retryCount > 0 && retryCount < maxRetries && (
                <p className="text-xs text-gray-500 mt-4">
                  Retry attempt: {retryCount}/{maxRetries}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withOrderErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <OrderErrorBoundary>
        <Component {...props} />
      </OrderErrorBoundary>
    );
  };
};

/**
 * Hook to handle async errors in functional components
 */
export const useOrderErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    console.error('Order error:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
};

/**
 * Network Error Component
 * Displays when there are network connectivity issues
 */
export const NetworkErrorFallback = ({ onRetry, isRetrying = false }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 max-w-md mx-auto">
    <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-lg">
      <AlertTriangle className="w-10 h-10 text-yellow-500" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
      Connection Problem
    </h3>
    
    <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed">
      Please check your internet connection and try again.
    </p>
    
    <Button
      onClick={onRetry}
      disabled={isRetrying}
      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
    >
      {isRetrying ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Retrying...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </>
      )}
    </Button>
  </div>
);

export default OrderErrorBoundary;
