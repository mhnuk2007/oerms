# Standard OAuth2 Authorization Code Flow Implementation

## Architecture Overview

```
User → Next.js → Spring Auth Server (Login) → Next.js Callback → Tokens
```

## Step 1: Keep Your Existing SecurityConfig

Your current `SecurityConfig.java` already supports this perfectly. No changes needed!

The `oerms-nextjs-client` is already configured with:
- ✅ Authorization Code grant type
- ✅ PKCE required
- ✅ Proper redirect URIs
- ✅ Refresh token support

## Step 2: Customize Spring Login Page (Optional but Recommended)

Create a branded login page that matches your Next.js UI:

**src/main/resources/templates/login.html:**
```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - OERMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <!-- Logo -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">OERMS</h2>
            <p class="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <!-- Error Message -->
        <div th:if="${param.error}" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Invalid email or password
        </div>

        <!-- Login Form -->
        <form class="mt-8 space-y-6" method="post" th:action="@{/login}">
            <input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}"/>
            
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Email</label>
                <input id="username" name="username" type="email" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox"
                           class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>

                <div class="text-sm">
                    <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                        Forgot password?
                    </a>
                </div>
            </div>

            <button type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign in
            </button>
        </form>

        <div class="text-center">
            <p class="text-sm text-gray-600">
                Don't have an account?
                <a href="http://localhost:3000/register" class="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                </a>
            </p>
        </div>
    </div>
</body>
</html>
```

## Step 3: Next.js OAuth2 Client Implementation

**lib/oauth2.ts:**
```typescript
import { randomBytes, createHash } from 'crypto';

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:8080';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || 'oerms-nextjs-client';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// Generate PKCE code verifier and challenge
export function generatePKCE() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64url');
  
  return { verifier, challenge };
}

// Generate random state for CSRF protection
export function generateState(): string {
  return randomBytes(16).toString('base64url');
}

// Build authorization URL
export function getAuthorizationUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email read write',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${AUTH_SERVER_URL}/oauth2/authorize?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const response = await fetch(`${AUTH_SERVER_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${AUTH_SERVER_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}
```

**app/login/page.tsx:**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generatePKCE, generateState, getAuthorizationUrl } from '@/lib/oauth2';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const handleLogin = () => {
    // Generate PKCE parameters
    const { verifier, challenge } = generatePKCE();
    const state = generateState();

    // Store PKCE verifier and state for callback
    sessionStorage.setItem('pkce_verifier', verifier);
    sessionStorage.setItem('oauth_state', state);

    // Redirect to authorization server
    const authUrl = getAuthorizationUrl(state, challenge);
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to OERMS</h2>
          <p className="mt-2 text-sm text-gray-600">
            Online Examination and Result Management System
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign In
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**app/auth/callback/page.tsx:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens } from '@/lib/oauth2';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Authentication failed: ${errorParam}`);
          return;
        }

        if (!code || !state) {
          setError('Invalid callback parameters');
          return;
        }

        // Verify state (CSRF protection)
        const storedState = sessionStorage.getItem('oauth_state');
        if (state !== storedState) {
          setError('State mismatch - possible CSRF attack');
          return;
        }

        // Get PKCE verifier
        const verifier = sessionStorage.getItem('pkce_verifier');
        if (!verifier) {
          setError('PKCE verifier not found');
          return;
        }

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code, verifier);

        // Store tokens securely
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('token_expires_at', 
          String(Date.now() + tokens.expires_in * 1000));

        // Clean up session storage
        sessionStorage.removeItem('pkce_verifier');
        sessionStorage.removeItem('oauth_state');

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
```

## Step 4: API Route for Authenticated Requests

**lib/api.ts:**
```typescript
import { refreshAccessToken } from './oauth2';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('token_expires_at');

  // Refresh token if expired
  if (expiresAt && Date.now() >= parseInt(expiresAt)) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('token_expires_at', 
        String(Date.now() + tokens.expires_in * 1000));
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
    }
  }

  // Make authenticated request
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response;
}
```

## Benefits of This Approach

✅ **Security:**
- Passwords never leave the auth server
- PKCE prevents authorization code interception
- State parameter prevents CSRF attacks
- Refresh tokens for long-lived sessions

✅ **Future-Proof:**
- Add MFA: Just enable it in Spring - no Next.js changes
- Add social login: Configure Spring - works immediately
- Add SSO: Spring handles it transparently

✅ **Standards Compliant:**
- 100% OAuth 2.1 compatible
- Works with any OAuth2 library
- Industry best practices

✅ **Maintainable:**
- No custom authentication logic
- Relies on Spring's tested implementation
- Clear separation of concerns

✅ **User Experience:**
- Branded login page
- Smooth redirect flow
- Remember me functionality
- Forgot password support

## Environment Variables

**.env.local:**
```bash
NEXT_PUBLIC_AUTH_SERVER_URL=http://localhost:8080
NEXT_PUBLIC_CLIENT_ID=oerms-nextjs-client
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
```

**application.yml (Spring):**
```yaml
app:
  gateway-url: http://localhost:8080
  frontend-url: http://localhost:3000
```

## Testing the Flow

1. User visits `/login` in Next.js
2. Clicks "Sign In" → redirected to Spring's branded login page
3. Enters credentials on Spring's page
4. Spring validates and redirects back to `/auth/callback?code=xxx`
5. Next.js exchanges code for tokens
6. User is logged in and redirected to dashboard

Total time: ~2-3 seconds (imperceptible to users)