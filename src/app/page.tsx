'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  console.log('thiss', user, isAuthenticated, isLoading);

  // Redirect authenticated users to dashboard or student dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to OTMS
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Order Tracking Management System
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Please sign in to continue
          </h2>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Getting Started
          </h3>
          <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)] space-y-2">
            <li className="tracking-[-.01em]">
              Sign in to your account at{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                /login
              </Link>
            </li>
            <li className="tracking-[-.01em]">
              Enter your credentials to access the system
            </li>
            <li className="tracking-[-.01em]">
              Access your dashboard to manage orders
            </li>
          </ol>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600">
        <span>OTMS - Order Tracking Management System</span>
        <span>•</span>
        <span>Powered by Next.js & FastAPI</span>
      </footer>
    </div>
  );
}
