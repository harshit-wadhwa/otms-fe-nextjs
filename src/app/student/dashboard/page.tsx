'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Score {
  id: number;
  test_name: string;
  score: number;
  test_total_score: number;
  percentage: number;
  submitted_at: string;
}

export default function StudentDashboard() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch scores for statistics
        const scoresResponse = await apiClient.get<{ scores: Score[] }>('/scores');
        setScores(scoresResponse.scores ?? []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };



  // Calculate dashboard statistics
  const completedTests = scores.length;
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length)
    : 0;
  const highestScore = scores.length > 0 
    ? Math.max(...scores.map(score => score.percentage))
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600 text-lg">Loading dashboard...</span>
            </div>
          )}
          
          {!loading && (
            <>
              {/* Header */}
              <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                  <p className="text-gray-600">
                    Welcome back, {user?.first_name || user?.username || 'Student'}!
                  </p>
                </div>
                <div className="flex items-center gap-4">
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedTests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedTests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{highestScore}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/scores"
                  className="relative bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
                >
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-5xl">
                      📈
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2 drop-shadow">View My Scores</h3>
                  <p className="text-emerald-100 text-base mb-1">Check your test results and performance</p>
                </Link>

                <Link
                  href="/student/tests"
                  className="relative bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
                >
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-5xl">
                      📝
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2 drop-shadow">Available Tests</h3>
                  <p className="text-blue-100 text-base mb-1">Take tests assigned to you</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Test Results Card */}
          {scores.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Test Results</h2>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  {scores.slice(0, 5).map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{score.test_name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(score.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {score.score}/{score.test_total_score}
                        </p>
                        <p className={`text-sm font-semibold ${
                          score.percentage >= 90 ? 'text-green-600' :
                          score.percentage >= 80 ? 'text-blue-600' :
                          score.percentage >= 70 ? 'text-yellow-600' :
                          score.percentage >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {score.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {scores.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/scores"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all scores →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 