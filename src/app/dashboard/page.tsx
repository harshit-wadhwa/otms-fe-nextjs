'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';
import TokenDebugger from '@/components/TokenDebugger';
import Link from 'next/link';

interface ProfileData {
  id: number;
  username: string;
  email?: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get<ProfileData>(API_CONFIG.ENDPOINTS.PROFILE);
      setProfileData(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const testAuthenticatedRequest = async () => {
    setLoading(true);
    setError('');
    try {
      // This is just an example - replace with your actual API endpoint
      const response = await apiClient.get('/api/test-auth');
      alert('Authenticated request successful!');
    } catch (error) {
      console.error('Authenticated request failed:', error);
      setError(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const debugTokenStatus = () => {
    const info = apiClient.debugTokenStatus();
    setDebugInfo(info);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to your OTMS dashboard</p>
              </div>
              <div className="flex items-center gap-4">
                {/* <Link
                  href="/add-test"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Test
                </Link> */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {/* <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
              </div>
              {user?.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* Test Management Card */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Test Management</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/add-test"
                className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center group"
              >
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-semibold text-lg mb-2">Create New Test</h3>
                <p className="text-blue-100 text-sm">Add a new test with questions and options</p>
              </Link>
              
              <Link
                href="/tests"
                className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center group"
              >
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-lg mb-2">View Tests</h3>
                <p className="text-green-100 text-sm">Manage and view existing tests</p>
              </Link>
              
              <Link
                href="/add-student"
                className="relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group border border-blue-100"
              >
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 shadow text-4xl">
                    👤
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1 text-gray-900">Add Student</h3>
                <p className="text-gray-600 text-sm mb-1">Register a new student to the system</p>
              </Link>
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-lg mb-2">Test Results</h3>
                <p className="text-gray-600 text-sm">View test results and analytics</p>
                <button className="mt-3 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm">
                  Coming Soon
                </button>
              </div>
              <Link
                href="/assign-test"
                className="relative bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
              >
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-4xl">
                    📨
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1 drop-shadow">Assign Test</h3>
                <p className="text-indigo-100 text-sm mb-1">Assign a test to all students</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Token Debugger */}
        {/* <div className="mb-8">
          <TokenDebugger />
        </div> */}

        {/* API Test Card */}
        {/* <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">API Authentication Test</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={fetchProfile}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Fetch Profile'}
                </button>
                
                <button
                  onClick={testAuthenticatedRequest}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Test Authenticated Request'}
                </button>

                <button
                  onClick={debugTokenStatus}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Debug Token Status
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {profileData && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  <strong>Profile Data Retrieved:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(profileData, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                  <strong>Token Debug Info:</strong>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* Token Information Card */}
        {/* <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Authentication Status</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Authenticated with cookies</span>
              </div>
              <div className="text-xs text-gray-500">
                Bearer token is automatically included in all API requests
              </div>
              <div className="text-xs text-gray-500">
                Check browser console for detailed request logs
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
} 