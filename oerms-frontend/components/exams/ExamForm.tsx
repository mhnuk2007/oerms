'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is available or I should just use controlled inputs if not
import { CreateExamRequest, ExamDTO } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

interface ExamFormProps {
    initialData?: ExamDTO;
    isEditing?: boolean;
}

export function ExamForm({ initialData, isEditing = false }: ExamFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Local state for simplicity, or could use react-hook-form
    const [formData, setFormData] = useState<Partial<CreateExamRequest>>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        duration: initialData?.duration || 60,
        totalMarks: initialData?.totalMarks || 100,
        passingMarks: initialData?.passingMarks || 40,
        allowMultipleAttempts: initialData?.allowMultipleAttempts ?? false,
        shuffleQuestions: initialData?.shuffleQuestions ?? true,
        showResultsImmediately: initialData?.showResultsImmediately ?? true,
        instructions: initialData?.instructions || '',
        // Dates need formatted strings for inputs typically
        startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
        endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Number(value) : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditing && initialData) {
                // Implementation for update would go here
                await apiClient.updateExam(initialData.id, formData);
                router.push('/dashboard/exams');
            } else {
                await apiClient.createExam(formData as CreateExamRequest);
                router.push('/dashboard/exams');
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to save exam');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {isEditing ? 'Edit Exam Details' : 'Basic Information'}
                </h2>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Title *</label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Final Physics Exam 2024"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Brief overview of the exam content..."
                    />
                </div>

                {/* Instructions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions for Students</label>
                    <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Rules, guidelines, and what to expect..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes) *</label>
                        <Input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            min={1}
                            required
                        />
                    </div>

                    {/* Total Marks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks *</label>
                        <Input
                            type="number"
                            name="totalMarks"
                            value={formData.totalMarks}
                            onChange={handleChange}
                            min={1}
                            required
                        />
                    </div>

                    {/* Passing Marks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Marks *</label>
                        <Input
                            type="number"
                            name="passingMarks"
                            value={formData.passingMarks}
                            onChange={handleChange}
                            min={1}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time (Optional)</label>
                        <Input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty if exam can be taken anytime.</p>
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time (Optional)</label>
                        <Input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Settings Toggles */}
                <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input
                            type="checkbox"
                            name="shuffleQuestions"
                            checked={formData.shuffleQuestions}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">Shuffle Questions</span>
                            <span className="block text-xs text-gray-500">Randomize question order for each student</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input
                            type="checkbox"
                            name="showResultsImmediately"
                            checked={formData.showResultsImmediately}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">Show Results Immediately</span>
                            <span className="block text-xs text-gray-500">Allow students to see score right after submission</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <input
                            type="checkbox"
                            name="allowMultipleAttempts"
                            checked={formData.allowMultipleAttempts}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">Allow Multiple Attempts</span>
                            <span className="block text-xs text-gray-500">Students can retake the exam</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full md:w-auto">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Update Exam' : 'Create Exam'}
                        </>
                    )}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={loading} className="w-full md:w-auto">
                    Cancel
                </Button>
            </div>
        </form>
    );
}
