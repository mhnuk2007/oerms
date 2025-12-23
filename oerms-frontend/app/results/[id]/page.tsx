'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptResultResponse } from '@/lib/types';
import { QuestionResultList } from '@/components/exam/QuestionResultList';
import Link from 'next/link';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function ResultDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                <div className="mb-8">
                    <div className="h-9 w-3/5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-5 w-4/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="p-6 space-y-6">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResultDetailsPage() {
    const params = useParams();
    const { hasRole } = useAuth();
    const id = params.id as string; // This is the resultId

    // ALL hooks must be called at the top level, in the same order every time
    const [result, setResult] = useState<AttemptResultResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

    // Derived state using useMemo - called every render in same order
    const counts = React.useMemo(() => {
        if (!result?.details) return { all: 0, correct: 0, incorrect: 0 };
        return {
            all: result.details.length,
            correct: result.details.filter(d => d.isCorrect === true).length,
            incorrect: result.details.filter(d => d.isCorrect === false).length,
        };
    }, [result]);

    const filteredDetails = React.useMemo(() => {
        if (!result?.details) return [];
        switch (filter) {
            case 'correct':
                return result.details.filter(d => d.isCorrect === true);
            case 'incorrect':
                return result.details.filter(d => d.isCorrect === false);
            case 'all':
            default:
                return result.details;
        }
    }, [result, filter]);

    // Side effects
    useEffect(() => {
        // This function is defined inside useEffect to capture `id` from the closure.
        const fetchResult = async () => {
            if (!id) {
                setError("Result ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Step 1: Fetch basic result info
                const resultResponse = await apiClient.getResult(id);
                const resultData = (resultResponse as any)?.data || resultResponse;

                // Step 2: Fetch detailed question results
                const detailsResponse = await apiClient.getResultDetails(id);
                const detailsData = (detailsResponse as any)?.data || detailsResponse;

                // Transform the API response to match our component's expected structure
                const transformedResult: AttemptResultResponse = {
                    attemptId: resultData.attemptId,
                    examId: resultData.examId || detailsData.examId,
                    examTitle: resultData.examTitle || detailsData.examTitle,
                    studentId: resultData.studentId || detailsData.studentId,
                    studentName: resultData.studentName || detailsData.studentName,
                    status: resultData.resultStatus || resultData.status,
                    totalMarks: resultData.totalMarks || detailsData.totalMarks,
                    obtainedMarks: resultData.obtainedMarks || detailsData.obtainedMarks,
                    percentage: resultData.percentage || detailsData.percentage,
                    passed: resultData.passed || detailsData.passed,
                    grade: resultData.grade || detailsData.grade,
                    publishedAt: resultData.publishedAt || detailsData.publishedAt,
                    submittedAt: resultData.submittedAt || detailsData.submittedAt,
                    timeTakenSeconds: resultData.timeTakenSeconds || detailsData.timeTakenSeconds,
                    details: detailsData.questions || []
                };

                setResult(transformedResult);

            } catch (err: any) {
                // Improved error handling with better user messages
                console.error("Error fetching result details:", JSON.stringify(err, null, 2));

                let userMessage = 'An unexpected error occurred while loading the result.';

                // Handle different types of errors
                if (err?.status === 404) {
                    userMessage = 'Result not found. The result may have been deleted or you may not have permission to view it.';
                } else if (err?.status === 403) {
                    userMessage = 'You do not have permission to view this result.';
                } else if (err?.status === 500) {
                    userMessage = 'Server error occurred. Please try again later or contact support if the problem persists.';
                } else if (err?.status === 401) {
                    userMessage = 'Your session has expired. Please log in again.';
                } else if (err?.message) {
                    userMessage = err.message;
                } else if (err?.response?.data?.message) {
                    userMessage = err.response.data.message;
                }

                setError(userMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    if (loading) {
        return <ResultDetailsSkeleton />;
    }

    const FilterButton = ({ active, onClick, children, count }: { active: boolean, onClick: () => void, children: React.ReactNode, count: number }) => (
        <button
            onClick={onClick}
            className={cn("flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500", active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')}
        >
            {children}
            <span className={cn("flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full", active ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600')}>
                {count}
            </span>
        </button>
    );

    if (error || !result) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="text-red-500 text-2xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Result</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Result data could not be loaded.'}</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (passed?: boolean) => {
        if (passed === true) return 'bg-green-100 text-green-800';
        if (passed === false) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Result Details</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Detailed breakdown of your performance in {result.examTitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {(hasRole('TEACHER') || hasRole('ADMIN')) && (
                                <Link href={`/results/${id}/grade`} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm">
                                    Grade/Review
                                </Link>
                            )}
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Exam Information</h3>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{result.examTitle}</p>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2">Published:</span>
                                <span>{formatDate(result.publishedAt)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="mr-2">Submitted:</span>
                                <span>{formatDate(result.submittedAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Score Summary</h3>
                        <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{result.percentage?.toFixed(1)}%</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Score</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{result.obtainedMarks}</span> / {result.totalMarks} Marks
                        </div>
                    </div>

                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${result.passed ? 'border-green-500' : 'border-red-500'}`}>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                        <div className="flex items-center mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getStatusColor(result.passed)}`}>
                                {result.passed ? 'Passed' : 'Failed'}
                            </span>
                        </div>
                        {result.grade && (
                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                Grade: <span className="font-bold text-gray-900 dark:text-white">{result.grade}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Question Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap justify-between items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Question-by-Question Breakdown</h3>
                        <div className="flex items-center gap-2">
                            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all}>All</FilterButton>
                            <FilterButton active={filter === 'correct'} onClick={() => setFilter('correct')} count={counts.correct}>Correct</FilterButton>
                            <FilterButton active={filter === 'incorrect'} onClick={() => setFilter('incorrect')} count={counts.incorrect}>Incorrect</FilterButton>
                        </div>
                    </div>
                    <div className="p-6">
                        {filteredDetails.length > 0 ? (
                            <QuestionResultList details={filteredDetails} />
                        ) : (
                            <div className="text-center py-12">
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Questions Found</h4>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    There are no {filter} questions to display.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
