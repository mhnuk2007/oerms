'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { QuestionDTO, ExamDTO } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Edit, ArrowLeft, GripVertical } from 'lucide-react';
import Link from 'next/link';

export default function ExamQuestionsPage() {
    const params = useParams();
    const examId = params.examId as string;
    const [questions, setQuestions] = useState<QuestionDTO[]>([]);
    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch exam details first to show title
            const examResponse = await apiClient.getExam(examId);
            const examData = examResponse.data || examResponse;
            setExam(examData);

            // Fetch questions using the exam-with-questions endpoint or list questions by exam
            // The API client has getExamWithQuestions, let's use that to get questions
            const fullExamResponse = await apiClient.getExamWithQuestions(examId);
            const fullExamData = fullExamResponse.data || fullExamResponse;
            // Map QuestionResponse to QuestionDTO-like shape if needed, or just use the response
            // flexible mapping here as types might slightly differ
            setQuestions(fullExamData.questions as unknown as QuestionDTO[]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId) fetchData();
    }, [examId]);

    const handleDelete = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await apiClient.deleteQuestion(questionId);
            setQuestions(questions.filter(q => q.id !== questionId));
        } catch (error) {
            alert('Failed to delete question');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/exams/${examId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Exam
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Questions
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Manage questions for <span className="font-semibold">{exam?.title}</span>
                        </p>
                    </div>
                </div>

                <Link href={`/dashboard/exams/${examId}/questions/create`}>
                    <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Question
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 mb-4">No questions added yet.</p>
                        <Link href={`/dashboard/exams/${examId}/questions/create`}>
                            <Button variant="outline">Add your first question</Button>
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {questions.map((q, index) => (
                            <li key={q.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start gap-4">
                                <div className="mt-1 text-gray-400 cursor-move">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-1">
                                                {q.type}
                                            </span>
                                            <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mb-1">
                                                {q.marks} marks
                                            </span>
                                            <p className="text-gray-900 dark:text-white font-medium truncate">
                                                {index + 1}. {q.questionText}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Link href={`/dashboard/exams/${examId}/questions/${q.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:text-red-600"
                                                onClick={() => handleDelete(q.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Option preview if needed */}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
