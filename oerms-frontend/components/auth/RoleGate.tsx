'use client';

import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleGateProps {
  children: ReactNode;
  roles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function RoleGate({
  children,
  roles = [],
  requireAll = false,
  fallback = null,
}: RoleGateProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (roles.length === 0) {
    return <>{children}</>;
  }

  const hasRequiredRoles = requireAll
    ? roles.every(role => user.roles.includes(role))
    : roles.some(role => user.roles.includes(role));

  return hasRequiredRoles ? <>{children}</> : <>{fallback}</>;
}
