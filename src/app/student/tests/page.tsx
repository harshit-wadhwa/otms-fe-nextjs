'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Test {
  id: number;
  name: string;
  total_score: number;
  time: number;
  questions: { id: number }[];
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<{ tests: Test[] }>('/student/tests');
        setTests(response.tests ?? []);
      } catch (err) {
        console.error('Failed to fetch tests:', err);
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Available Tests</h1>
                  <p className="text-gray-600">Take tests assigned to you by your teachers</p>
                </div>
                <Link
                  href="/student/dashboard"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Tests Grid */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Tests</h2>
            </div>
            <div className="px-6 py-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tests.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-xl font-medium mb-2">No tests available</p>
                      <p className="text-sm">Your teachers haven&apos;t assigned any tests yet.</p>
                      <p className="text-sm mt-2">Check back later for new assignments.</p>
                    </div>
                  ) : (
                    tests.map((test) => (
                      <div
                        key={test.id}
                        className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{test.name}</h3>
                          <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Total Score: <span className="font-semibold text-blue-700 ml-1">{test.total_score} pts</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Questions: <span className="font-semibold text-green-700 ml-1">{test.questions.length}</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Duration: <span className="font-semibold text-orange-700 ml-1">{formatTime(test.time)}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/give-test/${test.id}`}
                          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center block"
                        >
                          Start Test
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          {!loading && !error && tests.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Test Taking Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Read each question carefully before answering
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Manage your time wisely - you can see the timer during the test
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  You can navigate between questions using the pagination buttons
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Review your answers before submitting
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 