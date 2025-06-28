import React, { useState, useEffect } from 'react';
import serviceProviderService from '../../api/services/serviceProviderService';
import { API_CONFIG } from '../../api/config';

/**
 * API Debug Test Component
 * Used to test and debug the service provider API URL generation
 */
const ApiDebugTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState(null);

  // Log API configuration on component mount
  useEffect(() => {
    console.log('🔧 API Debug Test: Component mounted');
    console.log('🔧 API Configuration:', API_CONFIG);
    setApiConfig(API_CONFIG);
  }, []);

  // Test cases based on the Flutter and React URLs provided
  const testCases = [
    {
      name: 'Flutter App Parameters (Exact from Network Tab)',
      params: {
        catId: '561c01d348b6d760413d99e9f6733ed6',
        subCatId: '1bdfe916ddd7e7556863948ae35a8326',
        attributeList: [
          {
            attribute_id: '0fe977f6dab2b2cf9860079de49a7691',
            option_id: '1bdfe916ddd7e7556863948ae35a8326'
          }
        ],
        segmentId: '1566ba3af15a95c202eb4d93bb059d4c',
        page: '1',
        size: '10'
      }
    },
    {
      name: 'React Webapp Current (Wrong Format)',
      params: {
        catId: '1bdfe916ddd7e7556863948ae35a8326',
        subCatId: '1bdfe916ddd7e7556863948ae35a8326',
        attributeList: [
          {
            attribute_id: 'Type of AC',
            option_id: {
              id: '2d136416f73de4fa0ff21620cf918167',
              value: 'split',
              data: {
                id: '2d136416f73de4fa0ff21620cf918167',
                name: 'split',
                weight: 0,
                is_linked: 0
              },
              timestamp: 1750956057898
            }
          }
        ],
        segmentId: '',
        page: '1',
        size: '10'
      }
    },
    {
      name: 'React Webapp Fixed Format',
      params: {
        catId: '561c01d348b6d760413d99e9f6733ed6',
        subCatId: '1bdfe916ddd7e7556863948ae35a8326',
        attributeList: [
          {
            attribute_id: '0fe977f6dab2b2cf9860079de49a7691',
            option_id: '1bdfe916ddd7e7556863948ae35a8326'
          }
        ],
        segmentId: '1566ba3af15a95c202eb4d93bb059d4c',
        page: '1',
        size: '10'
      }
    }
  ];

  const runTest = async (testCase) => {
    setIsLoading(true);

    try {
      console.log(`🧪 Running test: ${testCase.name}`);
      console.log('📋 Test parameters:', testCase.params);

      // Show expected URL format
      const expectedAttributes = JSON.stringify(testCase.params.attributeList);
      const expectedURL = `providers/services?category_id=${testCase.params.catId}&subcategory_id=${testCase.params.subCatId}&attributes=${encodeURIComponent(expectedAttributes)}&segment_id=${testCase.params.segmentId}`;
      console.log('🎯 Expected URL:', expectedURL);

      const result = await serviceProviderService.getServiceProviders(testCase.params);

      const testResult = {
        name: testCase.name,
        params: testCase.params,
        expectedURL,
        success: result.success,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);

      console.log(`✅ Test completed: ${testCase.name}`, testResult);

    } catch (error) {
      const testResult = {
        name: testCase.name,
        params: testCase.params,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);

      console.error(`❌ Test failed: ${testCase.name}`, error);
    }

    setIsLoading(false);
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCase of testCases) {
      await runTest(testCase);
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔧 Service Provider API Debug Test</h2>

      {apiConfig && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          <h4>📋 Current API Configuration:</h4>
          <pre style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(apiConfig, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runAllTests}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <button
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>🎯 Target Flutter URL:</h4>
        <pre style={{ fontSize: '11px', wordBreak: 'break-all', margin: '5px 0' }}>
          https://app.eassylife.in/api/customer/v2.0.0/providers/services?category_id=561c01d348b6d760413d99e9f6733ed6&subcategory_id=1bdfe916ddd7e7556863948ae35a8326&attributes=%5B%7B%22attribute_id%22:%220fe977f6dab2b2cf9860079de49a7691%22,%22option_id%22:%221bdfe916ddd7e7556863948ae35a8326%22%7D%5D&segment_id=1566ba3af15a95c202eb4d93bb059d4c
        </pre>
      </div>

      <div>
        <h3>Test Cases:</h3>
        {testCases.map((testCase, index) => (
          <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4>{testCase.name}</h4>
            <button 
              onClick={() => runTest(testCase)}
              disabled={isLoading}
              style={{ 
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Run Test
            </button>
            <pre style={{ fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', marginTop: '10px' }}>
              {JSON.stringify(testCase.params, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div>
          <h3>Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '15px', 
                padding: '15px', 
                border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
                borderRadius: '4px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da'
              }}
            >
              <h4 style={{ color: result.success ? '#155724' : '#721c24' }}>
                {result.success ? '✅' : '❌'} {result.name}
              </h4>
              <p><strong>Timestamp:</strong> {result.timestamp}</p>
              <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
              {result.expectedURL && (
                <details style={{ marginTop: '10px' }}>
                  <summary><strong>Expected URL</strong></summary>
                  <pre style={{ fontSize: '11px', backgroundColor: '#e9ecef', padding: '8px', marginTop: '5px', wordBreak: 'break-all' }}>
                    {result.expectedURL}
                  </pre>
                </details>
              )}
              {result.message && <p><strong>Message:</strong> {result.message}</p>}
              {result.error && <p><strong>Error:</strong> {result.error}</p>}
              {result.data && (
                <details>
                  <summary>Response Data</summary>
                  <pre style={{ fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', marginTop: '10px' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDebugTest;
