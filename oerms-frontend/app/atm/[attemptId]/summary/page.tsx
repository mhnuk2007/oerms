'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptResponse, ExamDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Clock, Trophy, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AttemptSummaryPage() {
    const params = useParams();
    const attemptId = params.attemptId as string;
    const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const attemptResponse = await apiClient.getAttempt(attemptId);
                const att = attemptResponse.data; // Extract the actual attempt data
                setAttempt(att);
                const examResponse = await apiClient.getExam(att.examId);
                const ex = examResponse.data || examResponse; // Extract exam data
                setExam(ex);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [attemptId]);

    if (loading) return <div>Loading...</div>;
    if (!attempt || !exam) return <div>Data not found</div>;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-12 text-center space-y-8">

                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Exam Submitted!</h1>
                    <p className="text-gray-500">Your attempt for <strong>{exam.title}</strong> has been recorded.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <p className="font-bold text-lg text-green-600">{attempt.status}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Score</p>
                        <p className="font-bold text-lg">
                            {attempt.obtainedMarks !== undefined ? `${attempt.obtainedMarks}/${attempt.totalMarks}` : 'Pending Grading'}
                        </p>
                    </div>
                </div>

                <div className="pt-8">
                    <Link href="/dashboard">
                        <Button size="lg" variant="primary">Return to Dashboard</Button>
                    </Link>
                </div>

            </div>
        </DashboardLayout>
    );
}
