'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { ExamDTO, AttemptSummary } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CheckCircle2, Clock } from 'lucide-react';

interface TeacherStats {
    totalExams: number;
    publishedExams: number;
    draftExams: number;
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
}

export default function TeacherDashboard() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const [stats, setStats] = useState<TeacherStats>({
        totalExams: 0,
        publishedExams: 0,
        draftExams: 0,
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0
    });
    const [recentExams, setRecentExams] = useState<ExamDTO[]>([]);
    const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 10000);
                });

                const [myExamsCount, myExamsPage] = await Promise.race([
                    Promise.all([
                        apiClient.getMyExamCount().catch(() => 0),
                        apiClient.getMyExams({ page: 0, size: 5 }).catch(() => ({ content: [] }))
                    ]),
                    timeoutPromise
                ]).catch(() => [0, { content: [] }]) as any;

                const exams = myExamsPage.content || [];
                const publishedCount = exams.filter((e: ExamDTO) => e.status === 'PUBLISHED').length;
                const draftCount = exams.filter((e: ExamDTO) => e.status === 'DRAFT').length;

                // Calculate total questions and fetch attempt data
                let totalQuestions = 0;
                let allAttempts: AttemptSummary[] = [];
                let totalScore = 0;
                let passedAttempts = 0;
                let completedAttempts = 0;

                    // Fetch detailed data for each exam
                    const examDataPromises = exams.map(async (exam: ExamDTO) => {
                        try {
                            const [questionCount, attemptsPage] = await Promise.all([
                                apiClient.getExamQuestionCount(exam.id).catch(() => 0),
                                apiClient.getExamAttempts(exam.id, { page: 0, size: 10 }).catch(() => ({ content: [] }))
                            ]);

                            totalQuestions += questionCount;
                            const attempts = attemptsPage.content || [];

                            attempts.forEach((attempt: AttemptSummary) => {
                                allAttempts.push(attempt);
                                if ((attempt.status === 'SUBMITTED' || attempt.status === 'GRADED') && attempt.score !== undefined) {
                                    totalScore += attempt.percentage || 0;
                                    completedAttempts++;
                                    if (attempt.passed) {
                                        passedAttempts++;
                                    }
                                }
                            });
                        } catch (error) {
                            console.error('Failed to load exam data:', error);
                        }
                    });

                await Promise.all(examDataPromises);

                // Sort attempts by most recent
                allAttempts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

                // Calculate averages
                const averageScore = completedAttempts > 0 ? Math.round(totalScore / completedAttempts) : 0;
                const passRate = completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0;

                setStats({
                    totalExams: myExamsCount,
                    publishedExams: publishedCount,
                    draftExams: draftCount,
                    totalQuestions: totalQuestions,
                    totalAttempts: allAttempts.length,
                    averageScore: averageScore,
                    passRate: passRate
                });
                setRecentExams(exams);
                setRecentAttempts(allAttempts.slice(0, 5));
            } catch (error) {
                console.error('Failed to load teacher dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Loading skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
            {/* Welcome Banner with Profile */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                        {profile?.profilePictureUrl ? (
                            <Image
                                src={profile.profilePictureUrl}
                                alt="Profile"
                                fill
                                className="object-cover"
                                sizes="80px"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl font-bold">
                                    {profile?.firstName?.charAt(0) || user?.username?.charAt(0) || 'T'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">
                            Welcome back, {profile?.firstName || user?.username || 'Teacher'}!
                        </h1>
                        <p className="text-white/80 mt-1">
                            {profile?.institution && <span>{profile.institution} • </span>}
                            You have <strong>{stats.publishedExams}</strong> published exams and <strong>{stats.totalAttempts}</strong> student attempts.
                        </p>
                    </div>
                    <Link href="/profile">
                        <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                            Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Total Exams</p>
                        <p className="text-3xl font-bold mt-1">{stats.totalExams}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-green-100 text-xs font-medium uppercase tracking-wide">Published</p>
                        <p className="text-3xl font-bold mt-1">{stats.publishedExams}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-yellow-100 text-xs font-medium uppercase tracking-wide">Drafts</p>
                        <p className="text-3xl font-bold mt-1">{stats.draftExams}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-purple-100 text-xs font-medium uppercase tracking-wide">Questions</p>
                        <p className="text-3xl font-bold mt-1">{stats.totalQuestions}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-pink-100 text-xs font-medium uppercase tracking-wide">Attempts</p>
                        <p className="text-3xl font-bold mt-1">{stats.totalAttempts}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-cyan-100 text-xs font-medium uppercase tracking-wide">Pass Rate</p>
                        <p className="text-3xl font-bold mt-1">{stats.passRate}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Exams */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>My Exams</CardTitle>
                            <Link href="/exams/create">
                                <Button size="sm">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Exam
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentExams.length > 0 ? (
                                <div className="space-y-3">
                                    {recentExams.map((exam) => (
                                        <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{exam.title}</h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${exam.status === 'PUBLISHED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : exam.status === 'DRAFT'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                        {exam.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {exam.duration} mins • {exam.totalMarks} marks • Created {new Date(exam.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Link
                                                    href={`/exams/${exam.id}/edit`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit Exam"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/exams/${exam.id}/attempts`}
                                                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="View Attempts"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/exams/${exam.id}/statistics`}
                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Statistics"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    <Link href="/exams" className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
                                        View All Exams →
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No exams yet</h3>
                                    <p className="text-gray-500 text-sm mb-4">Create your first exam to get started</p>
                                    <Link href="/exams/create">
                                        <Button>Create Your First Exam</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Grading Queue & Recent Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pending Grading */}
                        <Card className="border-amber-200 dark:border-amber-800">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                                    Pending Grading
                                </CardTitle>
                                <Link href="/dashboard/grading" className="text-sm text-amber-600 hover:text-amber-700">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Mock pending grading items - in real app, fetch from result service */}
                                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">Math Quiz - John Doe</p>
                                            <p className="text-xs text-gray-500">Submitted 2 hours ago</p>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Needs Grading</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">Physics Test - Jane Smith</p>
                                            <p className="text-xs text-gray-500">Submitted 1 day ago</p>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Needs Grading</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Student Activity */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Recent Activity
                                </CardTitle>
                                <Link href="/dashboard/attempts" className="text-sm text-blue-600 hover:text-blue-700">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {recentAttempts.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentAttempts.map((attempt) => (
                                            <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${attempt.status === 'GRADED' ? 'bg-green-500' :
                                                            attempt.status === 'SUBMITTED' ? 'bg-blue-500' :
                                                                attempt.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                                    'bg-gray-500'
                                                        }`}></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {attempt.studentName || 'Student'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{attempt.examTitle}</p>
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
                                                    {attempt.percentage !== undefined && (
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                                            {attempt.percentage}%
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No recent student activity</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Link
                                    href="/exams/create"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">Create Exam</span>
                                        <p className="text-xs text-gray-500">Start a new assessment</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/questions/create"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">Add Question</span>
                                        <p className="text-xs text-gray-500">Build question bank</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/questions"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">Question Bank</span>
                                        <p className="text-xs text-gray-500">View all questions</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">My Profile</span>
                                        <p className="text-xs text-gray-500">View & edit profile</p>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{stats.averageScore}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.averageScore}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Pass Rate</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{stats.passRate}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${stats.passRate >= 70 ? 'bg-green-500' : stats.passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${stats.passRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips Card */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pro Tip</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Use the question bank to reuse questions across multiple exams. It saves time and ensures consistency!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </DashboardLayout>
    );
}
