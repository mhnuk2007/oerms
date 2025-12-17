'use client';

import { ReactNode } from 'react';
import { usePolicy } from '@/hooks/usePolicy';

interface PolicyGateProps {
    children: ReactNode;
    action: string;
    resource: string;
    context?: Record<string, any>;
    fallback?: ReactNode;
    loadingComponent?: ReactNode;
}

export function PolicyGate({
    children,
    action,
    resource,
    context,
    fallback = null,
    loadingComponent = null
}: PolicyGateProps) {
    const { allowed, loading, error } = usePolicy(action, resource, context);

    if (loading) {
        return <>{loadingComponent}</>;
    }

    if (error) {
        console.warn(`PolicyGate error for ${action} on ${resource}:`, error);
        // In case of error, we default to fallback (deny) for security
        return <>{fallback}</>;
    }

    return allowed ? <>{children}</> : <>{fallback}</>;
}
