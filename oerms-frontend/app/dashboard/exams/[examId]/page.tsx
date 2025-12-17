'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ExamDTO } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2, BookOpen, Clock, Trophy, Users, AlertCircle, CheckCircle2, FileEdit, Archive, Trash, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ExamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId as string;
    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);

    const fetchExam = async () => {
        try {
            const response = await apiClient.getExam(examId);
            const data = response.data || response;
            setExam(data);
        } catch (error) {
            console.error('Failed to fetch exam:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId) fetchExam();
    }, [examId]);

    const handlePublishToggle = async () => {
        if (!exam) return;
        setPublishing(true);
        try {
            if (exam.status === 'PUBLISHED') {
                await apiClient.unpublishExam(exam.id);
            } else {
                await apiClient.publishExam(exam.id);
            }
            await fetchExam(); // Refresh data
        } catch (error) {
            console.error('Toggle publish failed:', error);
            alert('Failed to update status. Please make sure exam is valid.');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!exam) return <div>Exam not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/dashboard/exams" className="hover:text-blue-600 transition-colors">Exams</Link>
                        <span>/</span>
                        <span>Details</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {exam.title}
                        <span className={`text-sm px-3 py-1 rounded-full border ${exam.status === 'PUBLISHED'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            }`}>
                            {exam.status}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handlePublishToggle}
                        disabled={publishing}
                        className={exam.status === 'PUBLISHED' ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            exam.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Exam'}
                    </Button>
                    <Link href={`/dashboard/exams/${exam.id}/edit`}>
                        <Button variant="primary">
                            <FileEdit className="w-4 h-4 mr-2" />
                            Edit Details
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.duration}m</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Marks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.totalMarks}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Passing Marks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.passingMarks}</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h2>
                            <Link href={`/dashboard/exams/${exam.id}/questions`}>
                                <Button size="sm" variant="outline">Manage Questions</Button>
                            </Link>
                        </div>
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Manage the questions for this exam.</p>
                            <Link href={`/dashboard/exams/${exam.id}/questions`}>
                                <Button variant="primary">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Questions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Configuration</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-500">Shuffle Questions</span>
                                <span className={exam.shuffleQuestions ? "text-green-600" : "text-gray-400"}>
                                    {exam.shuffleQuestions ? "Enabled" : "Disabled"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">Instant Results</span>
                                <span className={exam.showResultsImmediately ? "text-green-600" : "text-gray-400"}>
                                    {exam.showResultsImmediately ? "Enabled" : "Disabled"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">Multiple Attempts</span>
                                <span className={exam.allowMultipleAttempts ? "text-green-600" : "text-gray-400"}>
                                    {exam.allowMultipleAttempts ? "Yes" : "No"}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
