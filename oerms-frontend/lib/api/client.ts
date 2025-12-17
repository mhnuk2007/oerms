// lib/api/client.ts - Base API client with Bearer token authentication

// Use relative URLs to go through Next.js proxy
const BASE_URL = '';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Import auth functions
const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  try {
    // Import dynamically to avoid circular dependency
    const { getAccessToken: getToken } = await import('../auth');
    return await getToken();
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

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle 401 (Unauthorized) - don't try to refresh since no refresh endpoint exists
      if (response.status === 401) {
        // Redirect to login on authentication failure
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }

      // Handle other errors
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      const error: ApiError = {
        message: errorData.message || `Request failed with status ${response.status}`,
        status: response.status,
        details: errorData
      };
      throw error;
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
      ...(options?.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'GET',
      headers
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
      ...(options?.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
      ...(options?.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
      ...(options?.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: 'DELETE',
      headers
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new APIClient(BASE_URL);
