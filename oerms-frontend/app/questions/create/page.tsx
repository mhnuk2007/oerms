'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { CreateQuestionRequest } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function CreateQuestionPage() {
    const router = useRouter();
    const { hasRole } = useAuth();
    const [formData, setFormData] = useState<CreateQuestionRequest>({
        examId: '',
        questionText: '',
        type: 'MCQ',
        marks: 1,
        orderIndex: 0,
        options: [''],
        correctAnswer: '',
        explanation: '',
        difficultyLevel: 'MEDIUM',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        if (!hasRole('TEACHER') && !hasRole('ADMIN')) {
            router.push('/dashboard');
        }
    }, [hasRole, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index] = value;
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...(prev.options || []), '']
        }));
    };

    const removeOption = (index: number) => {
        const newOptions = (formData.options || []).filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Convert marks to number
            const questionData = {
                ...formData,
                marks: Number(formData.marks),
                orderIndex: Number(formData.orderIndex)
            };

            const createdQuestion = await apiClient.createQuestion(questionData);
            setSuccess('Question created successfully!');
            router.push(`/questions`);
        } catch (err: any) {
            setError(err.message || 'Failed to create question');
            console.error('Failed to create question:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Question</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Fill in the details to create a new question</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Question Details</CardTitle>
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
                        <div>
                            <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
                                Exam ID <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="examId"
                                name="examId"
                                type="text"
                                value={formData.examId}
                                onChange={handleChange}
                                required
                                placeholder="Enter the exam ID this question belongs to"
                            />
                        </div>

                        <div>
                            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
                                Question Text <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="questionText"
                                name="questionText"
                                value={formData.questionText}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="Enter the question text"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Question Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="MCQ">Multiple Choice (MCQ)</option>
                                    <option value="MULTIPLE_ANSWER">Multiple Answer</option>
                                    <option value="TRUE_FALSE">True/False</option>
                                    <option value="SHORT_ANSWER">Short Answer</option>
                                    <option value="ESSAY">Essay</option>
                                    <option value="FILL_BLANK">Fill in the Blank</option>
                                    <option value="MATCHING">Matching</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">
                                    Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="marks"
                                    name="marks"
                                    type="number"
                                    value={formData.marks}
                                    onChange={handleChange}
                                    required
                                    min={1}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="difficultyLevel"
                                name="difficultyLevel"
                                value={formData.difficultyLevel}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>

                        {(formData.type === 'MCQ' || formData.type === 'MULTIPLE_ANSWER') && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Options <span className="text-red-500">*</span>
                                </label>
                                {(formData.options || []).map((option, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            required
                                            className="flex-1"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        {(formData.options || []).length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50 px-3 py-1"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    onClick={addOption}
                                    variant="outline"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                    Add Option
                                </Button>
                            </div>
                        )}

                        <div>
                            <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                                Correct Answer <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="correctAnswer"
                                name="correctAnswer"
                                type="text"
                                value={formData.correctAnswer}
                                onChange={handleChange}
                                required
                                placeholder="Enter the correct answer"
                            />
                        </div>

                        <div>
                            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
                                Explanation
                            </label>
                            <textarea
                                id="explanation"
                                name="explanation"
                                value={formData.explanation}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Provide an explanation for the correct answer"
                            />
                        </div>

                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL (optional)
                            </label>
                            <Input
                                id="imageUrl"
                                name="imageUrl"
                                type="text"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Enter URL for any supporting image"
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
                                    'Create Question'
                                )}
                            </Button>

                            <Link href="/questions">
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
