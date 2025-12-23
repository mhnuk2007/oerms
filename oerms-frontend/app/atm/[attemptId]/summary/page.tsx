'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptResponse, ExamDTO, ExamWithQuestionsDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Clock, Trophy, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AttemptSummaryPage() {
    const params = useParams();
    const attemptId = params.attemptId as string;
    const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [examWithQuestions, setExamWithQuestions] = useState<ExamWithQuestionsDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const attemptResponse = await apiClient.getAttempt(attemptId);
                const att = attemptResponse.data; // Extract the actual attempt data
                setAttempt(att);

                const examResponse = await apiClient.getExam(att.examId);
                const ex = examResponse.data || examResponse; // Extract exam data
                setExam(ex);

                // Fetch exam with questions to get question texts
                const examWithQuestionsResponse = await apiClient.getExamWithQuestions(att.examId);
                const examWithQ = examWithQuestionsResponse.data || examWithQuestionsResponse;
                setExamWithQuestions(examWithQ);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [attemptId]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!attempt || !exam) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                            <div className="text-red-500 text-2xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Attempt Not Found</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">The attempt data could not be loaded.</p>
                            <Link href="/dashboard">
                                <Button>Return to Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const correctAnswers = attempt.answers?.filter((a: any) => a.correct === true).length || 0;
    const incorrectAnswers = attempt.answers?.filter((a: any) => a.correct === false).length || 0;
    const unanswered = (attempt.totalQuestions || 0) - (attempt.answeredQuestions || 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'text-blue-600 bg-blue-100';
            case 'GRADED': return 'text-green-600 bg-green-100';
            case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getAnswerIcon = (correct: boolean | null) => {
        if (correct === true) return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (correct === false) return <XCircle className="w-5 h-5 text-red-600" />;
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attempt Summary</h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Review your performance for {exam.title}</p>
                            </div>
                            <Link href="/dashboard">
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attempt.status)}`}>
                                {attempt.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Score</h3>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {attempt.obtainedMarks !== undefined ? `${attempt.obtainedMarks}/${attempt.totalMarks}` : 'Pending'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {attempt.percentage !== undefined ? `${attempt.percentage.toFixed(1)}%` : ''}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Time Taken</h3>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}:${(attempt.timeTakenSeconds % 60).toString().padStart(2, '0')}` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">minutes</div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-orange-500">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Questions</h3>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{attempt.totalQuestions}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {attempt.answeredQuestions} answered
                            </div>
                        </div>
                    </div>

                    {/* Performance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                                    <div className="text-sm text-green-700 dark:text-green-400">Correct Answers</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-8 h-8 text-red-600" />
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                                    <div className="text-sm text-red-700 dark:text-red-400">Incorrect Answers</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-8 h-8 text-gray-600" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-600">{unanswered}</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-400">Unanswered</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Question-by-Question Review</h3>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {attempt.answers?.map((answer, index) => (
                                <div key={answer.questionId} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getAnswerIcon((answer as any).correct)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Question {answer.questionOrder + 1}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {answer.timeSpentSeconds ? `${answer.timeSpentSeconds}s` : ''}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                <strong>Your Answer:</strong> {answer.selectedOptions?.join(', ') || answer.answerText || 'Not answered'}
                                            </div>

                                            {(answer as any).correct === false && (answer as any).selectedOptions && (answer as any).selectedOptions.length > 0 && (
                                                <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                                                    <strong>Correct Answer:</strong> [Not shown for security]
                                                </div>
                                            )}

                                            {(answer as any).correct === null && (
                                                <div className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                                                    <strong>Note:</strong> This question was not answered
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Marks: {answer.marksObtained}/{answer.marksAllocated}
                                                </span>
                                                {answer.flagged && (
                                                    <span className="text-yellow-600 dark:text-yellow-400">
                                                        Flagged for review
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No answer details available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/dashboard">
                            <Button>Return to Dashboard</Button>
                        </Link>
                        <Link href={`/exams/${exam.id}`}>
                            <Button variant="outline">Take Exam Again</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
