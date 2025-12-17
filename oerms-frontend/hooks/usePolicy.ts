import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface UsePolicyResult {
  allowed: boolean;
  loading: boolean;
  error: string | null;
  checkPolicy: () => Promise<void>;
}

export function usePolicy(action: string, resource: string, context?: Record<string, any>): UsePolicyResult {
  const { isAuthenticated } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPolicy = useCallback(async () => {
    if (!isAuthenticated) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.evaluatePolicy({
        action,
        resource,
        context
      });
      setAllowed(response.allowed);
    } catch (err) {
      console.error('Policy evaluation failed:', err);
      setError('Failed to evaluate policy');
      setAllowed(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, action, resource, JSON.stringify(context)]);

  useEffect(() => {
    checkPolicy();
  }, [checkPolicy]);

  return { allowed, loading, error, checkPolicy };
}