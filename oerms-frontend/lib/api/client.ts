// lib/api/client.ts - Base API client with Bearer token authentication

import { ApiError } from './errors';

// Use relative URLs to go through Next.js proxy
const BASE_URL = '';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Import auth functions
const getAuth = async () => {
  if (typeof window === 'undefined') return null;
  try {
    // Import dynamically to avoid circular dependency
    const auth = await import('../auth');
    return auth;
  } catch {
    return null;
  }
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestInit, isRetry = false): Promise<T> {
    const auth = await getAuth();
    const token = await auth?.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
      ...(options?.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

      if (response.status === 401 && !isRetry) {
        // Token might be expired, get a fresh one and retry
        const freshToken = await auth?.getAccessToken();
        if (freshToken && freshToken !== token) {
          // We got a fresh token, retry the request
          return this.request<T>(path, options, true);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw ApiError.fromResponse(response, errorData);
      }

      const result: ApiResponse<T> = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError || error instanceof Error) {
        throw ApiError.fromNetworkError(error);
      }
      throw new ApiError('An unexpected error occurred', 0);
    }
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient(BASE_URL);
