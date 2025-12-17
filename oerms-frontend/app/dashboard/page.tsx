'use client';

import { useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, hasRole } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  const isStudent = hasRole('STUDENT');
  const isTeacher = hasRole('TEACHER');
  const isAdmin = hasRole('ADMIN');

  // Redirect to role-specific dashboard pages
  if (isStudent) {
    redirect('/dashboard/student');
  } else if (isTeacher) {
    redirect('/dashboard/teacher');
  } else if (isAdmin) {
    redirect('/dashboard/admin');
  }

  // Fallback for users with no specific role
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.firstName || user?.username}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          General Dashboard
        </p>
      </div>
    </DashboardLayout>
  );
}
