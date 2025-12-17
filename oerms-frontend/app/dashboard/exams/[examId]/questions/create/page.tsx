'use client';

import { QuestionForm } from '@/components/questions/QuestionForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';

export default function CreateQuestionPage() {
    const params = useParams();
    const examId = params.examId as string;

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
                    Add New Question
                </h1>
            </div>

            <QuestionForm examId={examId} />
        </div>
    );
}
