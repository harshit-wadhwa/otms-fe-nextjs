'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/utils/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  created_by: number;
  student_count: number;
  test_count: number;
  full_name: string;
}

interface SystemStats {
  total_teachers: number;
  total_students: number;
  total_tests: number;
  total_submissions: number;
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching teachers data...');
        const teachersResponse = await apiClient.get<{ teachers: Teacher[] }>('/admin/teachers');
        console.log('Teachers response:', teachersResponse);
        setTeachers(teachersResponse.teachers || []);
        
        // Calculate system stats from teachers data
        const stats: SystemStats = {
          total_teachers: teachersResponse.teachers?.length || 0,
          total_students: teachersResponse.teachers?.reduce((sum, teacher) => sum + teacher.student_count, 0) || 0,
          total_tests: teachersResponse.teachers?.reduce((sum, teacher) => sum + teacher.test_count, 0) || 0,
          total_submissions: 0 // This would need a separate API call for accurate data
        };
        console.log('Calculated stats:', stats);
        setSystemStats(stats);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load dashboard data.');
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
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
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">System administration and teacher management</p>
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

          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Admin Dashboard', href: '/admin/dashboard' }
              ]}
            />
          </div>

          {/* System Statistics */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.total_teachers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.total_students}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.total_tests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.total_submissions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/admin/add-teacher"
                  className="relative bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
                >
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-5xl">
                      👨‍🏫
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2 drop-shadow">Add Teacher</h3>
                  <p className="text-blue-100 text-base mb-1">Register a new teacher to the system</p>
                </Link>

                <Link
                  href="/admin/add-admin"
                  className="relative bg-gradient-to-br from-purple-500 to-pink-500 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
                >
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-5xl">
                      👑
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2 drop-shadow">Add Admin</h3>
                  <p className="text-purple-100 text-base mb-1">Create a new admin user</p>
                </Link>

                {/* <Link
                  href="/scores"
                  className="relative bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all text-center group overflow-hidden"
                >
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-5xl">
                      📈
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2 drop-shadow">View All Scores</h3>
                  <p className="text-emerald-100 text-base mb-1">Monitor system-wide test results</p>
                </Link> */}
              </div>
            </div>
          </div>

          {/* Teachers Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Teacher Management</h2>
                <Link
                  href="/admin/add-teacher"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Teacher
                </Link>
              </div>
            </div>
            <div className="px-6 py-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              {teachers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-lg font-medium">No teachers found</p>
                  <p className="text-sm">Add your first teacher to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teacher
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tests
                        </th>
                                                 
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {teacher.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{teacher.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{teacher.email}</div>
                              {teacher.phone && (
                                <div className="text-sm text-gray-500">{teacher.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.student_count}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.test_count}
                            </div>
                          </td>
                                                     
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Link
                                href={`/admin/teacher/${teacher.id}`}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                View Details
                              </Link>
                              <button
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${teacher.full_name}?`)) {
                                    // Handle delete
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 