'use client';

import { useState } from 'react';
import { CreateQuestionRequest, QuestionType, DifficultyLevel } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Plus, X } from 'lucide-react';

interface QuestionFormProps {
    examId: string;
    initialData?: any; // Should be QuestionDTO but types might vary slightly
    isEditing?: boolean;
}

export function QuestionForm({ examId, initialData, isEditing = false }: QuestionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<CreateQuestionRequest>>({
        examId: examId,
        questionText: initialData?.questionText || '',
        type: initialData?.type || 'MCQ',
        marks: initialData?.marks || 1,
        difficultyLevel: initialData?.difficultyLevel || 'MEDIUM',
        correctAnswer: initialData?.correctAnswer || '',
        options: initialData?.options || ['', '', '', ''], // Default 4 options for MCQ
        explanation: initialData?.explanation || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setFormData(prev => ({ ...prev, options: [...(prev.options || []), ''] }));
    };

    const removeOption = (index: number) => {
        const newOptions = [...(formData.options || [])];
        newOptions.splice(index, 1);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && initialData?.id) {
                await apiClient.updateQuestion(initialData.id, formData);
            } else {
                await apiClient.createQuestion(formData as CreateQuestionRequest); // Cast, assuming validation passes
            }
            router.push(`/dashboard/exams/${examId}/questions`);
            router.refresh();
        } catch (error: any) {
            alert(error.message || 'Failed to save question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700">

            {/* Type & Marks Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="MCQ">Multiple Choice</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                    <select
                        name="difficultyLevel"
                        value={formData.difficultyLevel}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks</label>
                    <Input
                        type="number"
                        name="marks"
                        value={formData.marks}
                        onChange={handleChange}
                        min={1}
                        required
                    />
                </div>
            </div>

            {/* Question Text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text</label>
                <textarea
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the question..."
                />
            </div>

            {/* Options (MCQ Only) */}
            {formData.type === 'MCQ' && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options</label>
                    {formData.options?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                            <div className="flex-none pt-2">
                                <input
                                    type="radio"
                                    name="correctAnswerSelect"
                                    checked={formData.correctAnswer === option && option !== ''}
                                    onChange={() => setFormData(prev => ({ ...prev, correctAnswer: option }))}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    title="Select as correct answer"
                                />
                            </div>
                            <Input
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className={formData.correctAnswer === option && option !== '' ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)} className="text-red-500">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2 text-blue-600">
                        <Plus className="w-3 h-3 mr-1" /> Add Option
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">Select the radio button next to an option to mark it as the correct answer.</p>
                </div>
            )}

            {/* True/False Specifics */}
            {formData.type === 'TRUE_FALSE' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="correctAnswer"
                                value="true" // Backend likely expects string "true" or "True"
                                checked={formData.correctAnswer?.toLowerCase() === 'true'}
                                onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: 'True' }))}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span>True</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="correctAnswer"
                                value="false"
                                checked={formData.correctAnswer?.toLowerCase() === 'false'}
                                onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: 'False' }))}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span>False</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Short Answer Specifics */}
            {formData.type === 'SHORT_ANSWER' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer (Keyword/Phrase)</label>
                    <Input
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleChange}
                        placeholder="Expected answer key..."
                        required
                    />
                </div>
            )}

            {/* Explanation */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation (Optional)</label>
                <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Explain why this is the correct answer..."
                />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isEditing ? 'Update Question' : 'Save Question'}
                </Button>
            </div>
        </form>
    );
}
