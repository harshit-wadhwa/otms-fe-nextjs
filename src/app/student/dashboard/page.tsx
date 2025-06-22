'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

interface Test {
  id: number;
  name: string;
  total_score: number;
  time: number;
  questions: { id: number }[];
}

export default function StudentDashboard() {
  const { logout } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        // Adjust endpoint if needed
        const response = await apiClient.get<{ tests: Test[] }>('/student/tests');
        setTests(response.tests ?? []);
      } catch (err) {
        setError('Failed to load tests.');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Format time from seconds to readable format
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m${s > 0 ? ` ${s}s` : ''}`;
    return `${s}s`;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb items={[{ label: 'Student Dashboard' }]} />
            <button
              onClick={async () => { await logout(); window.location.href = '/login'; }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Tests</h1>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600 text-lg">Loading tests...</span>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {tests.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 text-lg py-12">
                  No tests available at the moment.
                </div>
              ) : (
                tests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col justify-between hover:shadow-xl transition-shadow"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{test.name}</h2>
                      <div className="text-gray-600 mb-2">Total Score: <span className="font-semibold text-blue-700">{test.total_score}</span></div>
                      <div className="text-gray-500 text-sm mb-2">Questions: {test.questions.length}</div>
                      <div className="text-gray-500 text-sm mb-4">Time: {formatTime(test.time)}</div>
                    </div>
                    <Link
                      href={`/give-test/${test.id}`}
                      className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-center cursor-pointer"
                    >
                      Give Test
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 