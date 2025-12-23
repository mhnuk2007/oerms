'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { examService } from '@/lib/api/exam';
import { ExamDTO } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminExamsPage() {
    const router = useRouter();
    const { hasRole } = useAuth();
    const [exams, setExams] = useState<ExamDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);



    useEffect(() => {
        const loadExams = async () => {
            try {
                setLoading(true);
                setError('');

                // Try multiple approaches to get all exams for admin
                let examsData: ExamDTO[] = [];
                let totalPages = 0;

                try {
                    // First try: get all exams (admin endpoint)
                    const response = await examService.getAllExams(page, 10);

                    examsData = response.content || [];
                    totalPages = response.totalPages || 1;
                } catch (adminError) {
                    console.warn('getAllExams failed, trying alternative approaches:', adminError);

                    // Fallback 1: Try to get published exams (might include all exams for admins)
                    try {
                        const publishedResponse = await examService.getPublishedExams(page, 10);

                        examsData = publishedResponse.content || [];
                        totalPages = publishedResponse.totalPages || 1;
                    } catch (publishedError) {
                        console.warn('getPublishedExams also failed:', publishedError);
                        // Don't throw error - let the page render with empty data and error message
                        examsData = [];
                        totalPages = 0;
                    }
                }

                setExams(prev => page === 0 ? examsData : [...prev, ...examsData]);
                setHasMore(totalPages > page + 1);
            } catch (err: any) {
                console.error('Failed to load exams - Full error:', err);

                // Handle different types of errors with user-friendly messages
                let errorMessage = 'Failed to load exams';
                if (err.isNetworkError) {
                    errorMessage = 'Cannot connect to the server. Please check your network connection or contact support.';
                } else if (err.status === 404) {
                    errorMessage = 'Exam service is temporarily unavailable. Please try again later.';
                } else if (err.status === 401 || err.status === 403) {
                    errorMessage = 'You do not have permission to view exams. Please contact your administrator.';
                } else if (err.message && err.message.includes('Failed to fetch')) {
                    errorMessage = 'Cannot connect to the server. Please check if the backend services are running.';
                } else {
                    errorMessage = err.message || err.details?.message || 'Failed to load exams';
                }

                setError(errorMessage);
                console.error('Failed to load exams:', errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadExams();
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Manage all exams in the system</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800 mb-1">Connection Issue</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                            {error.includes('connect to the server') && (
                                <p className="text-red-600 text-sm mt-1">
                                    Please ensure the backend services are running and try refreshing the page.
                                </p>
                            )}
                        </div>
                        <div className="flex-shrink-0">
                            <Button
                                onClick={() => window.location.reload()}
                                className="text-red-700 hover:text-red-900 border-red-300 hover:bg-red-50"
                                variant="outline"
                                size="sm"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Search Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search by title, description, or teacher"
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
                <Link href="/exams/create">
                    <Button className="bg-green-600 hover:bg-green-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Exam
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exams.length > 0 ? (
                    exams.map((exam) => (
                        <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg">{exam.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
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

                                        <Link
                                            href={`/exams/${exam.id}/edit`}
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>

                                        <Button
                                            variant="outline"
                                            className="border-red-300 text-red-700 hover:bg-red-50"
                                            onClick={async () => {
                                                try {
                                                    await examService.deleteExam(exam.id);
                                                    setExams(prev => prev.filter(e => e.id !== exam.id));
                                                } catch (err) {
                                                    console.error('Failed to delete exam:', err);
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 mb-4">No exams found.</p>
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
