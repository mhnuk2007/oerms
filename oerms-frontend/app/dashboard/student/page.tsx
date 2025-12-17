'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { AttemptSummary, ExamDTO, ResultSummaryDTO } from '@/lib/types';
import {
    Clock,
    BookOpen,
    Trophy,
    Play,
    ChevronRight,
    AlertCircle,
    BarChart2,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface StudentStats {
    availableExams: number;
    completedAttempts: number;
    averageScore: string;
    pendingResults: number;
}

export default function StudentDashboard() {
    const [stats, setStats] = useState<StudentStats>({
        availableExams: 0,
        completedAttempts: 0,
        averageScore: '0%',
        pendingResults: 0
    });
    const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);
    const [recentResults, setRecentResults] = useState<ResultSummaryDTO[]>([]);
    const [availableExamsList, setAvailableExamsList] = useState<ExamDTO[]>([]);
    const [activeAttempt, setActiveAttempt] = useState<AttemptSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 10000);
                });

                const [publishedCountResponse, attemptsCountResponse, attemptsPageResponse, publishedExamsPageResponse] = await Promise.race([
                    Promise.all([
                        apiClient.getPublishedExamCount().catch(() => ({ data: 0 })),
                        apiClient.getMyAttemptsCount().catch(() => ({ data: 0 })),
                        apiClient.getMyAttempts({ size: 10 }).catch(() => ({ data: { content: [] } })),
                        apiClient.getPublishedExams({ page: 0, size: 5 }).catch(() => ({ data: { content: [] } }))
                    ]),
                    timeoutPromise
                ]).catch(() => [{ data: 0 }, { data: 0 }, { data: { content: [] } }, { data: { content: [] } }]) as any;

                // Extract data from API responses
                const publishedCount = publishedCountResponse?.data || 0;
                const attemptsCount = attemptsCountResponse?.data || 0;
                const attemptsPage = attemptsPageResponse?.data || { content: [] };
                const publishedExamsPage = publishedExamsPageResponse?.data || { content: [] };

                // If no data from API, show demo data
                if (publishedCount === 0 && attemptsCount === 0 && (!attemptsPage.content || attemptsPage.content.length === 0) && (!publishedExamsPage.content || publishedExamsPage.content.length === 0)) {
                    // Demo data for when backend is not available
                    const demoAttempts: AttemptSummary[] = [
                        {
                            id: '1',
                            examId: '1',
                            examTitle: 'Sample Math Exam',
                            studentName: 'Demo Student',
                            startedAt: new Date(Date.now() - 86400000).toISOString(),
                            submittedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
                            status: 'GRADED' as const,
                            score: 85,
                            totalMarks: 100,
                            percentage: 85,
                            passed: true
                        },
                        {
                            id: '2',
                            examId: '2',
                            examTitle: 'Physics Fundamentals',
                            studentName: 'Demo Student',
                            startedAt: new Date(Date.now() - 172800000).toISOString(),
                            status: 'SUBMITTED' as const,
                            score: undefined,
                            totalMarks: 100,
                            percentage: undefined,
                            passed: undefined
                        }
                    ];

                    const demoExams: ExamDTO[] = [
                        {
                            id: '1',
                            title: 'Mathematics Quiz',
                            description: 'Basic mathematics assessment',
                            teacherId: 'demo-teacher',
                            teacherName: 'Demo Teacher',
                            duration: 60,
                            totalMarks: 100,
                            passingMarks: 60,
                            startTime: undefined,
                            endTime: undefined,
                            status: 'PUBLISHED' as const,
                            isActive: true,
                            allowMultipleAttempts: false,
                            maxAttempts: undefined,
                            shuffleQuestions: false,
                            showResultsImmediately: true,
                            instructions: 'Answer all questions',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            createdBy: 'demo-teacher',
                            lastModifiedBy: undefined
                        },
                        {
                            id: '2',
                            title: 'Physics Test',
                            description: 'Physics fundamentals test',
                            teacherId: 'demo-teacher',
                            teacherName: 'Demo Teacher',
                            duration: 90,
                            totalMarks: 100,
                            passingMarks: 70,
                            startTime: undefined,
                            endTime: undefined,
                            status: 'PUBLISHED' as const,
                            isActive: true,
                            allowMultipleAttempts: false,
                            maxAttempts: undefined,
                            shuffleQuestions: false,
                            showResultsImmediately: true,
                            instructions: 'Answer all questions',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            createdBy: 'demo-teacher',
                            lastModifiedBy: undefined
                        }
                    ];

                    setActiveAttempt(null);
                    setStats({
                        availableExams: 2,
                        completedAttempts: 1,
                        averageScore: '85%',
                        pendingResults: 1
                    });
                    setRecentAttempts(demoAttempts);
                    setAvailableExamsList(demoExams);
                    return;
                }

                const attempts: AttemptSummary[] = (attemptsPage as any).content || [];

                // Find active attempt (IN_PROGRESS)
                const inProgress = attempts.find((a: AttemptSummary) => a.status === 'IN_PROGRESS');
                setActiveAttempt(inProgress || null);

                // Calculate average score
                let totalScore = 0;
                let scoredAttempts = 0;
                attempts.forEach((a: AttemptSummary) => {
                    if (a.score !== undefined && a.status === 'GRADED') {
                        totalScore += a.score;
                        scoredAttempts++;
                    }
                });
                const avgScore = scoredAttempts > 0 ? Math.round(totalScore / scoredAttempts) + '%' : 'N/A';

                setStats({
                    availableExams: publishedCount as number,
                    completedAttempts: attemptsCount as number,
                    averageScore: avgScore,
                    pendingResults: attempts.filter((a: AttemptSummary) => a.status === 'SUBMITTED').length
                });

                setRecentAttempts(attempts.slice(0, 5));
                setAvailableExamsList((publishedExamsPage as any).content || []);

                // Load results using result service
                try {
                    const resultsResponse = await apiClient.getMyResults({ size: 5 });
                    const resultsData = resultsResponse.data || resultsResponse;
                    const results = resultsData.content || resultsData || [];
                    setRecentResults(results);
                } catch (resultsError) {
                    console.warn('Could not load results:', resultsError);
                    setRecentResults([]);
                }
            } catch (error) {
                console.error('Failed to load student dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
            {/* Resume Banner */}
            {activeAttempt && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 transform hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Clock className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Exam in Progress</h2>
                            <p className="text-amber-100">You have an ongoing attempt for <span className="font-semibold text-white">{activeAttempt.examTitle}</span>.</p>
                        </div>
                    </div>
                    <Link href={`/atm/${activeAttempt.id}`}>
                        <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 border-0 font-bold shadow-md whitespace-nowrap">
                            Continue Exam <Play className="w-5 h-5 ml-2 fill-current" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Available</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.availableExams}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Exams to take</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedAttempts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total attempts</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Average</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Overall score</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pending</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingResults}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Awaiting results</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Exams Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
                            Available Exams
                        </h2>
                        <Link href="/exams/published" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {availableExamsList.length > 0 ? availableExamsList.map((exam) => (
                            <div key={exam.id} className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                                        {['PUBLISHED', 'ONGOING'].includes(exam.status) && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase tracking-wide">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration} mins</span>
                                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {exam.totalMarks} marks</span>
                                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pass: {exam.passingMarks}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={`/exams/${exam.id}`}>
                                        <Button variant="outline" size="sm" className="w-full md:w-auto">Details</Button>
                                    </Link>
                                    <Link href={`/exams/${exam.id}`}>
                                        <Button size="sm" className="w-full md:w-auto group-hover:translate-x-1 transition-transform">
                                            Start <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500 dark:text-gray-300">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No active exams</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Check back later for new assessments.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Overview */}
                <div className="space-y-6">
                    {/* Recent Attempts */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Recent Attempts
                            </h3>
                            <Link href="/dashboard/attempts" className="text-sm text-blue-600 hover:text-blue-700">
                                View All
                            </Link>
                        </div>
                        {recentAttempts.length > 0 ? (
                            <div className="space-y-3">
                                {recentAttempts.map((attempt) => (
                                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${attempt.status === 'GRADED' ? 'bg-green-500' :
                                                    attempt.status === 'SUBMITTED' ? 'bg-blue-500' :
                                                        attempt.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                            'bg-gray-500'
                                                }`}></div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{attempt.examTitle}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                                    {new Date(attempt.startTime || Date.now()).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${attempt.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                                                    attempt.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                                        attempt.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {attempt.status.replace('_', ' ')}
                                            </span>
                                            {attempt.score !== undefined && (
                                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                                    {attempt.score}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                                <p className="text-sm">No recent attempts</p>
                                <p className="text-xs mt-1">Start an exam to see your activity here</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Results */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-green-600" />
                                Recent Results
                            </h3>
                            <Link href="/results" className="text-sm text-green-700 hover:text-green-800">
                                View All
                            </Link>
                        </div>
                        {recentResults.length > 0 ? (
                            <div className="space-y-3">
                                {recentResults.map((result) => (
                                    <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{result.examTitle}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                                    Published {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : 'Recently'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {result.passed ? 'Passed' : 'Failed'}
                                            </span>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                                {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No published results yet</p>
                                <p className="text-xs mt-1">Complete exams to see your results here</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-600" />
                            Performance Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{stats.completedAttempts}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.averageScore === 'N/A' ? '0%' : stats.averageScore}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
    );
}
