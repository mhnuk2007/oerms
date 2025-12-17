'use client';

import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ProfileUpdateRequest } from '@/lib/types';

interface ProfileFormProps {
  initialData?: Partial<ProfileUpdateRequest>;
  onSubmit: (data: ProfileUpdateRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ initialData, onSubmit, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    city: initialData?.city || '',
    institution: initialData?.institution || '',
    email: initialData?.email,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          error={errors.firstName}
          required
          aria-required="true"
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          error={errors.lastName}
          required
          aria-required="true"
        />
      </div>

      <Input
        label="City"
        name="city"
        value={formData.city}
        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
        error={errors.city}
        required
        aria-required="true"
      />

      <Input
        label="Institution"
        name="institution"
        value={formData.institution}
        onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
        error={errors.institution}
        helperText="Enter your school, college, or university name"
        required
        aria-required="true"
      />

      {initialData?.email && (
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          helperText="Optional: Update your email address"
        />
      )}

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </form>
  );
}
