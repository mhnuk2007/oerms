'use client';

import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function TopBar() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        console.log('TopBar logout button clicked');
        try {
            await logout();
            console.log('TopBar logout completed');
        } catch (error) {
            console.error('TopBar logout failed:', error);
        }
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
            {/* Search */}
            <div className="w-96 hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-700 dark:text-gray-300 touch-target-ensure">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                </Button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                    Log out
                </Button>
            </div>
        </header>
    );
}
