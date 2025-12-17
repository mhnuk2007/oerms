'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function PostLogin() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, isProfileComplete, error: profileError } = useProfile();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for auth to complete loading
    if (authLoading) return;

    // If not authenticated after loading, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Wait for profile to load
    if (profileLoading) return;

    // Prevent multiple redirects
    if (isRedirecting) return;

    setIsRedirecting(true);

    // Check profile status
    const profileComplete = profile && isProfileComplete();

    // Debug logging
    console.log('Post-login redirect check:', {
      hasProfile: !!profile,
      profileComplete,
      profileError: profileError?.message,
      userRoles: user?.roles,
    });

    // If profile doesn't exist, has error, or is incomplete → redirect to profile update
    // This handles first-time login after registration
    if (!profile || profileError || !profileComplete) {
      console.log('Redirecting to profile update (incomplete profile)');
      router.push('/profile/update');
      return;
    }

    // Profile is complete → role-based dashboard redirection
    const userRoles = user?.roles || [];
    console.log('Redirecting to dashboard based on role:', userRoles);

    if (userRoles.includes('ADMIN')) {
      router.push('/admin');
    } else if (userRoles.includes('TEACHER')) {
      router.push('/dashboard');
    } else if (userRoles.includes('STUDENT')) {
      router.push('/dashboard');
    } else {
      // Fallback to general dashboard
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, profileLoading, profile, isProfileComplete, profileError, user, router, isRedirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 font-medium">
          Setting up your session...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  );
}

