'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { ProfileUpdateRequest } from '@/lib/types';

export default function ProfileUpdate() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile, uploadPicture } = useProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleProfileSubmit = async (data: ProfileUpdateRequest) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (pendingFile) {
        await uploadPicture(pendingFile);
      }
      await updateProfile(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePictureUpload = async (file: File) => {
    setIsUploading(true);

    try {
      await uploadPicture(file);
      // Clear pending file if it was uploaded directly
      setPendingFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setPendingFile(file);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="mt-2 text-gray-600">
          Please provide your information to get started with OERMS
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-8">
            <AvatarUploader
              currentAvatar={profile?.profilePictureUrl}
              onUpload={handlePictureUpload}
              isLoading={isUploading}
              onFileSelect={handleFileSelect}
            />

            <hr className="border-gray-200" />

            <ProfileForm
              initialData={profile || undefined}
              onSubmit={handleProfileSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
