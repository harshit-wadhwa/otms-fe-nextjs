'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function DashboardPage() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
              <Link
                href="/scores"
                className="relative bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
              >
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-4xl">
                    📈
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1 drop-shadow">Test Scores</h3>
                <p className="text-emerald-100 text-sm mb-1">View test results and analytics</p>
              </Link>
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

        {/* Admin Access Notice */}
        {user?.role === 'admin' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Admin Access
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You are logged in as an administrator. For admin-specific features, please visit the <Link href="/admin/dashboard" className="font-medium underline">Admin Dashboard</Link>.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 