'use client';

import { useEffect, useState } from 'react';
import { ExamForm } from '@/components/exams/ExamForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ExamDTO } from '@/lib/types';

export default function EditExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId as string;
    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await apiClient.getExam(examId);
                const data = response.data || response;
                setExam(data);
            } catch (error) {
                console.error('Failed to fetch exam:', error);
                // router.push('/dashboard/exams'); // Redirect on error?
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExam();
        }
    }, [examId, router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Exam not found.</p>
                <Link href="/dashboard/exams">
                    <Button variant="outline" className="mt-4">Back to Exams</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/exams">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Exams
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Exam: {exam.title}
                </h1>
            </div>

            <ExamForm initialData={exam} isEditing />
        </div>
    );
}
