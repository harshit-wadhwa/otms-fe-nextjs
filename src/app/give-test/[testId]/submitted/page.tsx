'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TestSubmittedPage() {
  const params = useParams();
  const testId = params?.testId as string;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 max-w-md w-full flex flex-col items-center">
        <div className="text-green-600 text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Submitted!</h1>
        <p className="text-gray-700 mb-6 text-center">Thank you for submitting your test.<br />Your responses have been recorded.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/student/dashboard"
            className="px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors cursor-pointer text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href={`/test-review/${testId}`}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer text-center"
          >
            Review Test Results
          </Link>
        </div>
      </div>
    </div>
  );
} 