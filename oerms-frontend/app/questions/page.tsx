'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { QuestionDTO } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function QuestionsPage() {
    const router = useRouter();
    const { user, hasRole } = useAuth();
    const [questions, setQuestions] = useState<QuestionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState<string>('');

    const isTeacher = hasRole('TEACHER');
    const isAdmin = hasRole('ADMIN');

    useEffect(() => {
        if (!isTeacher && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isTeacher, isAdmin, router]);

    useEffect(() => {
        const loadQuestions = async () => {
            if (!selectedExamId) return;

            try {
                setLoading(true);
                setError('');

                const response = await apiClient.getExamQuestions(selectedExamId);
                setQuestions(response);
                setHasMore(false); // For now, we'll load all questions at once
            } catch (err: any) {
                setError(err.message || 'Failed to load questions');
                console.error('Failed to load questions:', err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedExamId) {
            loadQuestions();
        }
    }, [selectedExamId]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    if (loading && page === 0) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Question Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Create and manage questions for your exams
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="mb-6">
                <Link href="/questions/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Question
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Exam</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Enter Exam ID"
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                onClick={() => setPage(0)}
                                disabled={!selectedExamId || loading}
                            >
                                Load Questions
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {selectedExamId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {questions.length > 0 ? (
                        questions.map((question) => (
                            <Card key={question.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-base">{question.questionText}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {question.type}
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                {question.marks} marks
                                            </span>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                {question.difficultyLevel}
                                            </span>
                                        </div>

                                        {question.options && question.options.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                                                <ul className="list-disc list-inside space-y-1 text-sm">
                                                    {question.options.map((option, index) => (
                                                        <li key={index} className="text-gray-600">{option}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {question.correctAnswer && (
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm">
                                                    <span className="font-medium text-green-700">Correct Answer:</span>
                                                    <span className="ml-2 text-green-600">{question.correctAnswer}</span>
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <Link
                                                href={`/questions/${question.id}/edit`}
                                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                                onClick={async () => {
                                                    try {
                                                        await apiClient.deleteQuestion(question.id);
                                                        setQuestions(prev => prev.filter(q => q.id !== question.id));
                                                    } catch (err) {
                                                        console.error('Failed to delete question:', err);
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
                            <p className="text-gray-500 mb-4">No questions found for this exam.</p>
                            {selectedExamId && (
                                <Link href="/questions/create" className="text-blue-600 hover:underline">
                                    Create your first question for this exam →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

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
        </div>
    );
}
