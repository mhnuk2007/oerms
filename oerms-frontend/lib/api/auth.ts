// lib/api/auth.ts - Authentication service

import { apiClient } from './client';
import type { UserResponse, RegisterRequest } from '@/lib/types';

export const authService = {
  /**
   * Get current authenticated user info
   */
  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/api/auth/me');
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<{ user: UserResponse; redirectUrl: string }> {
    return apiClient.post<{ user: UserResponse; redirectUrl: string }>('/api/auth/register', data);
  },

  /**
   * Assign role to user (Admin only)
   */
  async assignRole(userId: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<UserResponse> {
    return apiClient.post<UserResponse>(`/api/auth/roles/${userId}/assign/${role}`);
  },

  /**
   * Remove role from user (Admin only)
   */
  async removeRole(userId: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<UserResponse> {
    return apiClient.delete<UserResponse>(`/api/auth/roles/${userId}/remove/${role}`);
  },

  /**
   * Get user by ID (Admin only)
   * Uses /api/admin/users/{id} endpoint
   */
  async getUser(userId: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/api/admin/users/${userId}`);
  },

  /**
   * Get all users (Admin only)
   * Uses /api/admin/users endpoint
   */
  async getAllUsers(params?: { page?: number; size?: number; sortBy?: string; sortDir?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    return apiClient.get(`/api/admin/users?${queryParams.toString()}`);
  },

  /**
   * Delete user (Admin only)
   * Uses /api/admin/users/{id} endpoint
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/admin/users/${userId}`);
  },

  /**
   * Enable user account (Admin only)
   * Uses /api/admin/users/{id}/enable endpoint
   */
  async enableUser(userId: string): Promise<UserResponse> {
    return apiClient.put<UserResponse>(`/api/admin/users/${userId}/enable`);
  },

  /**
   * Disable user account (Admin only)
   * Uses /api/admin/users/{id}/disable endpoint
   */
  async disableUser(userId: string): Promise<UserResponse> {
    return apiClient.put<UserResponse>(`/api/admin/users/${userId}/disable`);
  },

  /**
   * Lock user account (Admin only)
   * Uses /api/admin/users/{id}/lock endpoint
   */
  async lockUser(userId: string): Promise<UserResponse> {
    return apiClient.put<UserResponse>(`/api/admin/users/${userId}/lock`);
  },

  /**
   * Unlock user account (Admin only)
   * Uses /api/admin/users/{id}/unlock endpoint
   */
  async unlockUser(userId: string): Promise<UserResponse> {
    return apiClient.put<UserResponse>(`/api/admin/users/${userId}/unlock`);
  }
};
