'use client';

import { useState } from 'react';
import { tokenCookies } from '@/utils/cookies';
import { apiClient } from '@/utils/apiClient';
import { authService } from '@/services/authService';

export default function TokenDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkTokenStatus = () => {
    const token = tokenCookies.getAccessToken();
    const tokenType = tokenCookies.getTokenType();
    const user = tokenCookies.getUser();
    
    const info = {
      hasToken: !!token,
      tokenType,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      fullToken: token || 'None',
      user,
      isAuthenticated: tokenCookies.isAuthenticated(),
      expectedAuthHeader: token && tokenType ? `${tokenType} ${token}` : 'None',
      bearerFormat: token && tokenType ? `Bearer ${token}` : 'None',
    };
    
    setDebugInfo(info);
    console.log('🔍 Token Debug Info:', info);
  };

  const testApiClient = () => {
    apiClient.debugTokenStatus();
  };

  const testLogout = async () => {
    console.log('🧪 Testing logout functionality...');
    try {
      await authService.logout();
      console.log('✅ Logout test completed');
      
      // Update debug info after logout
      setTimeout(() => {
        checkTokenStatus();
      }, 100);
    } catch (error) {
      console.error('❌ Logout test failed:', error);
    }
  };

  const debugAllCookies = () => {
    console.log('🍪 Debugging all cookies...');
    tokenCookies.debugCookies();
  };

  const debugAuthStatus = () => {
    console.log('🔍 Debugging authentication status...');
    authService.debugAuthStatus();
  };

  const forceClearCookies = () => {
    console.log('💥 Force clearing all cookies...');
    tokenCookies.forceClearAll();
    
    // Update debug info after force clear
    setTimeout(() => {
      checkTokenStatus();
    }, 100);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Debugger</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={checkTokenStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Check Token Status
          </button>
          
          <button
            onClick={testApiClient}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Test API Client
          </button>

          <button
            onClick={debugAllCookies}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            Debug All Cookies
          </button>

          <button
            onClick={debugAuthStatus}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
          >
            Debug Auth Status
          </button>

          <button
            onClick={testLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Test Logout
          </button>

          <button
            onClick={forceClearCookies}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors text-sm"
          >
            Force Clear All
          </button>
        </div>

        {debugInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Token Information:</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Has Token:</strong> {debugInfo.hasToken ? 'Yes' : 'No'}</div>
              <div><strong>Token Type:</strong> {debugInfo.tokenType || 'None'}</div>
              <div><strong>Token Preview:</strong> {debugInfo.tokenPreview}</div>
              <div><strong>Is Authenticated:</strong> {debugInfo.isAuthenticated ? 'Yes' : 'No'}</div>
              <div><strong>Expected Auth Header:</strong> {debugInfo.expectedAuthHeader}</div>
              <div><strong>Bearer Format:</strong> {debugInfo.bearerFormat}</div>
              {debugInfo.user && (
                <div><strong>User:</strong> {JSON.stringify(debugInfo.user)}</div>
              )}
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-gray-700">Full Token (for debugging)</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {debugInfo.fullToken}
              </pre>
            </details>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-md">
          <strong>Debug Tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Check browser console for detailed logs</li>
            <li>• Use "Test Logout" to verify cookie clearing</li>
            <li>• Check browser dev tools → Application → Cookies</li>
            <li>• Refresh page after logout to verify state reset</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 