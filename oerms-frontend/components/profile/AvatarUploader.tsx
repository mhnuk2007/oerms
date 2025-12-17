'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '../ui/Button';
import Image from 'next/image';

interface AvatarUploaderProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
  onFileSelect?: (file: File | null) => void;
}

export function AvatarUploader({ currentAvatar, onUpload, isLoading, onFileSelect }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentAvatar changes
  useEffect(() => {
    if (currentAvatar) {
      setPreview(currentAvatar);
    }
  }, [currentAvatar]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file?.name, file?.type, file?.size);

    if (!file) {
      console.log('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      console.log('Invalid file type:', file.type);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      console.log('File too large:', file.size);
      return;
    }

    setError('');
    setSuccess('');
    setSelectedFile(file);
    onFileSelect?.(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Preview created');
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.log('No file to upload');
      return;
    }

    console.log('Starting upload for:', selectedFile.name);
    setError('');
    setSuccess('');

    try {
      await onUpload(selectedFile);
      console.log('Upload successful');
      setSelectedFile(null);
      onFileSelect?.(null);
      setSuccess('Photo uploaded successfully!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload image');
    }
  };

  const handleClick = () => {
    console.log('Choose photo clicked');
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-100 dark:border-gray-600">
          {preview ? (
            <Image src={preview} alt="Profile preview" fill className="object-cover" sizes="128px" unoptimized />
          ) : (
            <svg className="w-16 h-16 text-gray-500 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select profile picture"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleClick} disabled={isLoading}>
              {preview ? 'Change Photo' : 'Choose Photo'}
            </Button>
            {selectedFile && (
              <Button type="button" onClick={handleUpload} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload Photo'}
              </Button>
            )}
          </div>

          {selectedFile && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              ⚠️ {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              ✓ {success}
            </p>
          )}

          <p className="text-xs text-gray-600 dark:text-gray-300">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
