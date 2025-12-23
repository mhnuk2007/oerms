"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generatePKCE, generateState, getAuthorizationUrl } from '@/lib/oauth2';
import { Button } from '@/components/ui/Button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters in URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        case 'state_mismatch':
          setError('Security check failed. Please clear your browser cookies and try again.');
          break;
        case 'missing_code':
          setError('Authorization code missing. Please try logging in again.');
          break;
        case 'access_denied':
          setError('Access denied. You may not have permission to access this application.');
          break;
        case 'invalid_request':
          setError('Invalid authentication request. Please try again.');
          break;
        case 'unauthorized_client':
          setError('Unauthorized client. Please contact support.');
          break;
        case 'unsupported_response_type':
          setError('Unsupported response type. Please contact support.');
          break;
        case 'invalid_scope':
          setError('Invalid scope requested. Please contact support.');
          break;
        case 'server_error':
          setError('Server error occurred. Please try again later.');
          break;
        case 'temporarily_unavailable':
          setError('Service temporarily unavailable. Please try again later.');
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
    }

    // Check if already logged in by making a test request
    // If we have valid cookies, this will succeed
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };

    checkAuth();
  }, [router, searchParams]);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      // Generate PKCE parameters
      const { verifier, challenge } = generatePKCE();
      const state = generateState();

      // Store PKCE verifier and state for callback
      sessionStorage.setItem('pkce_verifier', verifier);
      sessionStorage.setItem('oauth_state', state);

      // Redirect to authorization server
      const authUrl = getAuthorizationUrl(state, challenge);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login setup failed:', error);
      alert('Failed to start login process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">O</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your OERMS account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6"
            >
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="font-medium">Authentication Error</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <Button
              onClick={handleLogin}
              isLoading={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white font-semibold py-3 h-auto"
              size="lg"
              aria-label={isLoading ? 'Signing in, redirecting' : 'Sign in with OERMS'}
              aria-disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Redirecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In with OERMS
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Secure authentication</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Protected by enterprise-grade security</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              SSL Encrypted
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              OAuth 2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Welcome to OERMS</h2>
            <p className="mt-2 text-sm text-slate-600">
              Online Examination and Result Management System
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
