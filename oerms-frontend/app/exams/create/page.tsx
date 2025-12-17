'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { CreateExamRequest } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function CreateExamPage() {
    const router = useRouter();
    const { hasRole } = useAuth();
    const [formData, setFormData] = useState<CreateExamRequest>({
        title: '',
        description: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 50,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        allowMultipleAttempts: false,
        maxAttempts: 3,
        shuffleQuestions: false,
        showResultsImmediately: true,
        instructions: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        if (!hasRole('TEACHER') && !hasRole('ADMIN')) {
            router.push('/dashboard');
        }
    }, [hasRole, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

        setFormData(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Convert duration to number
            const examData = {
                ...formData,
                duration: Number(formData.duration),
                totalMarks: Number(formData.totalMarks),
                passingMarks: Number(formData.passingMarks),
                maxAttempts: Number(formData.maxAttempts)
            };

            const createdExam = await apiClient.createExam(examData);
            setSuccess('Exam created successfully!');
            router.push(`/exams/${createdExam.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create exam');
            console.error('Failed to create exam:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Exam</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Fill in the details to create a new exam</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exam Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Exam Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Midterm Mathematics Exam"
                                />
                            </div>

                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                    min={1}
                                    max={600}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Brief description of the exam content and objectives"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="totalMarks"
                                    name="totalMarks"
                                    type="number"
                                    value={formData.totalMarks}
                                    onChange={handleChange}
                                    required
                                    min={1}
                                />
                            </div>

                            <div>
                                <label htmlFor="passingMarks" className="block text-sm font-medium text-gray-700 mb-1">
                                    Passing Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="passingMarks"
                                    name="passingMarks"
                                    type="number"
                                    value={formData.passingMarks}
                                    onChange={handleChange}
                                    required
                                    min={0}
                                    max={formData.totalMarks}
                                />
                            </div>

                            <div>
                                <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Attempts
                                </label>
                                <Input
                                    id="maxAttempts"
                                    name="maxAttempts"
                                    type="number"
                                    value={formData.maxAttempts}
                                    onChange={handleChange}
                                    min={1}
                                    disabled={!formData.allowMultipleAttempts}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="datetime-local"
                                    value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="datetime-local"
                                    value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="allowMultipleAttempts"
                                    name="allowMultipleAttempts"
                                    type="checkbox"
                                    checked={formData.allowMultipleAttempts}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="allowMultipleAttempts" className="ml-2 block text-sm text-gray-700">
                                    Allow multiple attempts
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="shuffleQuestions"
                                    name="shuffleQuestions"
                                    type="checkbox"
                                    checked={formData.shuffleQuestions}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="shuffleQuestions" className="ml-2 block text-sm text-gray-700">
                                    Shuffle questions for each student
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="showResultsImmediately"
                                    name="showResultsImmediately"
                                    type="checkbox"
                                    checked={formData.showResultsImmediately}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="showResultsImmediately" className="ml-2 block text-sm text-gray-700">
                                    Show results immediately after completion
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                                Special Instructions
                            </label>
                            <textarea
                                id="instructions"
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any special instructions for students (e.g., calculator allowed, open book, etc.)"
                            />
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Exam'
                                )}
                            </Button>

                            <Link href="/exams">
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
        </div>
    );
}
