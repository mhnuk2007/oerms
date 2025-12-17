// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { UserProfile, ApiError } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let retries = 0;
    const maxRetries = 3;

    const fetchProfile = async () => {
      try {
        console.log('useProfile: Fetching profile data...');
        const response = await apiClient.getMyProfile();
        console.log('useProfile: Raw API response:', response);

        // Extract the data property from the API response
        const data = response?.data || response;
        console.log('useProfile: Extracted data:', data);

        setProfile(data);
        setError(null);
        console.log('useProfile: Profile state set successfully');
      } catch (err) {
        const apiError = err as ApiError;
        
        // Profile might not exist yet (404) - retry with backoff
        if (apiError.status === 404 && retries < maxRetries) {
          retries++;
          setTimeout(fetchProfile, 1000 * retries); // Exponential backoff
          return;
        }
        
        setError(apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      const updated = await apiClient.updateMyProfile(data as any);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPicture = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const result = await apiClient.uploadMyProfilePicture(file);
      setProfile(prev => prev ? { ...prev, profilePictureUrl: result.fileUrl } : null);
      return result;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const deletePicture = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await apiClient.deleteMyProfilePicture();
      setProfile(prev => prev ? { ...prev, profilePictureUrl: undefined } : null);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const updateInstitution = async (institution: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await apiClient.updateMyInstitution(institution);
      setProfile(prev => prev ? { ...prev, institution } : null);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.city &&
      profile.institution
    );
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadPicture,
    deletePicture,
    updateInstitution,
    isProfileComplete,
    refetch: () => {
      setIsLoading(true);
      // Trigger re-fetch
    },
  };
}
