'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { ExamDTO } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function ExamsPage() {
    const router = useRouter();
    const { user, hasRole } = useAuth();
    const [exams, setExams] = useState<ExamDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const isTeacher = hasRole('TEACHER');
    const isAdmin = hasRole('ADMIN');

    useEffect(() => {
        const loadExams = async () => {
            try {
                setLoading(true);
                setError('');

                let examsData: ExamDTO[] = [];
                let totalPages = 0;

                if (isTeacher || isAdmin) {
                    // Teachers and admins see all exams
                    const response = await apiClient.getAllExams({ page, size: 10 });

                    // Handle different response structures
                    if (response && response.data && Array.isArray(response.data.content)) {
                        examsData = response.data.content;
                        totalPages = response.data.totalPages;
                    } else if (response && Array.isArray(response.content)) {
                        examsData = response.content;
                        totalPages = response.totalPages;
                    } else if (response && Array.isArray(response)) {
                        examsData = response;
                        totalPages = 1;
                    }
                } else {
                    // Students see only published exams
                    const response = await apiClient.getPublishedExams({ page, size: 10 });

                    // Handle different response structures
                    if (response && response.data && Array.isArray(response.data.content)) {
                        examsData = response.data.content;
                        totalPages = response.data.totalPages;
                    } else if (response && Array.isArray(response.content)) {
                        examsData = response.content;
                        totalPages = response.totalPages;
                    } else if (response && Array.isArray(response)) {
                        examsData = response;
                        totalPages = 1;
                    }
                }

                setExams(prev => page === 0 ? examsData : [...prev, ...examsData]);
                setHasMore(totalPages > page + 1);
            } catch (err: any) {
                console.error('Failed to load exams - Full error:', err);
                const errorMessage = err.message || err.details?.message || 'Failed to load exams';
                setError(errorMessage);
                console.error('Failed to load exams:', errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadExams();
        }
    }, [user, page, isTeacher, isAdmin]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    if (loading && page === 0) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exams</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {isTeacher || isAdmin ? 'Manage and view all exams' : 'Available exams for you to take'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {(isTeacher || isAdmin) && (
                <div className="mb-6">
                    <Link href="/dashboard/exams/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Exam
                        </Button>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.length > 0 ? (
                    exams.map((exam) => (
                        <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg">{exam.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {exam.description || 'No description provided'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{exam.duration} minutes</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{exam.totalMarks} marks</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <span>{exam.passingMarks} passing</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="capitalize">{exam.status.toLowerCase()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Link
                                            href={`/exams/${exam.id}`}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            View Details
                                        </Link>

                                        {isTeacher && (
                                            <Link
                                                href={`/dashboard/exams/${exam.id}/edit`}
                                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 mb-4">No exams found.</p>
                        {isTeacher && (
                            <Link href="/dashboard/exams/create" className="text-blue-600 hover:underline">
                                Create your first exam →
                            </Link>
                        )}
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
        </div>
    );
}
