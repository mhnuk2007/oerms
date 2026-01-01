// lib/api/user.ts - User Profile management service

import { apiClient } from './client';

// Simple type aliases to match the working pattern from auth.ts
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
};

type UserProfileDTO = {
  userId: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  institution?: string;
  profilePictureUrl?: string;
};

type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  institution?: string;
};

type InstitutionRequest = {
  institution: string;
};

type FileUploadResponse = {
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  contentType?: string;
  uploadedAt?: string;
};

type ProfileSummaryResponse = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  institution?: string;
  profileCompleted?: boolean;
};

type UserProfileStatsResponse = {
  total?: number;
  active?: number;
  completed?: number;
  incomplete?: number;
};

type PageProfileSummaryResponse = {
  totalElements?: number;
  totalPages?: number;
  size?: number;
  content?: ProfileSummaryResponse[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
};

export const userService = {
  /**
   * Get my profile
   */
  async getMyProfile(): Promise<UserProfileDTO> {
    const response = await apiClient.get<ApiResponse<UserProfileDTO>>('/api/profiles/profile/me');
    return response.data!;
  },

  /**
   * Update my profile
   */
  async updateMyProfile(data: UpdateProfileRequest): Promise<UserProfileDTO> {
    const response = await apiClient.put<ApiResponse<UserProfileDTO>>('/api/profiles/profile/me', data);
    return response.data!;
  },

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<UserProfileDTO> {
    const response = await apiClient.get<ApiResponse<UserProfileDTO>>(`/api/profiles/profile/${userId}`);
    return response.data!;
  },

  /**
   * Update my institution
   */
  async updateMyInstitution(data: InstitutionRequest): Promise<string> {
    const response = await apiClient.put<ApiResponse<string>>('/api/profiles/profile/me/institution', data);
    return response.data!;
  },

  /**
   * Remove my institution
   */
  async removeMyInstitution(): Promise<string> {
    const response = await apiClient.delete<ApiResponse<string>>('/api/profiles/profile/me/institution');
    return response.data!;
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080'}/api/profiles/profile/me/picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    return result.data;
  },

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<string> {
    const response = await apiClient.delete<ApiResponse<string>>('/api/profiles/profile/me/picture');
    return response.data!;
  },

  /**
   * Get file by filename
   */
  async getFile(filename: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<string>>(`/files/${filename}`);
    return response.data!;
  },

  /**
   * Get user profile statistics
   */
  async getStats(): Promise<UserProfileStatsResponse> {
    const response = await apiClient.get<ApiResponse<UserProfileStatsResponse>>('/api/profiles/stats');
    return response.data!;
  },

  /**
   * Get all user profiles (Admin only)
   */
  async getAllProfiles(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC'): Promise<PageProfileSummaryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    const response = await apiClient.get<ApiResponse<PageProfileSummaryResponse>>(`/api/profiles/all?${params.toString()}`);
    return response.data!;
  },

  /**
   * Search profiles (Admin only)
   */
  async searchProfiles(keyword: string, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC'): Promise<PageProfileSummaryResponse> {
    const params = new URLSearchParams({
      keyword,
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    const response = await apiClient.get<ApiResponse<PageProfileSummaryResponse>>(`/api/profiles/all/search?${params.toString()}`);
    return response.data!;
  },

  /**
   * Get profiles by institution (Admin only)
   */
  async getProfilesByInstitution(institution: string, page = 0, size = 10): Promise<PageProfileSummaryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    const response = await apiClient.get<ApiResponse<PageProfileSummaryResponse>>(`/api/profiles/all/institution/${encodeURIComponent(institution)}?${params.toString()}`);
    return response.data!;
  },

  /**
   * Get profiles by city (Admin only)
   */
  async getProfilesByCity(city: string, page = 0, size = 10): Promise<PageProfileSummaryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    const response = await apiClient.get<ApiResponse<PageProfileSummaryResponse>>(`/api/profiles/all/city/${encodeURIComponent(city)}?${params.toString()}`);
    return response.data!;
  },

  /**
   * Activate user profile
   */
  async activateProfile(userId: string): Promise<string> {
    const response = await apiClient.put<ApiResponse<string>>(`/api/profiles/${userId}/activate`);
    return response.data!;
  },

  /**
   * Deactivate user profile
   */
  async deactivateProfile(userId: string): Promise<string> {
    const response = await apiClient.put<ApiResponse<string>>(`/api/profiles/${userId}/deactivate`);
    return response.data!;
  }
};

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  try {
    // Try to get token from localStorage or wherever it's stored
    return localStorage.getItem('access_token') || '';
  } catch {
    return '';
  }
}
