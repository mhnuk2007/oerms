'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useMyNotifications, useMarkAsRead, useDeleteNotification } from '@/lib/hooks/useNotifications';
import type { NotificationDTO, Pageable } from '@/lib/api/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function NotificationsPage() {
    const [pageable, setPageable] = useState<Pageable>({ page: 0, size: 10 });
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const { data: notificationsData, isLoading, error } = useMyNotifications(pageable);
    const markAsRead = useMarkAsRead();
    const deleteNotification = useDeleteNotification();

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead.mutateAsync(id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification.mutateAsync(id);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleLoadMore = () => {
        if (notificationsData && notificationsData.pageNumber !== undefined && notificationsData.totalPages !== undefined && notificationsData.pageNumber < notificationsData.totalPages - 1) {
            setPageable(prev => ({ ...prev, page: (prev.page || 0) + 1 }));
        }
    };

    const filteredNotifications = notificationsData?.content?.filter(notification => {
        if (filter === 'unread') return notification.isRead === false;
        if (filter === 'read') return notification.isRead === true;
        return true;
    }) || [];

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getNotificationTypeColor = (type: string) => {
        switch (type) {
            case 'EXAM_CREATED':
            case 'EXAM_PUBLISHED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'RESULT_PUBLISHED':
            case 'RESULT_GRADED':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'ACCOUNT_LOCKED':
            case 'ACCOUNT_UNLOCKED':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'SYSTEM_ALERT':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Stay updated with your latest activities and announcements
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'unread', 'read'] as const).map((filterType) => (
                            <Button
                                key={filterType}
                                variant={filter === filterType ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(filterType)}
                                className="capitalize"
                            >
                                {filterType}
                                {filterType === 'all' && notificationsData?.content && (
                                    <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded">
                                        {notificationsData.content.length}
                                    </span>
                                )}
                                {filterType === 'unread' && notificationsData?.content && (
                                    <span className="ml-2 bg-red-200 dark:bg-red-700 text-xs px-2 py-1 rounded">
                                        {notificationsData.content.filter(n => !n.isRead).length}
                                    </span>
                                )}
                                {filterType === 'read' && notificationsData?.content && (
                                    <span className="ml-2 bg-green-200 dark:bg-green-700 text-xs px-2 py-1 rounded">
                                        {notificationsData.content.filter(n => n.isRead).length}
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Your Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="text-red-500 mb-2">Failed to load notifications</div>
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No notifications found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {filter === 'unread'
                                        ? "You don't have any unread notifications."
                                        : filter === 'read'
                                            ? "You don't have any read notifications."
                                            : "You don't have any notifications yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredNotifications.map((notification: NotificationDTO) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border rounded-lg transition-colors ${
                                            notification.isRead
                                                ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNotificationTypeColor(notification.type || '')}`}>
                                                        {(notification.type || 'CUSTOM').replace('_', ' ').toLowerCase()}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                    {notification.title || 'Notification'}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    {notification.message || 'No message available'}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span>{notification.createdAt ? formatTime(notification.createdAt) : 'Unknown time'}</span>
                                                    {notification.actionUrl && (
                                                        <a
                                                            href={notification.actionUrl}
                                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                                                        >
                                                            View Details
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => notification.id && handleMarkAsRead(notification.id)}
                                                        disabled={markAsRead.isPending}
                                                        className="p-2 h-8 w-8 text-gray-400 hover:text-green-600"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => notification.id && handleDelete(notification.id)}
                                                    disabled={deleteNotification.isPending}
                                                    className="p-2 h-8 w-8 text-gray-400 hover:text-red-600"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Load More */}
                                {notificationsData && notificationsData.pageNumber !== undefined && notificationsData.totalPages !== undefined && notificationsData.pageNumber < notificationsData.totalPages - 1 && (
                                    <div className="text-center pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                        >
                                            Load More Notifications
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
