"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function RequireAuth({ children, role } : { children: React.ReactNode; role?: string }){
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (role && !(user.roles || []).includes(role)) {
      // unauthorized
      router.replace('/');
    }
  }, [role, router, user, loading]);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}
