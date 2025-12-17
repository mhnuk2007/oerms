'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Logout page - accessible at http://localhost:3000/logout
 * Automatically triggers the logout flow when visited
 */
export default function LogoutPage() {
    const { logout, isAuthenticated, isLoading } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const performLogout = async () => {
            if (loggingOut) return; // Prevent multiple logout attempts

            setLoggingOut(true);

            try {
                // Always attempt logout, regardless of current authentication state
                await logout();
            } catch (error) {
                console.error('Logout error:', error);
                // Force redirect even if logout fails
            } finally {
                // Always redirect after logout attempt
                window.location.href = '/login?logged_out=true';
            }
        };

        // Only run if we haven't started logging out yet
        if (!loggingOut && !isLoading) {
            performLogout();
        }
    }, [logout, loggingOut, isLoading]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Signing you out...</p>
            </div>
        </div>
    );
}
