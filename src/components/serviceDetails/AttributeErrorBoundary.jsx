import React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

/**
 * AttributeErrorBoundary - Error boundary for attribute rendering
 * 
 * Handles errors that occur during attribute rendering and provides:
 * - Graceful error fallback UI
 * - Error reporting for debugging
 * - Recovery options for users
 * - Detailed error information in development
 */
class AttributeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 AttributeErrorBoundary: Error caught');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    // For now, we'll just log it
    console.error('AttributeErrorBoundary: Error reported', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || 'No stack trace',
      componentStack: this.state.errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId
    };

    // In a real app, this would open a bug report form or send to support
    console.log('Bug report data:', errorDetails);
    alert('Error details have been logged to the console. Please contact support with Error ID: ' + this.state.errorId);
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      const { error, errorInfo, errorId } = this.state;

      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            errorId={errorId}
            onRetry={this.handleRetry}
            onReportBug={this.handleReportBug}
          />
        );
      }

      // Default error UI
      return (
        <div className="attribute-error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Attribute Rendering Error
              </h3>
              <p className="text-red-700 mb-4">
                There was an error displaying the service attributes. This might be due to an unexpected data format from the server.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Issue
                </button>
              </div>

              {/* Error ID for support */}
              <div className="text-xs text-red-600 mb-3">
                Error ID: <code className="bg-red-100 px-1 py-0.5 rounded">{errorId}</code>
              </div>

              {/* Development details */}
              {(process.env.NODE_ENV === 'development' || showDetails) && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-red-700 font-medium mb-2">
                    Technical Details (Development)
                  </summary>
                  <div className="bg-red-100 p-3 rounded border text-sm">
                    <div className="mb-3">
                      <strong>Error Message:</strong>
                      <pre className="mt-1 text-red-800 whitespace-pre-wrap">{error.message}</pre>
                    </div>
                    
                    {error.stack && (
                      <div className="mb-3">
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-red-800 text-xs overflow-x-auto whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-red-800 text-xs overflow-x-auto whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * AttributeErrorFallback - Reusable error fallback component
 */
export const AttributeErrorFallback = ({ 
  error, 
  errorInfo, 
  errorId, 
  onRetry, 
  onReportBug,
  title = "Attribute Error",
  message = "Unable to display service attributes"
}) => (
  <div className="attribute-error-fallback p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-start">
      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-yellow-800 font-semibold mb-1">{title}</h4>
        <p className="text-yellow-700 text-sm mb-3">{message}</p>
        
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={onReportBug}
            className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Report
          </button>
        </div>
        
        {errorId && (
          <div className="text-xs text-yellow-600 mt-2">
            ID: <code>{errorId}</code>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * withAttributeErrorBoundary - HOC to wrap components with error boundary
 */
export const withAttributeErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <AttributeErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AttributeErrorBoundary>
  );
  
  WrappedComponent.displayName = `withAttributeErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default AttributeErrorBoundary;
