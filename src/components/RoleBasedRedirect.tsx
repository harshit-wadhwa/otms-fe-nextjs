'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export default function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading or not authenticated
    if (isLoading || !isAuthenticated) {
      return;
    }

    console.log('RoleBasedRedirect: Checking redirects for', { pathname, userRole: user?.role });

    // Define public paths that don't need role-based redirects
    const publicPaths = ['/login', '/'];
    
    // If we're on a public path, redirect based on role
    if (publicPaths.includes(pathname)) {
      if (user?.role === 'student') {
        console.log('RoleBasedRedirect: Redirecting student to /student/dashboard');
        router.replace('/student/dashboard');
      } else if (user?.role === 'teacher' || user?.role === 'admin') {
        console.log('RoleBasedRedirect: Redirecting teacher/admin to /dashboard');
        router.replace('/dashboard');
      }
      return;
    }

    // Check if user is accessing the wrong dashboard
    if (user?.role === 'student' && pathname.startsWith('/dashboard') && pathname !== '/student/dashboard') {
      console.log('RoleBasedRedirect: Student accessing teacher dashboard, redirecting to /student/dashboard');
      router.replace('/student/dashboard');
      return;
    }

    if ((user?.role === 'teacher' || user?.role === 'admin') && pathname.startsWith('/student/dashboard')) {
      console.log('RoleBasedRedirect: Teacher/admin accessing student dashboard, redirecting to /dashboard');
      router.replace('/dashboard');
      return;
    }

    // For other protected routes, ensure user has appropriate access
    // Students can access student-specific routes and shared routes
    if (user?.role === 'student') {
      const studentAllowedPaths = [
        '/student/dashboard',
        '/student/tests',
        '/give-test',
        '/scores',
        '/login'
      ];
      
      const isAllowed = studentAllowedPaths.some(path => 
        pathname.startsWith(path) || pathname === path
      );
      
      if (!isAllowed) {
        router.replace('/student/dashboard');
        return;
      }
    }

    // Teachers/Admins can access teacher-specific routes and shared routes
    if (user?.role === 'teacher' || user?.role === 'admin') {
      const teacherAllowedPaths = [
        '/dashboard',
        '/add-test',
        '/tests',
        '/add-student',
        '/assign-test',
        '/scores',
        '/login'
      ];
      
      const isAllowed = teacherAllowedPaths.some(path => 
        pathname.startsWith(path) || pathname === path
      );
      
      if (!isAllowed) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  // Show loading while checking authentication and redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 