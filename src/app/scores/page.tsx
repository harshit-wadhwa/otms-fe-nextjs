'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

interface Score {
  id: number;
  test_id: number;
  test_name: string;
  test_total_score: number;
  test_duration: number;
  test_created_at: string;
  student_id: number;
  student_name: string;
  student_email: string;
  score: number;
  status: string;
  percentage: number;
  submitted_at: string;
}

export default function ScoresPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScores, setFilteredScores] = useState<Score[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'percentage'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<{ scores: Score[] }>('/scores');
        setScores(response.scores ?? []);
      } catch (err) {
        console.error('Failed to fetch scores:', err);
        setError('Failed to load scores.');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  // Filter and sort scores
  useEffect(() => {
    let filtered = scores;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(score =>
        score.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.student_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'percentage':
          comparison = a.percentage - b.percentage;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredScores(filtered);
  }, [scores, searchTerm, sortBy, sortOrder]);

  // Format time from seconds to readable format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get percentage color
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/student/dashboard' },
              { label: 'Test Scores' }
            ]}
          />

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Test Scores
            </h1>
            <p className="text-gray-600 text-center mb-8">
              {isTeacher ? 'View all student test scores' : 'View your test scores'}
            </p>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search by test name or student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'percentage')}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="date">Date</option>
                      <option value="score">Score</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading scores...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Scores Table */}
            {!loading && !error && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {filteredScores.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No scores found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test
                          </th>
                          {isTeacher && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredScores.map((score) => (
                          <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {score.test_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Duration: {formatTime(score.test_duration)}
                                </div>
                              </div>
                            </td>
                            {isTeacher && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {score.student_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {score.student_email}
                                  </div>
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {score.score} / {score.test_total_score}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-bold ${getPercentageColor(score.percentage)}`}>
                                {score.percentage}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(score.status)}`}>
                                {score.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(score.submitted_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Summary Stats */}
            {!loading && !error && filteredScores.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Total Tests</div>
                  <div className="text-2xl font-bold text-gray-900">{filteredScores.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Average Score</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(filteredScores.reduce((sum, score) => sum + score.percentage, 0) / filteredScores.length)}%
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Highest Score</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...filteredScores.map(score => score.percentage))}%
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Lowest Score</div>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.min(...filteredScores.map(score => score.percentage))}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 