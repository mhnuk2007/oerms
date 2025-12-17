'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    BookOpen,
    FileQuestion,
    Users,
    Settings,
    GraduationCap,
    ClipboardList,
    BarChart,
    LogOut,
    Menu,
    Clock,
    CheckCircle2,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, hasRole } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    // Common links
    const links = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard
        },
    ];

    // Admin Links
    if (hasRole('ADMIN')) {
        links.push(
            { label: 'Users', href: '/admin/users', icon: Users },
            { label: 'Exams', href: '/admin/exams', icon: BookOpen },
            { label: 'All Results', href: '/results', icon: GraduationCap },
            { label: 'All Attempts', href: '/dashboard/attempts', icon: ClipboardList },
            { label: 'System Health', href: '/dashboard/admin', icon: BarChart }
        );
    }

    // Teacher Links
    if (hasRole('TEACHER')) {
        links.push(
            { label: 'My Exams', href: '/dashboard/exams', icon: BookOpen },
            { label: 'Question Bank', href: '/questions', icon: FileQuestion },
            { label: 'Student Attempts', href: '/dashboard/attempts', icon: ClipboardList },
            { label: 'All Results', href: '/results', icon: GraduationCap },
            { label: 'Pending Grading', href: '/dashboard/grading', icon: CheckCircle2 },
            { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp }
        );
    }

    // Student Links
    if (hasRole('STUDENT')) {
        links.push(
            { label: 'Available Exams', href: '/exams/published', icon: BookOpen },
            { label: 'My Attempts', href: '/dashboard/attempts', icon: Clock },
            { label: 'My Results', href: '/results', icon: GraduationCap }
        );
    }

    // Profile/Settings always at bottom logic or here
    links.push({ label: 'Profile', href: '/profile', icon: Users });

    return (
        <div className={cn("flex flex-col h-screen bg-slate-900 text-white transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
            {/* Brand */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                {!collapsed && <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">OERMS</span>}
                <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-slate-800 text-slate-300 dark:text-slate-300">
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white dark:text-slate-300"
                            )}
                            title={collapsed ? link.label : undefined}
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(link.href);
                            }}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>{link.label}</span>}
                            {collapsed && isActive && (
                                <div className="absolute left-16 w-2 h-2 rounded-full bg-blue-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-700">
                <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.username}</p>
                            <p className="text-xs text-slate-300 dark:text-slate-300 truncate">{user?.roles?.[0] || 'User'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
