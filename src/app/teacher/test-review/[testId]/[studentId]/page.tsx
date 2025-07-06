'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';

interface QuestionResult {
  question_id: number;
  question: string;
  options: string[];
  correct_answer: string[];
  student_answer: string[];
  is_correct: boolean;
  score: number;
  earned_score: number;
}

interface TestResult {
  test_id: number;
  test_name: string;
  test_description: string;
  test_total_score: number;
  test_duration: number;
  student_id: number;
  student_name: string;
  student_email: string;
  total_score: number;
  percentage: number;
  submitted_at: string;
  questions: QuestionResult[];
}

export default function TeacherTestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;
  const studentId = params?.studentId as string;

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const fetchTestResult = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<TestResult>(`/teacher/test-result/${testId}/${studentId}`);
        setTestResult(response);
      } catch (err) {
        console.error('Failed to fetch test result:', err);
        setError('Failed to load test result.');
      } finally {
        setLoading(false);
      }
    };

    if (testId && studentId) {
      fetchTestResult();
    }
  }, [testId, studentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
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

  if (error || !testResult) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow">{error || 'Test result not found.'}</div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQ = testResult.questions[currentQuestion];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 max-w-7xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Scores', href: '/scores' },
              { label: 'Student Test Review' }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Test Summary Header */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{testResult.test_name}</h1>
              {testResult.test_description && (
                <p className="text-gray-600 text-lg">{testResult.test_description}</p>
              )}
            </div>

            {/* Student Information */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Student Name:</div>
                  <div className="text-lg font-semibold text-gray-900">{testResult.student_name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Email:</div>
                  <div className="text-lg font-semibold text-gray-900">{testResult.student_email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Submitted:</div>
                  <div className="text-lg font-semibold text-gray-900">{formatDate(testResult.submitted_at)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Test Duration:</div>
                  <div className="text-lg font-semibold text-gray-900">{formatTime(testResult.test_duration)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(testResult.percentage)} mb-2`}>
                  {testResult.percentage}%
                </div>
                <div className="text-sm text-gray-600">Score Percentage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {testResult.total_score}/{testResult.test_total_score}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {testResult.questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {testResult.questions.filter(q => q.is_correct).length}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Navigation</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {testResult.questions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all
                    ${currentQuestion === idx
                      ? 'bg-blue-600 border-blue-700 text-white shadow-lg'
                      : question.is_correct
                        ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200'}
                  `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question Review */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Question {currentQuestion + 1} of {testResult.questions.length}
                </h2>
                <div className={`px-4 py-2 rounded-full font-semibold ${
                  currentQ.is_correct 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentQ.is_correct ? 'Correct' : 'Incorrect'}
                </div>
              </div>

              <div className="text-lg font-semibold text-gray-900 mb-6">
                {currentQ.question}
              </div>

              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  const isCorrect = currentQ.correct_answer.includes(option);
                  const isStudentAnswer = currentQ.student_answer.includes(option);
                  let optionClass = 'p-4 border-2 rounded-xl font-medium';
                  
                  if (isCorrect && isStudentAnswer) {
                    optionClass += ' bg-green-100 border-green-500 text-green-900';
                  } else if (isCorrect) {
                    optionClass += ' bg-green-100 border-green-500 text-green-900';
                  } else if (isStudentAnswer) {
                    optionClass += ' bg-red-100 border-red-500 text-red-900';
                  } else {
                    optionClass += ' bg-gray-50 border-gray-300 text-gray-700';
                  }

                  return (
                    <div key={idx} className={optionClass}>
                      <div className="flex items-center">
                        {isCorrect && (
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isStudentAnswer && !isCorrect && (
                          <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{option}</span>
                        {isCorrect && <span className="ml-auto text-sm font-semibold">✓ Correct Answer</span>}
                        {isStudentAnswer && !isCorrect && <span className="ml-auto text-sm font-semibold">✗ Student&apos;s Answer</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-600">Student&apos;s Answer:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {currentQ.student_answer.length > 0 ? currentQ.student_answer.join(', ') : 'No answer provided'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Correct Answer:</div>
                  <div className="text-lg font-semibold text-green-700">
                    {currentQ.correct_answer.join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Question Score:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {currentQ.score} points
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Points Earned:</div>
                  <div className={`text-lg font-semibold ${currentQ.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                    {currentQ.earned_score} points
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                Previous Question
              </button>
              
              <button
                onClick={() => setCurrentQuestion(Math.min(testResult.questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === testResult.questions.length - 1}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                Next Question
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => router.push('/scores')}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              Back to Scores
            </button>
            <button
              onClick={() => router.push(`/teacher/test-review/${testId}`)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              View All Students
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 