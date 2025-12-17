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
    const [isAdmin, setIsAdmin] = useState(false);

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching my results...');
            const response = await apiClient.getMyResults({ size: 50 });
            console.log('Raw API response:', response);
            
            // Handle API response structure
            const resultsData = (response as any).data || response;
            console.log('Extracted data:', resultsData);
            
            const resultsList = resultsData.content || resultsData || [];
            console.log('Results list:', resultsList);
            
            setResults(resultsList);
        } catch (error) {
            console.error('Failed to fetch results:', error);
            console.error('Error details:', error);
            console.error('Error message:', (error as any)?.message);
            console.error('Error status:', (error as any)?.status);
            console.error('Error details object:', (error as any)?.details);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Don't do anything while authentication is loading
        if (isLoading) {
            return;
        }

        // Check if user is admin and redirect if needed
        if (user && (hasRole('ADMIN') || hasRole('TEACHER'))) {
            setIsAdmin(true);
            return; // Don't fetch results for admin/teacher
        }
        
        // Only fetch results for students
        if (user && hasRole('STUDENT')) {
            fetchResults();
        } else if (!user) {
            // If no user, redirect to login
            router.push('/login');
        }
    }, [user, isLoading, fetchResults]);

    // Redirect admins to admin results page
    if (isAdmin) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Access Restricted
                    </h1>
                    <p className="text-gray-500 mb-6">
                        This page is for students to view their own results.
                    </p>
                    <p className="text-gray-500 mb-6">
                        As an admin/teacher, please use the admin results management page.
                    </p>
                    <Button 
                        onClick={() => router.push('/admin/results')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Go to Admin Results Management
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

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
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">my Results</h1>
                    <p className="text-gray-500">View your performance and grades.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading results...</div>
                    ) : results.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No results found. Complete an exam to see it here.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Exam Title</th>
                                    <th className="px-6 py-4">Date Published</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Percentage</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {results.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {result.examTitle}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : 'Not published'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${result.passed
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {result.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {result.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            {result.obtainedMarks}/{result.totalMarks}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {result.percentage.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/results/${result.id}`}>
                                                <Button variant="ghost" size="sm">View Details</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
