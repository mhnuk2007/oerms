'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { QuestionDTO } from '@/lib/types';
import { QuestionForm } from '@/components/questions/QuestionForm';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditQuestionPage() {
    const params = useParams();
    const examId = params.examId as string;
    const questionId = params.questionId as string;
    const [question, setQuestion] = useState<QuestionDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const data = await apiClient.getQuestion(questionId);
                setQuestion(data);
            } catch (error) {
                console.error('Failed to fetch question:', error);
            } finally {
                setLoading(false);
            }
        };
        if (questionId) fetchQuestion();
    }, [questionId]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    if (!question) return <div>Question not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/exams/${examId}/questions`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Questions
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Question
                </h1>
            </div>

            <QuestionForm examId={examId} initialData={question} isEditing />
        </div>
    );
}
