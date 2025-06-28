'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';
import ProtectedRoute from '@/components/ProtectedRoute';
import Breadcrumb from '@/components/Breadcrumb';

interface Question {
  id: number;
  question: string;
  options: string[];
  score: number;
}

interface Test {
  id: number;
  name: string;
  time: number;
  total_score: number;
  questions: Question[];
}

export default function GiveTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params?.testId as string;

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<Test>(`/teacher/tests/${testId}`);
        console.log('response', response);
        setTest(response);
        setAnswers(Array(response.questions.length).fill(null));
        setTimeLeft(response.time); // Set timer in seconds
      } catch (err) {
        console.log(err);
        setError('Failed to load test.');
      } finally {
        setLoading(false);
      }
    };
    if (testId) fetchTest();
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      (async () => { await handleSubmit(true); })();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submitted]);

  // Format timer as mm:ss
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Submit test (with API integration)
  const handleSubmit = async (auto = false) => {
    if (submitting || submitted) return;
    if (!auto && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Prepare answers payload
      const payload = {
        answers: test?.questions.map((q, idx) => ({
          question_id: q.id,
          answer: answers[idx],
        }))
      };
      await apiClient.post(`/student/tests/${testId}`, payload);
      setSubmitted(true);
      router.replace(`/give-test/${testId}/submitted`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle answer selection
  const handleSelect = (option: string) => {
    setAnswers(prev => prev.map((ans, idx) => idx === current ? option : ans));
  };

  // Pagination
  const goNext = () => setCurrent((c) => Math.min(c + 1, (test?.questions.length ?? 1) - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow">{error || 'Test not found.'}</div>
      </div>
    );
  }

  const question = test.questions[current];
  const isLast = current === test.questions.length - 1;
  const isFirst = current === 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 max-w-7xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Give Test' }
            ]}
          />
        </div>

        <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl border border-gray-200 p-0 sm:p-10 min-h-[500px] flex flex-col justify-between transition-all w-full max-w-7xl mx-auto">
          {/* Score and Timer Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-0 pt-2 pb-6">
            <div className="text-lg font-semibold text-gray-700">
              Total Score: <span className="text-blue-700 font-bold">{test?.total_score ?? '--'}</span>
            </div>
            <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-mono text-xl ${timeLeft !== null && timeLeft <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="px-4 sm:px-0">
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight text-center drop-shadow-sm">{test.name}</h1>
            <div className="mb-6 text-gray-500 text-center text-base">Question {current + 1} of {test.questions.length}</div>

            <div className="mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-6 text-left">{question.question}</div>
              <div className="space-y-4">
                {question.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`block w-full p-4 border-2 rounded-xl cursor-pointer font-medium text-base transition-all
                      ${answers[current] === option
                        ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-md'
                        : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50'}
                      focus-within:ring-2 focus-within:ring-blue-400
                    `}
                    tabIndex={0}
                  >
                    <input
                      type="radio"
                      name={`question-${current}`}
                      value={option}
                      checked={answers[current] === option}
                      onChange={() => handleSelect(option)}
                      className="mr-3 accent-blue-600 scale-125 align-middle focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="align-middle select-none">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Bar */}
          <div className="flex flex-col gap-4 mt-8 px-4 sm:px-0">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {test.questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base transition-all
                    ${current === idx
                      ? 'bg-blue-600 border-blue-700 text-white shadow-lg'
                      : answers[idx]
                        ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-blue-100 hover:border-blue-400'}
                  `}
                  aria-label={`Go to question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={isFirst}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 font-semibold transition-colors"
              >
                Previous
              </button>
              {!isLast ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={answers[current] == null}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={answers[current] == null || submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors shadow cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
              )}
            </div>

            {/* {submitted && (
              <div className="mt-8 p-4 bg-green-100 text-green-700 rounded text-center text-lg font-semibold shadow">
                Test submitted! Thank you for your responses.<br />
                {autoSubmitted && (
                  <span className="block text-red-600 font-bold mt-2">Time is up! Your test was auto-submitted.</span>
                )}
              </div>
            )} */}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
              <div className="text-2xl font-bold text-gray-900 mb-4">Submit Test?</div>
              <div className="text-gray-700 mb-6">Are you sure you want to submit your test? You won&apos;t be able to change your answers after this.</div>
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  onClick={() => handleSubmit()}
                >
                  Yes, Submit
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error message for submit */}
        {submitError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-center text-base font-semibold shadow">
            {submitError}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 