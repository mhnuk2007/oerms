'use client';

import { ExamForm } from '@/components/exams/ExamForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CreateExamPage() {
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
                    Create New Exam
                </h1>
            </div>

            <ExamForm />
        </div>
    );
}
