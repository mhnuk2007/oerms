import { randomBytes, createHash } from 'crypto';

// Generate PKCE challenge from an existing verifier
export function generateChallengeFromVerifier(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:8080';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || 'oerms-nextjs-client';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback';

export interface UserInfo {
  sub: string;
  userId: string;
  email: string;
  username: string;
  roles: string[];
  authorities: string[];
}

// Generate PKCE code verifier and challenge
export function generatePKCE() {
  const verifier = randomBytes(32).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { verifier, challenge };
}

// Generate random state for CSRF protection
export function generateState(): string {
  return randomBytes(16).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
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
      'Origin': FRONTEND_URL,
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
    let errorMessage = `Token exchange failed with status ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = `Token exchange failed: ${error.error_description || error.error || response.statusText}`;
    } catch (parseError) {
      // If response is not JSON (e.g., HTML error page), use status text
      errorMessage = `Token exchange failed: ${response.statusText || 'Unknown error'}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${AUTH_SERVER_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': FRONTEND_URL,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Token refresh failed with status ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = `Token refresh failed: ${error.error_description || error.error || response.statusText}`;
    } catch (parseError) {
      // If response is not JSON (e.g., HTML error page), use status text
      errorMessage = `Token refresh failed: ${response.statusText || 'Unknown error'}`;
    }
    throw new Error(errorMessage);
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

    // Convert base64url to base64
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Add padding if needed
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

    const decoded = JSON.parse(
      Buffer.from(paddedBase64, 'base64').toString('utf-8')
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
        'Origin': FRONTEND_URL,
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
