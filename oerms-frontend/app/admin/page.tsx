'use client';

import { useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPanel() {
  const router = useRouter();
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !hasRole('ADMIN')) {
        router.push('/dashboard');
      } else {
        // Redirect to the new admin dashboard
        router.push('/dashboard/admin');
      }
    }
  }, [isLoading, isAuthenticated, hasRole, router]);

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}
