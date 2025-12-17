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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <h1 className="sr-only">Login to OERMS</h1>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Welcome to OERMS</h2>
          <p className="mt-2 text-sm text-slate-600">
            Online Examination and Result Management System
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Authentication Error:</span>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <Button
          onClick={handleLogin}
          isLoading={isLoading}
          className="w-full"
          size="lg"
          aria-label={isLoading ? 'Signing in, redirecting' : 'Sign in with OERMS'}
          aria-disabled={isLoading}
        >
          {isLoading ? 'Redirecting...' : 'Sign In with OERMS'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Sign up
            </Link>
          </p>
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
