'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { ResultDTO } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user, hasRole } = useAuth();
    const [result, setResult] = useState<ResultDTO | null>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Unwrap the params Promise
    const { id } = use(params);

    const isTeacher = hasRole('TEACHER');
    const isAdmin = hasRole('ADMIN');

    useEffect(() => {
        const loadResult = async () => {
            try {
                setLoading(true);
                setError('');

                console.log('Fetching result with ID:', id);
                const resultData = await apiClient.getResult(id);
                console.log('Raw result API response:', resultData);
                const resultObj = (resultData as any)?.data || resultData;
                console.log('Extracted result object:', resultObj);
                setResult(resultObj);

                // Try to get answers from attempt service using the attemptId
                if (resultObj?.attemptId) {
                    try {
                        const answersData = await apiClient.getAttemptAnswers(resultObj.attemptId);
                        setAnswers(answersData.data || answersData || []);
                    } catch (answersError) {
                        console.warn('Could not load answers:', answersError);
                        setAnswers([]);
                    }
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load result details');
                console.error('Failed to load result details:', err);
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Result not found.</p>
                    <Link href="/results" className="text-blue-600 hover:underline">
                        Back to results
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Result Details</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Detailed breakdown of your exam performance</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Exam Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="capitalize">{result.status.toLowerCase()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Published: {result.publishedAt ? new Date(result.publishedAt).toLocaleString() : 'Not published'}</span>
                            </div>

                            {result.gradedAt && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Graded: {new Date(result.gradedAt).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Score Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-center py-4">
                                <div className="relative w-32 h-32">
                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#E5E7EB"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#3B82F6"
                                            strokeWidth="3"
                                            strokeDasharray={`${result.percentage}, 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-blue-600">{result.percentage}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center">
                                    <p className="text-gray-600">Score</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {result.obtainedMarks}/{result.totalMarks}
                                    </p>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-600">Status</p>
                                    <p className={`text-xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.passed ? 'Passed' : 'Failed'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Question-by-Question Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    {answers.length > 0 ? (
                        <div className="space-y-4">
                            {answers.map((answer, index) => (
                                <div key={answer.id || `answer-${index}`} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                Question {answer.questionOrder}: {answer.questionId}
                                            </p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                                </span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {answer.marksObtained || 0}/{answer.marksAllocated} marks
                                                </span>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                    {answer.timeSpentSeconds || 0} seconds
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No answer details available.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
                <Link href="/results">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Back to Results
                    </Button>
                </Link>

                {(isTeacher || isAdmin) && (
                    <Link href={`/results/${id}/grade`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                            Grade/Review
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
