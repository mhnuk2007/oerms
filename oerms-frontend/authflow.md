# Complete OAuth2 Authorization Code Flow Setup

## 📋 Table of Contents
1. [Spring Boot Auth Server Setup](#spring-boot-auth-server)
2. [Next.js Client Setup](#nextjs-client-setup)
3. [Testing Guide](#testing-guide)
4. [Deployment Configuration](#deployment-configuration)

---

## 🔧 Spring Boot Auth Server Setup

### 1. SecurityConfig.java (Complete - No Changes Needed)

Your existing `SecurityConfig.java` is already perfect for this setup. Keep it as-is!

Key points it already handles:
- ✅ Authorization Code grant type with PKCE
- ✅ Refresh token support
- ✅ OIDC endpoints
- ✅ JWT token customization
- ✅ Multiple clients (web, Next.js, M2M)

### 2. Create Custom Login Controller

**src/main/java/com/oerms/auth/controller/LoginController.java:**

```java
package com.oerms.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
```

### 3. Create Custom Login Page (Thymeleaf Template)

**src/main/resources/templates/login.html:**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - OERMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <!-- Main Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <!-- Logo and Header -->
            <div class="text-center">
                <div class="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-900">OERMS</h1>
                <p class="mt-2 text-sm text-gray-600">Online Examination & Result Management</p>
            </div>

            <!-- Error Message -->
            <div th:if="${param.error}" 
                 class="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded">
                <div class="flex">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm">Invalid email or password. Please try again.</span>
                </div>
            </div>

            <!-- Logout Success Message -->
            <div th:if="${param.logout}" 
                 class="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded">
                <div class="flex">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm">You have been successfully logged out.</span>
                </div>
            </div>

            <!-- Login Form -->
            <form method="post" th:action="@{/login}" class="space-y-5">
                <input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}"/>
                
                <!-- Email Field -->
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                            </svg>
                        </div>
                        <input id="username" 
                               name="username" 
                               type="email" 
                               autocomplete="email"
                               required
                               placeholder="you@example.com"
                               class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>

                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <input id="password" 
                               name="password" 
                               type="password" 
                               autocomplete="current-password"
                               required
                               placeholder="••••••••"
                               class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input id="remember-me" 
                               name="remember-me" 
                               type="checkbox"
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer">
                        <label for="remember-me" class="ml-2 block text-sm text-gray-700 cursor-pointer">
                            Remember me
                        </label>
                    </div>
                    <div class="text-sm">
                        <a th:href="@{__${@environment.getProperty('app.frontend-url')}__/forgot-password}" 
                           class="font-medium text-blue-600 hover:text-blue-500 transition">
                            Forgot password?
                        </a>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit"
                        class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition transform hover:scale-[1.02] active:scale-[0.98]">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    Sign In
                </button>
            </form>

            <!-- Divider -->
            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">New to OERMS?</span>
                </div>
            </div>

            <!-- Sign Up Link -->
            <div class="text-center">
                <a th:href="@{__${@environment.getProperty('app.frontend-url')}__/register}" 
                   class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition">
                    Create an account
                    <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 text-center text-sm text-gray-600">
            <p>&copy; 2024 OERMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### 4. Update application.yml

**src/main/resources/application.yml:**

```yaml
spring:
  application:
    name: auth-server
  
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_auth
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

  # Thymeleaf configuration for login page
  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html
    mode: HTML
    cache: false

server:
  port: 9000

app:
  gateway-url: ${GATEWAY_URL:http://localhost:8080}
  frontend-url: ${FRONTEND_URL:http://localhost:3000}

logging:
  level:
    org.springframework.security: DEBUG
    com.oerms.auth: DEBUG
```

### 5. Add Thymeleaf Dependency (if not already present)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

---

## 🎨 Next.js Client Setup

### 1. Install Dependencies

```bash
npm install jose
```

### 2. Create OAuth2 Utility

**lib/oauth2.ts:**

```typescript
import { randomBytes, createHash } from 'crypto';

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:8080';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || 'oerms-nextjs-client';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback';

export interface PKCEParams {
  verifier: string;
  challenge: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface UserInfo {
  sub: string;
  userId: string;
  email: string;
  username: string;
  roles: string[];
  authorities: string[];
}

/**
 * Generate PKCE code verifier and challenge for secure authorization
 */
export function generatePKCE(): PKCEParams {
  // Generate random verifier (43-128 characters)
  const verifier = randomBytes(32).toString('base64url');
  
  // Create SHA256 hash of verifier
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64url');
  
  return { verifier, challenge };
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  return randomBytes(16).toString('base64url');
}

/**
 * Build OAuth2 authorization URL
 */
export function getAuthorizationUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email read write offline_access',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${AUTH_SERVER_URL}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string, 
  codeVerifier: string
): Promise<TokenResponse> {
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
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Token exchange failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
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
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Token refresh failed: ${error.error_description || error.error || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Decode JWT token and extract user information
 * Note: This is client-side decoding for display purposes only
 * Always verify tokens on the server!
 */
export function decodeToken(token: string): UserInfo | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Revoke (logout) tokens
 */
export async function revokeToken(token: string, tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
  try {
    await fetch(`${AUTH_SERVER_URL}/oauth2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: token,
        token_type_hint: tokenTypeHint,
        client_id: CLIENT_ID,
      }),
    });
  } catch (error) {
    console.error('Token revocation failed:', error);
    // Don't throw - best effort revocation
  }
}
```

### 3. Create Auth Utilities

**lib/auth.ts:**

```typescript
import { refreshAccessToken, decodeToken, revokeToken, type UserInfo } from './oauth2';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_AT_KEY = 'token_expires_at';

/**
 * Store tokens in localStorage
 */
export function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(
    EXPIRES_AT_KEY,
    String(Date.now() + expiresIn * 1000)
  );
}

/**
 * Get access token, refreshing if necessary
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  // Check if token is expired (with 5 minute buffer)
  if (expiresAt && Date.now() >= parseInt(expiresAt) - 5 * 60 * 1000) {
    if (refreshToken) {
      try {
        const tokens = await refreshAccessToken(refreshToken);
        storeTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
        accessToken = tokens.access_token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        clearTokens();
        return null;
      }
    } else {
      clearTokens();
      return null;
    }
  }

  return accessToken;
}

/**
 * Get current user info from token
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

/**
 * Clear all stored tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  // Revoke tokens (best effort)
  if (accessToken) {
    await revokeToken(accessToken, 'access_token');
  }
  if (refreshToken) {
    await revokeToken(refreshToken, 'refresh_token');
  }
  
  clearTokens();
}
```

### 4. Create API Client

**lib/api.ts:**

```typescript
import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  return response;
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint);
  return response.json();
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json();
}

/**
 * PUT request helper
 */
export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return response.json();
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'DELETE',
  });
  return response.json();
}
```

### 5. Create Login Page

**app/login/page.tsx:**

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generatePKCE, generateState, getAuthorizationUrl } from '@/lib/oauth2';
import { isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    isAuthenticated().then(authenticated => {
      if (authenticated) {
        router.push('/dashboard');
      }
    });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to OERMS</h1>
            <p className="mt-2 text-sm text-gray-600">
              Online Examination & Result Management System
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Create and manage exams online
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Automated grading and results
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure and reliable platform
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In with OERMS
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to OERMS?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <a
              href="/register"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition"
            >
              Create an account
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>&copy; 2024 OERMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
```

### 6. Create Callback Page

**app/auth/callback/page.tsx:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens } from '@/lib/oauth2';
import { storeTokens } from '@/lib/auth';

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
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(`Authentication failed: ${errorDescription || errorParam}`);
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

        // Store tokens
        storeTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);

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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
```

### 7. Create Protected Dashboard

**app/dashboard/page.tsx:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import type { UserInfo } from '@/lib/oauth2';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(userInfo => {
        if (!userInfo) {
          router.push('/login');
        } else {
          setUser(userInfo);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">OERMS Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {user.username}!
          </h2>
          <p className="text-gray-600">{user.email}</p>
          
          {/* User Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-sm text-gray-900">{user.userId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Roles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.roles.map(role => (
                  <span
                    key={role}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                  >
                    {role.replace('ROLE_', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exams</h3>
            <p className="text-gray-600 text-sm">Create and manage your exams</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Results</h3>
            <p className="text-gray-600 text-sm">View and analyze exam results</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600 text-sm">Manage student accounts</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 8. Environment Variables

**.env.local:**

```bash
NEXT_PUBLIC_AUTH_SERVER_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CLIENT_ID=oerms-nextjs-client
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## 🧪 Testing Guide

### 1. Start Spring Boot Auth Server

```bash
cd auth-server
mvn spring-boot:run
```

Verify it's running:
- http://localhost:8080/actuator/health
- http://localhost:8080/.well-known/openid-configuration

### 2. Start Next.js Application

```bash
cd nextjs-app
npm run dev
```

### 3. Test Authentication Flow

1. **Navigate to login**: http://localhost:3000/login
2. **Click "Sign In"**: Redirects to http://localhost:8080/login
3. **Enter credentials** on Spring's login page
4. **Submit**: Redirects back to http://localhost:3000/auth/callback
5. **View dashboard**: http://localhost:3000/dashboard

### 4. Test Token Refresh

```javascript
// In browser console on dashboard
localStorage.getItem('access_token');
// Wait for expiry or manually trigger refresh
```

### 5. Test Logout

Click logout button and verify:
- Tokens cleared from localStorage
- Redirected to login page
- Cannot access dashboard without re-authentication

---

## 🚀 Deployment Configuration

### Production Environment Variables

**Spring (application-prod.yml):**

```yaml
app:
  gateway-url: https://api.yourdomain.com
  frontend-url: https://app.yourdomain.com

server:
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${KEYSTORE_PASSWORD}
    key-store-type: PKCS12
```

**Next.js (.env.production):**

```bash
NEXT_PUBLIC_AUTH_SERVER_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_CLIENT_ID=oerms-nextjs-client
NEXT_PUBLIC_REDIRECT_URI=https://app.yourdomain.com/auth/callback
```

### CORS Configuration (if needed)

**Add to SecurityConfig.java:**

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(frontendUrl));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 📝 Summary

This complete setup provides:

✅ **Secure OAuth2 Authorization Code Flow with PKCE**
✅ **Beautiful branded login page**
✅ **Automatic token refresh**
✅ **Protected routes in Next.js**
✅ **Clean separation of concerns**
✅ **Production-ready architecture**
✅ **Zero custom authentication logic**

You now have a fully functional, secure, and maintainable authentication system! 🎉