'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { UserResponse, ProfileSummaryResponse } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminUsersPage() {
    const router = useRouter();
    const { hasRole } = useAuth();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [userProfiles, setUserProfiles] = useState<Record<string, ProfileSummaryResponse>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loadingPagesRef = useRef<Set<number>>(new Set());



    useEffect(() => {
        // Prevent duplicate requests for the same page
        if (loadingPagesRef.current.has(page)) {
            return;
        }

        const loadUsers = async () => {
            loadingPagesRef.current.add(page);

            try {
                setLoading(true);
                setError('');

                // Load users from auth server
                const usersResponse = await apiClient.getAllUsers({ page, size: 10 });
                const paginationData = usersResponse.data || usersResponse;
                const userList = paginationData.content || [];
                setUsers(prev => page === 0 ? userList : [...prev, ...userList]);
                setHasMore(paginationData.totalPages > page + 1);

                // Load all profiles from user service
                const profilesResponse = await apiClient.getAllProfiles({ page, size: 10 });
                const profilesData = profilesResponse.data || profilesResponse;
                const profilesList = profilesData.content || [];

                // Combine user and profile data
                const profiles: Record<string, ProfileSummaryResponse> = {};
                profilesList.forEach((profile: ProfileSummaryResponse) => {
                    profiles[profile.userId] = profile;
                });

                // For users without profiles, try to load individual profiles
                for (const user of userList) {
                    if (!profiles[user.id]) {
                        try {
                            const profile = await apiClient.getUserProfile(user.id);
                            if (profile.data) {
                                profiles[user.id] = profile.data;
                            }
                        } catch (profileErr) {
                            // User might not have a profile yet, which is fine
                            console.log(`No profile found for user ${user.id}`);
                        }
                    }
                }

                setUserProfiles(prev => ({ ...prev, ...profiles }));
            } catch (err: any) {
                setError(err.message || 'Failed to load users');
                console.error('Failed to load users:', err);
            } finally {
                setLoading(false);
                loadingPagesRef.current.delete(page);
            }
        };

        loadUsers();
    }, [page]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
    };

    if (loading && page === 0) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage all users in the system</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Search Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search by name, email, or username"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-6">
                <Link href="/admin/users/create">
                    <Button className="bg-green-600 hover:bg-green-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Create New User
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {users.length > 0 ? (
                    users.map((user) => (
                        <Card key={user.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg">{user.userName}</CardTitle>
                                {userProfiles[user.id] && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {userProfiles[user.id].firstName} {userProfiles[user.id].lastName}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>{user.email}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="capitalize">{user.enabled ? 'Active' : 'Disabled'}</span>
                                        </div>

                                        {userProfiles[user.id]?.city && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{userProfiles[user.id].city}</span>
                                            </div>
                                        )}

                                        {userProfiles[user.id]?.institution && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span>{userProfiles[user.id].institution}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="capitalize">{user.roles.join(', ')}</span>
                                        </div>
                                    </div>

                                    {userProfiles[user.id] && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span className={`text-sm ${userProfiles[user.id].profileCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {userProfiles[user.id].profileCompleted ? 'Profile Complete' : 'Profile Incomplete'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-3 mt-4">
                                        {/* Account Status Controls */}
                                        <div className="flex gap-2 flex-wrap">
                                            {user.accountNonLocked ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                                    onClick={async () => {
                                                        try {
                                                            await apiClient.lockUser(user.id);
                                                            // Update user state
                                                            setUsers(prev => prev.map(u =>
                                                                u.id === user.id
                                                                    ? { ...u, accountNonLocked: false }
                                                                    : u
                                                            ));
                                                        } catch (err) {
                                                            console.error('Failed to lock user:', err);
                                                        }
                                                    }}
                                                >
                                                    Lock Account
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                                    onClick={async () => {
                                                        try {
                                                            await apiClient.unlockUser(user.id);
                                                            // Update user state
                                                            setUsers(prev => prev.map(u =>
                                                                u.id === user.id
                                                                    ? { ...u, accountNonLocked: true }
                                                                    : u
                                                            ));
                                                        } catch (err) {
                                                            console.error('Failed to unlock user:', err);
                                                        }
                                                    }}
                                                >
                                                    Unlock Account
                                                </Button>
                                            )}

                                            {user.enabled ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                                    onClick={async () => {
                                                        try {
                                                            await apiClient.disableUser(user.id);
                                                            // Update user state
                                                            setUsers(prev => prev.map(u =>
                                                                u.id === user.id
                                                                    ? { ...u, enabled: false }
                                                                    : u
                                                            ));
                                                        } catch (err) {
                                                            console.error('Failed to disable user:', err);
                                                        }
                                                    }}
                                                >
                                                    Disable
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                                    onClick={async () => {
                                                        try {
                                                            await apiClient.enableUser(user.id);
                                                            // Update user state
                                                            setUsers(prev => prev.map(u =>
                                                                u.id === user.id
                                                                    ? { ...u, enabled: true }
                                                                    : u
                                                            ));
                                                        } catch (err) {
                                                            console.error('Failed to enable user:', err);
                                                        }
                                                    }}
                                                >
                                                    Enable
                                                </Button>
                                            )}
                                        </div>

                                        {/* Role Management */}
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Roles:</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {['STUDENT', 'TEACHER', 'ADMIN'].map(role => {
                                                    const hasRole = (user.roles as string[]).includes(role);
                                                    return (
                                                        <Button
                                                            key={role}
                                                            variant="outline"
                                                            size="sm"
                                                            className={`text-xs ${
                                                                hasRole
                                                                    ? 'border-blue-300 text-blue-700 bg-blue-50'
                                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                            onClick={async () => {
                                                                try {
                                                                    if (hasRole) {
                                                                        await apiClient.removeRole(user.id, role as 'STUDENT' | 'TEACHER' | 'ADMIN');
                                                                        // Update user roles
                                                                        setUsers(prev => prev.map(u =>
                                                                            u.id === user.id
                                                                                ? { ...u, roles: (u.roles as string[]).filter(r => r !== role) as ('STUDENT' | 'TEACHER' | 'ADMIN')[] }
                                                                                : u
                                                                        ));
                                                                    } else {
                                                                        await apiClient.assignRole(user.id, role as 'STUDENT' | 'TEACHER' | 'ADMIN');
                                                                        // Update user roles
                                                                        setUsers(prev => prev.map(u =>
                                                                            u.id === user.id
                                                                                ? { ...u, roles: [...(u.roles as string[]), role] as ('STUDENT' | 'TEACHER' | 'ADMIN')[] }
                                                                                : u
                                                                        ));
                                                                    }
                                                                } catch (err) {
                                                                    console.error(`Failed to ${hasRole ? 'remove' : 'assign'} role:`, err);
                                                                }
                                                            }}
                                                        >
                                                            {role} {hasRole ? '✓' : '+'}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                                            >
                                                Edit Profile
                                            </Link>

                                            {userProfiles[user.id] && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                                    onClick={async () => {
                                                        try {
                                                            if (userProfiles[user.id].profileCompleted) {
                                                                await apiClient.deactivateProfile(user.id);
                                                            } else {
                                                                await apiClient.activateProfile(user.id);
                                                            }
                                                            // Refresh profile data
                                                            const updatedProfile = await apiClient.getUserProfile(user.id);
                                                            if (updatedProfile.data) {
                                                                setUserProfiles(prev => ({
                                                                    ...prev,
                                                                    [user.id]: updatedProfile.data
                                                                }));
                                                            }
                                                        } catch (err) {
                                                            console.error('Failed to toggle profile:', err);
                                                        }
                                                    }}
                                                >
                                                    {userProfiles[user.id].profileCompleted ? 'Deactivate' : 'Activate'} Profile
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                                onClick={async () => {
                                                    if (confirm(`Are you sure you want to delete user ${user.userName}? This action cannot be undone.`)) {
                                                        try {
                                                            await apiClient.deleteUser(user.id);
                                                            setUsers(prev => prev.filter(u => u.id !== user.id));
                                                            setUserProfiles(prev => {
                                                                const updated = { ...prev };
                                                                delete updated[user.id];
                                                                return updated;
                                                            });
                                                        } catch (err) {
                                                            console.error('Failed to delete user:', err);
                                                        }
                                                    }
                                                }}
                                            >
                                                Delete User
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 mb-4">No users found.</p>
                    </div>
                )}
            </div>

            {hasMore && (
                <div className="mt-8 text-center">
                    <Button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </DashboardLayout>
    );
}
