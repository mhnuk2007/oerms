'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptResponse, StudentQuestionDTO, SaveAnswerRequest } from '@/lib/types';
import { useAutosave } from '@/lib/hooks/use-autosave';
import { Loader2 } from 'lucide-react';
import ExamSidebar from '@/components/exam/ExamSidebar';
import QuestionPanel from '@/components/exam/QuestionPanel';

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.attemptId as string;

    const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
    const [questions, setQuestions] = useState<StudentQuestionDTO[]>([]);
    const [examTitle, setExamTitle] = useState('');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [answers, setAnswers] = useState<Record<string, { options?: string[], text?: string, flagged: boolean }>>({});

    // Enhanced autosave with better feedback
    const { saving, error: autosaveError, setPayload, saveNow } = useAutosave({
        saveFn: async (payload: SaveAnswerRequest) => {
            await apiClient.saveAnswer(attemptId, payload);
        },
        delay: 1500, // Save after 1.5 seconds of no changes
        onSaveError: (error) => {
            console.error('Autosave failed:', error);
            // Could show toast notification here
        }
    });

    useEffect(() => {
        const init = async () => {
            if (!attemptId) return;

            try {
                setLoading(true);

                // 1. Fetch attempt
                const attemptRes = await apiClient.getAttempt(attemptId);
                const att = attemptRes.data || attemptRes;
                setAttempt(att);

                if (att.status === 'SUBMITTED' || att.status === 'GRADED') {
                    router.replace(`/atm/${attemptId}/summary`);
                    return;
                }

                // 2. Fetch questions (primary + fallback)
                let qs: StudentQuestionDTO[] = [];
                try {
                    const questionsRes = await apiClient.getExamQuestionsForStudent(att.examId);
                    qs = questionsRes.data || questionsRes;
                } catch {
                    const fallback = await apiClient.getExamWithQuestions(att.examId);
                    const examData = fallback.data || fallback;
                    if (examData?.questions) {
                        qs = examData.questions.map((q: any, idx: number) => ({
                            id: q.id,
                            examId: att.examId,
                            questionText: q.questionText,
                            type: q.questionType || q.type,
                            marks: q.marks || 1,
                            orderIndex: idx,
                            options: q.options,
                            difficultyLevel: q.difficulty || 'MEDIUM'
                        }));
                    } else {
                        alert('No questions found for this exam.');
                    }
                }
                setQuestions(qs);

                // 3. Fetch existing answers
                try {
                    const existingAnswersRes = await apiClient.getAttemptAnswers(attemptId);
                    const existingAnswers = existingAnswersRes.data || existingAnswersRes;
                    const ansMap: any = {};
                    if (Array.isArray(existingAnswers)) {
                        existingAnswers.forEach((ans: any) => {
                            ansMap[ans.questionId] = {
                                options: ans.selectedOptions,
                                text: ans.answerText,
                                flagged: ans.flagged
                            };
                        });
                    }
                    setAnswers(ansMap);
                } catch (e) {
                    console.warn('Failed to load existing answers', e);
                }

                // 4. Fetch exam info for title/duration
                const examRes = await apiClient.getExam(att.examId);
                const ex = examRes.data || examRes;
                setExamTitle(ex.title);

                if (att.startedAt && ex.duration) {
                    const remaining = Math.max(0, Math.floor((new Date(att.startedAt).getTime() + ex.duration * 60000 - Date.now()) / 1000));
                    setTimeLeft(remaining);
                }
            } catch (error: any) {
                console.error('Failed to load exam data', error);

                // Don't show alert for session expired errors (handled by API client)
                if (error?.status !== 401 && error?.code !== 'SESSION_EXPIRED') {
                    alert(`Error loading exam: ${error?.message || 'Unknown error'}`);
                }
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [attemptId, router]);

    // Timer
    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev && prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Auto-submit
    useEffect(() => {
        if (timeLeft === 0 && attempt?.status === 'IN_PROGRESS') {
            handleSubmitExam();
        }
    }, [timeLeft, attempt]);

    // Update answers and trigger autosave
    const updateAnswer = (questionId: string, data: { options?: string[], text?: string, flagged?: boolean }) => {
        const updatedAnswer = {
            ...answers[questionId],
            ...data,
            flagged: data.flagged ?? answers[questionId]?.flagged ?? false
        };

        setAnswers(prev => ({
            ...prev,
            [questionId]: updatedAnswer
        }));

        // Trigger autosave
        const payload: SaveAnswerRequest = {
            questionId,
            selectedOptions: updatedAnswer.options,
            answerText: updatedAnswer.text,
            flagged: updatedAnswer.flagged
        };
        setPayload(payload);
    };

    const handleOptionSelect = (option: string, type: 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE') => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        const currentAns = answers[currentQ.id];
        const currentOptions = currentAns?.options || [];

        if (type === 'MULTIPLE_ANSWER') {
            const newOptions = currentOptions.includes(option)
                ? currentOptions.filter(opt => opt !== option)
                : [...currentOptions, option];
            updateAnswer(currentQ.id, { options: newOptions });
        } else {
            updateAnswer(currentQ.id, { options: [option] });
        }
    };

    const handleTextChange = (text: string) => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        updateAnswer(currentQ.id, { text });
    };

    const toggleFlag = () => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        const currentAns = answers[currentQ.id];
        updateAnswer(currentQ.id, { flagged: !currentAns?.flagged });
    };

    const handleSubmitExam = async () => {
        if (!confirm('Are you sure you want to submit?')) return;
        setSubmitting(true);
        try {
            await apiClient.submitAttempt({ attemptId });
            router.push(`/atm/${attemptId}/summary`);
        } catch (e: any) {
            console.error('Submit failed', e);
            alert(e?.message || 'Failed to submit exam.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                </div>
            </div>
        );
    }

    if (!attempt || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <div className="text-red-500 text-2xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Exam Unavailable</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">No questions available for this exam.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const currentAns = currentQ ? answers[currentQ.id] : undefined;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <ExamSidebar
                        examTitle={examTitle}
                        questions={questions}
                        answers={answers}
                        currentIndex={currentIndex}
                        timeLeft={timeLeft}
                        onNavigate={setCurrentIndex}
                        onSubmit={handleSubmitExam}
                    />

                    <QuestionPanel
                        question={currentQ}
                        answer={currentAns}
                        index={currentIndex}
                        total={questions.length}
                        saving={saving}
                        timeLeft={timeLeft}
                        onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
                        onNext={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                        onFlag={toggleFlag}
                        onOptionSelect={handleOptionSelect}
                        onTextChange={handleTextChange}
                    />
                </div>
            </div>
        </div>
    );
}
