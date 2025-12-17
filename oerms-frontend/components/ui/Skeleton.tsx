import { ReactNode } from 'react';

interface SkeletonProps {
    className?: string;
    children?: ReactNode;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton skeleton-text"
                    style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
                />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
    return (
        <div
            className="skeleton skeleton-circle"
            style={{ width: size, height: size }}
            aria-hidden="true"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700" aria-hidden="true">
            <div className="flex items-center gap-4 mb-4">
                <SkeletonCircle size={48} />
                <div className="flex-1">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700" aria-hidden="true">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="p-4 flex gap-4 border-t border-gray-100 dark:border-gray-700"
                >
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonDashboardStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonExamCard() {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700" aria-hidden="true">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-4 mt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
        </div>
    );
}
