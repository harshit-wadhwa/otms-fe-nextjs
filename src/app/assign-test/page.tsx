'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';

interface Test {
  id: number;
  name: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
}

export default function AssignTestPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const testsRes = await apiClient.get<{ tests: Test[] }>('/teacher/tests');
        const studentsRes = await apiClient.get<{ students: Student[] }>('/teacher/students');
        setTests(testsRes.tests ?? []);
        setStudents(studentsRes.students ?? []);
      } catch (error) {
        console.log(error);
        setError('Failed to load tests or students.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!selectedTest) {
      setError('Please select a test to assign.');
      return;
    }
    setAssigning(true);
    try {
      // Assign to all students
      const payload = {
        student_ids: students.map(s => s.id),
      };
      await apiClient.post(`/teacher/tests/${selectedTest}/assign`, payload);
      setSuccess('Test assigned to all students successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to assign test.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assign Test' }
          ]} />
          <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-8 text-center">Assign Test to All Students</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md text-center font-semibold">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md text-center font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Test *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={selectedTest}
                onChange={e => setSelectedTest(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">-- Select a test --</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>{test.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-48 overflow-y-auto text-gray-700 text-sm">
                {loading ? 'Loading students...' : students.length === 0 ? 'No students found.' : (
                  <ul className="list-disc pl-5">
                    {students.map(s => (
                      <li key={s.id}>{s.first_name} {s.last_name || ''} ({s.email})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={assigning || loading || students.length === 0}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? 'Assigning...' : 'Assign Test to All Students'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 