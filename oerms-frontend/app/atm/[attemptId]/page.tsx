'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptResponse, StudentQuestionDTO, SaveAnswerRequest } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Loader2, Flag, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.attemptId as string;

    const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
    const [questions, setQuestions] = useState<StudentQuestionDTO[]>([]);
    const [examTitle, setExamTitle] = useState('');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const [answers, setAnswers] = useState<Record<string, { options?: string[], text?: string, flagged: boolean }>>({});
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                alert(`Error loading exam: ${error?.message || 'Unknown error'}`);
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

    const saveAnswer = async (questionId: string, data: { options?: string[], text?: string, flagged?: boolean }) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], ...data, flagged: data.flagged ?? prev[questionId]?.flagged ?? false }
        }));

        setSaving(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const payload: SaveAnswerRequest = { questionId, selectedOptions: data.options, answerText: data.text, flagged: data.flagged };
                await apiClient.saveAnswer(attemptId, payload);
            } catch (e) {
                console.error('Auto-save failed', e);
            } finally {
                setSaving(false);
            }
        }, 1000);
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
            saveAnswer(currentQ.id, { options: newOptions });
        } else {
            saveAnswer(currentQ.id, { options: [option] });
        }
    };

    const handleTextChange = (text: string) => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        saveAnswer(currentQ.id, { text });
    };

    const toggleFlag = () => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        const currentAns = answers[currentQ.id];
        saveAnswer(currentQ.id, { flagged: !currentAns?.flagged });
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

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    if (!attempt || questions.length === 0) return <div className="h-screen flex flex-col items-center justify-center">No questions available.</div>;

    const currentQ = questions[currentIndex];
    const currentAns = currentQ ? answers[currentQ.id] : undefined;

    return (
        <div className="flex h-screen flex-col md:flex-row overflow-hidden">
            <aside className="w-full md:w-72 bg-white dark:bg-gray-800 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold truncate">{examTitle}</h2>
                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                        <span>{questions.length} Questions</span>
                        <span>{Object.keys(answers).length} Answered</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => {
                            const ans = answers[q.id];
                            const isAnswered = ans?.options?.length || ans?.text;
                            const isFlagged = ans?.flagged;
                            const isCurrent = idx === currentIndex;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-all relative",
                                        isCurrent ? "ring-2 ring-blue-500 z-10" : "",
                                        isFlagged ? "bg-amber-100 text-amber-700 border border-amber-300" :
                                            isAnswered ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                                "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                                    )}
                                >
                                    {idx + 1}
                                    {isFlagged && <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-sm">
                            <Clock className={cn("w-4 h-4", timeLeft && timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-500")} />
                            <span className={cn("font-mono font-bold text-lg", timeLeft && timeLeft < 300 ? "text-red-600" : "text-gray-900 dark:text-gray-100")}>
                                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                            </span>
                        </div>
                    </div>
                    <Button onClick={handleSubmitExam} className="w-full" variant="primary">
                        Finish Exam
                    </Button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 capitalize bg-white px-2 py-1 rounded border">{saving ? 'Saving...' : 'Saved'}</span>
                                <Button variant="ghost" size="sm" onClick={toggleFlag} className={cn(currentAns?.flagged ? "text-amber-600 bg-amber-50" : "text-gray-500")}>
                                    <Flag className="w-4 h-4 mr-2" />
                                    {currentAns?.flagged ? 'Flagged' : 'Flag for Review'}
                                </Button>
                            </div>
                        </div>

                        <Card className="p-6 md:p-8 shadow-md border-0 bg-white dark:bg-gray-800">
                            <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
                                {currentQ?.questionText || 'Question text not found'}
                            </p>

                            <div className="space-y-4">
                                {(currentQ?.type === 'MCQ' || currentQ?.type === 'TRUE_FALSE') && currentQ.options?.map((opt, idx) => (
                                    <label key={idx} className={cn("flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50",
                                        currentAns?.options?.includes(opt) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-gray-700"
                                    )}>
                                        <input type="radio" name="question-option" checked={currentAns?.options?.includes(opt) || false} onChange={() => handleOptionSelect(opt, currentQ.type as any)} className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4" />
                                        <span className="text-base text-gray-700 dark:text-gray-200">{opt}</span>
                                    </label>
                                ))}

                                {currentQ?.type === 'MULTIPLE_ANSWER' && currentQ.options?.map((opt, idx) => (
                                    <label key={idx} className={cn("flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50",
                                        currentAns?.options?.includes(opt) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-100 dark:border-gray-700"
                                    )}>
                                        <input type="checkbox" checked={currentAns?.options?.includes(opt) || false} onChange={() => handleOptionSelect(opt, currentQ.type as any)} className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4" />
                                        <span className="text-base text-gray-700 dark:text-gray-200">{opt}</span>
                                    </label>
                                ))}

                                {currentQ?.type === 'SHORT_ANSWER' && (
                                    <textarea value={currentAns?.text || ''} onChange={(e) => handleTextChange(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]" placeholder="Type your answer here..." />
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 border-t flex justify-between items-center max-w-full">
                    <Button variant="outline" onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>

                    <Button variant="primary" onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentIndex === questions.length - 1}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
