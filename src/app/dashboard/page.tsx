'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function DashboardPage() {
  const { logout } = useAuth();
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

      </div>
    </div>
  );
} 