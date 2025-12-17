
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { getCurrentUser, logout as authLogout, isAuthenticated as authIsAuthenticated } from '@/lib/auth';
import type { UserInfo } from '@/lib/oauth2';

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await authIsAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const userInfo = await getCurrentUser();
          setUser(userInfo);
        }
      } catch (error) {
        console.log('User not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = () => {
    window.location.href = '/login';
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear state and redirect, even if logout API calls fail
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login?logged_out=true';
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const getDisplayName = (): string => {
    if (!user) return 'Guest';
    return user.username || user.email || 'User';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    login,
    logout,
    getDisplayName,
  };
}

// Default export for compatibility
export default useAuth;
