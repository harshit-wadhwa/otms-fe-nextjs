'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

interface StudentResult {
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

interface TestInfo {
  id: number;
  name: string;
  description: string;
  score: number;
  time: number;
  created_at: string;
}

export default function TeacherTestReviewSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;

  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'percentage'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all scores for this test
        const scoresResponse = await apiClient.get<{ scores: StudentResult[] }>('/scores');
        const testScores = scoresResponse.scores.filter(score => score.test_id === parseInt(testId));
        setStudentResults(testScores);

        // Fetch test information
        const testResponse = await apiClient.get<TestInfo>(`/teacher/tests/${testId}`);
        setTestInfo(testResponse);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load test results.');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchData();
    }
  }, [testId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m${s > 0 ? ` ${s}s` : ''}`;
    return `${s}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filter and sort results
  const filteredResults = studentResults
    .filter(result => 
      result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !testInfo) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow">{error || 'Test not found.'}</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 max-w-7xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Scores', href: '/scores' },
              { label: 'Test Review Summary' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Test Information Header */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{testInfo.name}</h1>
              {testInfo.description && (
                <p className="text-gray-600 text-lg">{testInfo.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {studentResults.length}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {studentResults.filter(r => r.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {testInfo.score}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {formatTime(testInfo.time)}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              Created: {formatDate(testInfo.created_at)}
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Students
                </label>
                <input
                  type="text"
                  placeholder="Search by student name or email..."
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

          {/* Student Results Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-lg font-medium">No student results found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {result.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.student_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.score} / {result.test_total_score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${getPercentageColor(result.percentage)}`}>
                            {result.percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(result.submitted_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/teacher/test-review/${testId}/${result.student_id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {filteredResults.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Average Score</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(filteredResults.reduce((sum, result) => sum + result.percentage, 0) / filteredResults.length)}%
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Highest Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...filteredResults.map(result => result.percentage))}%
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Lowest Score</div>
                <div className="text-2xl font-bold text-red-600">
                  {Math.min(...filteredResults.map(result => result.percentage))}%
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-500">Submission Rate</div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((filteredResults.filter(r => r.status === 'submitted').length / filteredResults.length) * 100)}%
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/scores')}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              Back to Scores
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 