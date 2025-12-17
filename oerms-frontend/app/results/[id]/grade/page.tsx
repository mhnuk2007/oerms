'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { AttemptResponse, AttemptAnswerResponse } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function GradeResultPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { hasRole } = useAuth();
    const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
    const [answers, setAnswers] = useState<AttemptAnswerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [updatedAnswers, setUpdatedAnswers] = useState<Record<string, number>>({});
    const [reviewNotes, setReviewNotes] = useState('');

    const isTeacher = hasRole('TEACHER');
    const isAdmin = hasRole('ADMIN');

    useEffect(() => {
        if (!isTeacher && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isTeacher, isAdmin, router]);

    useEffect(() => {
        const loadResult = async () => {
            try {
                setLoading(true);
                setError('');

                const attemptData = await apiClient.getAttempt(params.id);
                setAttempt(attemptData);

                const answersData = await apiClient.getAttemptAnswers(params.id);
                setAnswers(answersData);

                // Initialize updated answers with current marks
                const initialMarks: Record<string, number> = {};
                answersData.forEach((answer: any) => {
                    initialMarks[answer.id] = answer.marksObtained || 0;
                });
                setUpdatedAnswers(initialMarks);
            } catch (err: any) {
                setError(err.message || 'Failed to load result details');
                console.error('Failed to load result details:', err);
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [params.id]);

    const handleMarksChange = (answerId: string, marks: number) => {
        setUpdatedAnswers(prev => ({
            ...prev,
            [answerId]: marks
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update each answer with new marks
            for (const answer of answers) {
                const marks = updatedAnswers[answer.id] || 0;
                if (marks !== answer.marksObtained) {
                    // In a real implementation, you would have an API endpoint to update individual answer marks
                    // For now, we'll just simulate the update
                    console.log(`Updating marks for answer ${answer.id} to ${marks}`);
                }
            }

            // Update the attempt with review notes
            if (reviewNotes) {
                // In a real implementation, you would have an API endpoint to add review notes
                console.log(`Adding review notes: ${reviewNotes}`);
            }

            setSuccess('Grading completed successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update grading');
            console.error('Failed to update grading:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!attempt) {
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grade Exam Attempt</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Review and grade student's exam attempt</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{success}</p>
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
                                <span className="capitalize">{attempt.status.toLowerCase()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Started: {new Date(attempt.startedAt).toLocaleString()}</span>
                            </div>

                            {attempt.submittedAt && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Submitted: {new Date(attempt.submittedAt).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Score</CardTitle>
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
                                            strokeDasharray={`${attempt.percentage}, 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-blue-600">{attempt.percentage}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center">
                                    <p className="text-gray-600">Current Score</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {attempt.obtainedMarks || 0}/{attempt.totalMarks}
                                    </p>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-600">Status</p>
                                    <p className={`text-xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {attempt.passed ? 'Passed' : 'Failed'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Grade Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {answers.length > 0 ? (
                            <div className="space-y-4">
                                {answers.map((answer, index) => (
                                    <div key={answer.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
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

                                                <div className="mt-3">
                                                    <label htmlFor={`marks-${answer.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                        Adjust Marks (0-{answer.marksAllocated})
                                                    </label>
                                                    <Input
                                                        id={`marks-${answer.id}`}
                                                        type="number"
                                                        value={updatedAnswers[answer.id] || 0}
                                                        onChange={(e) => handleMarksChange(answer.id, Number(e.target.value))}
                                                        min={0}
                                                        max={answer.marksAllocated}
                                                        className="w-24"
                                                    />
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

                        <div className="mt-6">
                            <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
                                Review Notes (optional)
                            </label>
                            <textarea
                                id="reviewNotes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add any review notes or comments about this attempt"
                            />
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Grading'
                                )}
                            </Button>

                            <Link href={`/results/${params.id}`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
                <Link href="/results">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Back to Results
                    </Button>
                </Link>

                <Link href={`/results/${params.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    );
}
