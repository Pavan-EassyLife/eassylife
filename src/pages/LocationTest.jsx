import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast';
import { locationDebugger, debugLocation } from '../utils/locationDebugger';

const LocationTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const { showSuccess, showError } = useToast();

  const runLocationTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      console.log('🔍 Starting comprehensive location test...');
      
      // Get device info
      const info = locationDebugger.getDeviceInfo();
      setDeviceInfo(info);
      
      // Run location tests
      const results = await debugLocation();
      setTestResults(results);
      
      if (results.positions.length > 0) {
        showSuccess('Location test completed successfully!');
      } else {
        showError('Location test failed. Check the results below.');
      }
      
    } catch (error) {
      console.error('Location test error:', error);
      showError('Failed to run location test: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (hasError) => {
    if (hasError) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const formatCoordinate = (coord) => {
    return coord ? coord.toFixed(6) : 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Accuracy Test</h1>
          <p className="text-gray-600">Diagnose location detection issues and test GPS accuracy</p>
        </div>

        {/* Test Button */}
        <div className="text-center mb-8">
          <Button
            onClick={runLocationTest}
            disabled={isRunning}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
          >
            {isRunning ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 mr-2" />
                Run Location Test
              </>
            )}
          </Button>
        </div>

        {/* Device Info */}
        {deviceInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Device Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Browser:</span> {deviceInfo.userAgent.split(' ')[0]}
              </div>
              <div>
                <span className="font-medium">Platform:</span> {deviceInfo.platform}
              </div>
              <div>
                <span className="font-medium">Secure Context:</span> 
                <span className={deviceInfo.secureContext ? 'text-green-600' : 'text-red-600'}>
                  {deviceInfo.secureContext ? ' Yes (HTTPS)' : ' No (HTTP)'}
                </span>
              </div>
              <div>
                <span className="font-medium">Geolocation Support:</span>
                <span className={deviceInfo.geolocationSupported ? 'text-green-600' : 'text-red-600'}>
                  {deviceInfo.geolocationSupported ? ' Supported' : ' Not Supported'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Results */}
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.positions.length}</div>
                  <div className="text-sm text-gray-600">Successful Readings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.errors.length}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{testResults.recommendations.length}</div>
                  <div className="text-sm text-gray-600">Recommendations</div>
                </div>
              </div>
            </div>

            {/* Position Results */}
            {testResults.positions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Readings</h2>
                <div className="space-y-4">
                  {testResults.positions.map((position, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{position.name}</h3>
                        {getStatusIcon(position.accuracy > 1000)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Latitude:</span><br />
                          {formatCoordinate(position.latitude)}
                        </div>
                        <div>
                          <span className="font-medium">Longitude:</span><br />
                          {formatCoordinate(position.longitude)}
                        </div>
                        <div>
                          <span className="font-medium">Accuracy:</span><br />
                          <span className={position.accuracy > 1000 ? 'text-red-600' : position.accuracy > 100 ? 'text-orange-600' : 'text-green-600'}>
                            {Math.round(position.accuracy)}m
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span><br />
                          {new Date(position.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {testResults.errors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Errors
                </h2>
                <ul className="space-y-2">
                  {testResults.errors.map((error, index) => (
                    <li key={index} className="text-red-700 bg-red-50 p-3 rounded">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {testResults.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
                <h2 className="text-xl font-semibold text-orange-900 mb-4">Recommendations</h2>
                <ul className="space-y-2">
                  {testResults.recommendations.map((rec, index) => (
                    <li key={index} className="text-orange-700 bg-orange-50 p-3 rounded">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use This Test</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Click "Run Location Test" to start the diagnostic</li>
            <li>• Allow location permission when prompted by your browser</li>
            <li>• The test will try multiple location detection methods</li>
            <li>• Check the results for accuracy and any issues</li>
            <li>• Follow the recommendations to improve location accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LocationTest;
