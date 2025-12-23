'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ResultSummaryDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function StudentResultsPage() {
    const router = useRouter();
    const { user, hasRole, isLoading } = useAuth();
    const [results, setResults] = useState<ResultSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResults = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            const roles = user.roles || [];
            const isAdmin = roles.includes('ROLE_ADMIN');
            const isTeacher = roles.includes('ROLE_TEACHER');
            const isStudent = roles.includes('ROLE_STUDENT');

            // ================= ADMIN =================
            if (isAdmin) {
                // For now, redirect admins to admin results page
                // In future, could show summary of all results
                router.push('/admin/results');
                return;
            }

            // ================= TEACHER =================
            if (isTeacher) {
                // For now, redirect teachers to admin results page
                // In future, could show results for exams they created
                router.push('/admin/results');
                return;
            }

            // ================= STUDENT =================
            if (isStudent) {
                console.log('Fetching my results...');
                const response = await apiClient.getMyResults({ size: 50 });
                console.log('Raw API response:', response);

                // Handle API response structure
                const resultsData = (response as any).data || response;
                console.log('Extracted data:', resultsData);

                const resultsList = resultsData.content || resultsData || [];
                console.log('Results list:', resultsList);

                setResults(resultsList);
                return;
            }

            // ================= NO ROLE =================
            setResults([]);
        } catch (error) {
            console.error('Failed to fetch results:', error);
            console.error('Error details:', error);
            console.error('Error message:', (error as any)?.message);
            console.error('Error status:', (error as any)?.status);
            console.error('Error details object:', (error as any)?.details);
        } finally {
            setLoading(false);
        }
    }, [user, router]);

    useEffect(() => {
        // Don't do anything while authentication is loading
        if (isLoading) {
            return;
        }

        if (user) {
            fetchResults();
        } else if (!user) {
            // If no user, redirect to login
            router.push('/login');
        }
    }, [user, isLoading, fetchResults, router]);

    // Show loading for non-admin users
    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Results</h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">View your performance and grades across all completed exams.</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Results</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Passed</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {results.filter(r => r.passed).length}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Failed</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {results.filter(r => !r.passed).length}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Average Score</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {results.length > 0
                                    ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1) + '%'
                                    : '0%'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading results...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-4xl mb-4">📊</div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    You haven't completed any exams yet. Start taking exams to see your results here.
                                </p>
                                <Link href="/exams">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Browse Available Exams
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Exam</th>
                                            <th className="px-6 py-4 text-left">Published</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-6 py-4 text-left">Score</th>
                                            <th className="px-6 py-4 text-left">Percentage</th>
                                            <th className="px-6 py-4 text-left">Grade</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {results.map((result) => (
                                            <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {result.examTitle}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            ID: {result.id.slice(-8)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {result.publishedAt
                                                        ? new Date(result.publishedAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                          })
                                                        : 'Not published'
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                                      ${result.passed
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                      }`}>
                                                        {result.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {result.passed ? 'Passed' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {result.obtainedMarks}/{result.totalMarks}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 transition-all duration-300"
                                                                style={{ width: `${result.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {result.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {result.grade ? (
                                                        <span className="font-semibold text-gray-900 dark:text-white px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                                            {result.grade}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/results/${result.id}`}>
                                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
