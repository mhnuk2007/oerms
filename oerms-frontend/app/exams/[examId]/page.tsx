'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { attemptService } from '@/lib/api/attempt';
import { examService } from '@/lib/api/exam';
import { ExamDTO, AttemptDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Clock, Trophy, AlertTriangle, Play, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

type StatusVariant = 'success' | 'info' | 'warning' | 'danger' | 'default';
function statusToBadgeVariant(status?: string): StatusVariant {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PUBLISHED':
    case 'ONGOING':
      return 'success';
    case 'SCHEDULED':
      return 'info';
    case 'CLOSED':
      return 'danger';
    default:
      return 'default';
  }
}

export default function StudentExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const [exam, setExam] = useState<ExamDTO | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<AttemptDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        console.log('Fetching exam:', examId);
        const response = await apiClient.getExam(examId);
        console.log('Exam response:', response);
        const data = response?.data || response;
        console.log('Exam data:', data);
        setExam(data);

        try {
          const attemptsResponse = await attemptService.getMyExamAttempts(examId, 0, 10);
          const attemptsPayload = (attemptsResponse as any)?.data || attemptsResponse;
          const attempts: AttemptDTO[] = attemptsPayload?.content || attemptsPayload || [];

          const inProgressAttempt = attempts.find(a => a.status === 'IN_PROGRESS');
          if (inProgressAttempt) setExistingAttempt(inProgressAttempt);
        } catch (err) {
          console.warn('Could not check existing attempts:', err);
        }
      } catch (err: any) {
        console.error('Failed to fetch exam:', err);
        if (err.status === 401 || err.status === 403) {
          if (user?.roles?.includes('ROLE_STUDENT')) {
            addToast('You can view available exams from the published exams page.', 'warning');
            router.push('/exams/published');
            return;
          }
          addToast('You do not have permission to view this exam.', 'error');
        } else {
          addToast('Failed to load exam details. Please try again.', 'error');
        }
        setExam(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    if (examId) fetchExam();
  }, [examId, user, router]);

  const handleStartExam = async () => {
    if (!examId) { addToast('Exam ID is missing', 'error'); return; }
    if (!exam?.status || !['PUBLISHED', 'ONGOING'].includes(exam.status.toUpperCase())) {
      addToast(`Exam is not available. Status: ${exam?.status}`, 'warning');
      return;
    }

    setStarting(true);
    try {
      const payload = await examService.startExam(examId);
      const attempt: AttemptDTO = (payload as any)?.attempt || payload;

      if (!attempt?.id) throw new Error('Invalid startExam response: missing attempt id');

      router.push(`/atm/${attempt.id}`);
    } catch (err: any) {
      console.error('Start exam failed - raw error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err || {}));
      console.error('Error toString:', err?.toString?.());
      console.error('Error constructor:', err?.constructor?.name);

      // Try to extract meaningful error information
      let errorMessage = 'Could not start exam.';
      let errorStatus = null;

      if (err?.message) {
        errorMessage = err.message;
        errorStatus = err.status;
      } else if (err?.details?.message) {
        errorMessage = err.details.message;
        errorStatus = err.status;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.toString && err.toString() !== '[object Object]') {
        errorMessage = err.toString();
      }

      console.error('Final error message:', errorMessage);
      console.error('Final error status:', errorStatus);

      if (errorStatus === 401) addToast('Please log in to start the exam.', 'warning');
      else if (errorStatus === 403) addToast('You do not have permission to start this exam.', 'error');
      else if (errorStatus === 409) addToast('You have already submitted or reached max attempts for this exam.', 'error');
      else if (errorStatus === 503) addToast('Exam service is unavailable. Please retry shortly.', 'warning');
      else addToast(errorMessage, 'error');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="inline-flex items-center text-gray-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700" />
            <Skeleton className="h-8 w-64" />
            <SkeletonText lines={2} className="w-full max-w-xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  if (!exam) return <DashboardLayout><div>Exam not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <Link href="/exams/published" className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Available Exams
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={statusToBadgeVariant(exam.status)} size="sm" dot>
                {exam.status}
              </Badge>
            </div>
            <p className="text-gray-500 max-w-xl mx-auto">{exam.description || <i>No description provided</i>}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl mx-auto text-left">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
              </div>
              <p className="font-bold text-lg">{exam.duration ? `${exam.duration} Minutes` : 'N/A'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Total Marks</span>
              </div>
              <p className="font-bold text-lg">{exam.totalMarks ?? 'N/A'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Pass Mark</span>
              </div>
              <p className="font-bold text-lg">{exam.passingMarks ?? 'N/A'}</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg p-4 text-left flex items-start gap-4 max-w-xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Important Instructions:</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>Once started, the timer cannot be paused.</li>
                <li>Ensure you have a stable internet connection.</li>
                <li>Do not refresh the page during the exam.</li>
                {exam.instructions && <li>{exam.instructions}</li>}
              </ul>
            </div>
          </div>

          <div className="pt-4">
            {existingAttempt ? (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>You have an ongoing attempt for this exam.</strong><br />
                    Started: {formatDate(existingAttempt.startedAt || existingAttempt.startTime)}
                  </p>
                </div>
                <Link href={`/atm/${existingAttempt.id}`}>
                  <Button
                    size="xl"
                    className="w-full max-w-sm text-lg gap-3 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Continue Exam
                    <Play className="w-5 h-5 fill-current" />
                  </Button>
                </Link>
              </div>
            ) : ['PUBLISHED', 'ONGOING'].includes(exam.status?.toUpperCase()) ? (
              <Button
                size="xl"
                className="w-full max-w-sm"
                isLoading={starting}
                rightIcon={!starting ? <Play className="w-5 h-5" /> : undefined}
                onClick={handleStartExam}
              >
                {starting ? 'Starting Exam...' : 'Start Assessment'}
              </Button>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400" role="alert" aria-live="assertive">
                <p className="font-semibold">Action Unavailable</p>
                <p className="text-sm mt-1">
                  Current Status: <span className="font-mono bg-white dark:bg-black px-1 rounded">{exam.status || 'Unknown'}</span>.
                  Expects: PUBLISHED or ONGOING.
                </p>
                <p className="text-xs mt-2 text-gray-500">
                  Make sure the exam is published by a teacher and you have the STUDENT role.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
