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
  console.log('Starting logout process...');

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  console.log('Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

  // Perform backend logout (OAuth2 logout endpoint)
  try {
    console.log('Calling backend logout endpoint...');
    const response = await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies if any
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
      },
    });
    console.log('Backend logout response:', response.status, response.statusText);
  } catch (error) {
    console.warn('Backend logout failed:', error);
  }

  // Revoke tokens (best effort - don't fail if revocation fails)
  try {
    if (accessToken) {
      console.log('Revoking access token...');
      await revokeToken(accessToken, 'access_token');
      console.log('Access token revoked');
    }
  } catch (error) {
    console.warn('Failed to revoke access token:', error);
  }

  try {
    if (refreshToken) {
      console.log('Revoking refresh token...');
      await revokeToken(refreshToken, 'refresh_token');
      console.log('Refresh token revoked');
    }
  } catch (error) {
    console.warn('Failed to revoke refresh token:', error);
  }

  console.log('Clearing local tokens...');
  clearTokens();
  console.log('Logout process complete');
}
