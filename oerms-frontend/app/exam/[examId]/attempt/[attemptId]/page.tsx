'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { AttemptResponse, StudentQuestionDTO, SaveAnswerRequest, AttemptStatus } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Loader2, Flag, ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.examId as string;
    const attemptId = params.attemptId as string;

    // Data State
    const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
    const [questions, setQuestions] = useState<StudentQuestionDTO[]>([]);
    const [examTitle, setExamTitle] = useState('');

    // UI State
    const [currentIndices, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Answers State: Map<questionId, { answer: any, flagged: boolean }>
    const [answers, setAnswers] = useState<Record<string, { options?: string[], text?: string, flagged: boolean }>>({});

    // Refs for debouncing
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const unsavedCountRef = useRef(0);
    const paletteRef = useRef<HTMLDivElement | null>(null);
    const PALETTE_COLS = 5; // Keep in sync with CSS grid columns

    // Initialize
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // 1. Get Attempt
                const attemptResponse = await apiClient.getAttempt(attemptId);
                const att = attemptResponse.data; // Extract the actual attempt data
                console.log('Attempt data extracted:', att);
                console.log('Exam ID:', att?.examId);
                setAttempt(att);

                if (att.status === 'SUBMITTED' || att.status === 'GRADED') {
                    router.replace(`/atm/${attemptId}/summary`);
                    return;
                }

                // 2. Get Questions for Student
                console.log('🔍 Step 2: Loading questions for examId:', att.examId);

                // Use the question service endpoint for students (questions without answers)
                try {
                    console.log('Loading student questions...');
                    const questionsResponse = await apiClient.getExamQuestionsForStudent(att.examId);
                    console.log('Student questions response:', questionsResponse);
                    const questionsData = questionsResponse.data || questionsResponse;
                    console.log('Questions data:', questionsData);

                    if (questionsData && Array.isArray(questionsData) && questionsData.length > 0) {
                        console.log('Found student questions:', questionsData.length);

                        // Log first question to debug structure
                        console.log('First question structure:', questionsData[0]);

                        // Transform to StudentQuestionDTO format (should already be in correct format)
                        const studentQuestions = questionsData.map((q: any, index: number) => ({
                            id: q.id || `q_${index}`,
                            examId: att.examId,
                            questionText: q.questionText || q.text || 'Question text not available',
                            type: q.type || 'MCQ',
                            marks: q.marks || 1,
                            orderIndex: q.orderIndex || index,
                            options: q.options || [],
                            difficultyLevel: q.difficultyLevel || 'MEDIUM'
                        }));

                        console.log('Transformed student questions:', studentQuestions.length);
                        console.log('First transformed question:', studentQuestions[0]);

                        setQuestions(studentQuestions);
                        console.log('✅ Questions loaded successfully - setting', studentQuestions.length, 'questions');
                    } else {
                        console.error('❌ No questions found for student. Response:', questionsData);
                        setQuestions([]);
                        alert('This exam has no questions. Please contact your instructor.\n\nDebug: Check console for API response details.');
                    }
                } catch (error: any) {
                    console.error('❌ Failed to load exam questions:', error);
                    console.error('Error details:', {
                        message: error?.message,
                        status: error?.status,
                        url: error?.url,
                        response: error
                    });
                    setQuestions([]);

                    // Don't show alert on first load - let user see the page and retry
                    console.warn('⚠️ Question loading failed - user can retry or contact instructor');
                }

                // 3. Get Existing Answers (Resume capability)
                try {
                    const existingAnswersResponse = await apiClient.getAttemptAnswers(attemptId);
                    const existingAnswers = existingAnswersResponse.data || existingAnswersResponse;
                    // Needs mapping from API response to local state
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
                    console.warn('Could not load existing answers', e);
                }

                // 4. Get Exam for Title/Duration
                const examResponse = await apiClient.getExam(att.examId);
                const ex = examResponse.data || examResponse;
                setExamTitle(ex.title);

                // Calculate Time Left
                if (att.startedAt && ex.duration) {
                    const start = new Date(att.startedAt).getTime();
                    const durationMs = ex.duration * 60 * 1000;
                    const end = start + durationMs;
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((end - now) / 1000));
                    setTimeLeft(remaining);
                }

            } catch (error: any) {
                console.error('Failed to load exam:', error);
                console.error('Error details:', {
                    message: error?.message,
                    status: error?.status,
                    details: error?.details,
                    attemptId,
                    examId: attempt?.examId
                });
                alert(`Failed to load exam data: ${error?.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };
        if (attemptId) init();
    }, [attemptId, router]);

    // Timer Tick
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Auto-Submit on Timeout
    useEffect(() => {
        if (timeLeft === 0 && attempt?.status === 'IN_PROGRESS') {
            handleSubmitExam();
        }
    }, [timeLeft, attempt]);

    // Save Answer Logic
    const saveAnswer = async (questionId: string, data: { options?: string[], text?: string, flagged?: boolean }) => {
        // Optimistic update
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                ...data,
                flagged: data.flagged ?? prev[questionId]?.flagged ?? false
            }
        }));
        // Mark as dirty for beforeunload protection
        unsavedCountRef.current += 1;
        setSaving(true);

        // Debounce
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const payload: SaveAnswerRequest = {
                    questionId,
                    selectedOptions: data.options,
                    answerText: data.text,
                    flagged: data.flagged,
                    // timeSpent could be tracked per question, but simplifying for now
                };
                await apiClient.saveAnswer(attemptId, payload);
            } catch (err) {
                console.error('Auto-save failed', err);
            } finally {
                // Mark saved
                unsavedCountRef.current = Math.max(0, unsavedCountRef.current - 1);
                setSaving(false);
            }
        }, 1000); // 1s debounce
    };

    // Warn before unload/navigation when there are unsaved changes
    useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent) => {
            if (unsavedCountRef.current > 0 && attempt?.status === 'IN_PROGRESS') {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
            return undefined;
        };

        const onPopState = (e: PopStateEvent) => {
            if (unsavedCountRef.current > 0 && attempt?.status === 'IN_PROGRESS') {
                const leave = confirm('You have unsaved changes. Are you sure you want to leave?');
                if (!leave) {
                    // Push state back so user stays on page
                    history.pushState(null, document.title, location.href);
                }
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement;
            const tag = active?.tagName?.toLowerCase();
            // Ignore while typing in inputs or textareas
            if (tag === 'input' || tag === 'textarea' || (active as HTMLElement)?.isContentEditable) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentIndex((prev) => Math.max(0, prev - 1));
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
            }
            if (e.key === ' ' || e.code === 'Space') {
                // Toggle/select first option if none selected
                e.preventDefault();
                const opts = document.querySelectorAll<HTMLInputElement>('input[name="question-option"]');
                if (opts && opts.length > 0) {
                    const first = opts[0];
                    first.click();
                }
            }
        };

        window.addEventListener('beforeunload', beforeUnload);
        window.addEventListener('popstate', onPopState);
        window.addEventListener('keydown', onKeyDown);

        // Push a dummy state so popstate has something to revert to
        history.pushState(null, document.title, location.href);

        return () => {
            window.removeEventListener('beforeunload', beforeUnload);
            window.removeEventListener('popstate', onPopState);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [attempt, questions.length]);

    const handleOptionSelect = (option: string, type: 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE') => {
        const currentQ = questions[currentIndices];
        if (!currentQ) return;

        const currentAns = answers[currentQ.id];
        const currentOptions = currentAns?.options || [];

        if (type === 'MULTIPLE_ANSWER') {
            // Toggle the option in the array
            const newOptions = currentOptions.includes(option)
                ? currentOptions.filter(opt => opt !== option)
                : [...currentOptions, option];
            saveAnswer(currentQ.id, { options: newOptions });
        } else {
            // For single choice types
            saveAnswer(currentQ.id, { options: [option] });
        }
    };

    const handleTextChange = (text: string) => {
        const currentQ = questions[currentIndices];
        if (!currentQ) return;
        saveAnswer(currentQ.id, { text });
    };

    const toggleFlag = () => {
        const currentQ = questions[currentIndices];
        if (!currentQ) return;
        const currentAns = answers[currentQ.id];
        saveAnswer(currentQ.id, { flagged: !currentAns?.flagged });
    };

    const handleSubmitExam = async () => {
        if (!confirm('Are you sure you want to submit? You cannot undo this action.')) return;
        setSubmitting(true);
        try {
            await apiClient.submitAttempt({ attemptId });
            router.push(`/atm/${attemptId}/summary`);
        } catch (error) {
            alert('Failed to submit exam.');
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
        return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    const currentQ = questions[currentIndices];
    const currentAns = currentQ ? answers[currentQ.id] : undefined;

    if (questions.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-4 p-4 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Flag className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">No Questions in Exam</h1>
                <p className="text-gray-500 max-w-md">This exam appears to be empty. Please contact your instructor.</p>
                <div className="flex gap-4 mt-4">
                    <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                    <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
                </div>
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded text-xs text-left font-mono text-gray-400 w-full max-w-lg overflow-auto">
                    DEBUG: Exam ID {attempt?.examId} | Attempt ID {attemptId}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col md:flex-row overflow-hidden">
            {/* Sidebar - Question Navigator */}
            <aside className="w-full md:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg truncate" title={examTitle}>{examTitle}</h2>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                        <span>{questions.length} Questions</span>
                        <span>{Object.keys(answers).length} Answered</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div id="palette-legend" className="mb-3 text-xs text-gray-700">
                        <span className="mr-3"><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 align-middle" aria-hidden="true"></span>Current</span>
                        <span className="mr-3"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 align-middle" aria-hidden="true"></span>Answered</span>
                        <span className="mr-3"><span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1 align-middle" aria-hidden="true"></span>Not answered</span>
                        <span className="mr-3"><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1 align-middle" aria-hidden="true"></span>Flagged</span>
                    </div>

                    <div
                        ref={paletteRef}
                        onKeyDown={(e) => {
                            // handleKeyDown placed inline to capture latest questions length
                            const container = paletteRef.current;
                            if (!container) return;
                            const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button[data-q-index]'));
                            const active = document.activeElement as HTMLButtonElement | null;
                            const idx = buttons.findIndex(b => b === active);
                            if (e.key === 'ArrowRight') {
                                e.preventDefault();
                                const next = Math.min(buttons.length - 1, Math.max(0, idx + 1));
                                buttons[next]?.focus();
                            } else if (e.key === 'ArrowLeft') {
                                e.preventDefault();
                                const prev = Math.max(0, (idx === -1 ? 0 : idx) - 1);
                                buttons[prev]?.focus();
                            } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const down = Math.min(buttons.length - 1, (idx === -1 ? 0 : idx) + PALETTE_COLS);
                                buttons[down]?.focus();
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const up = Math.max(0, (idx === -1 ? 0 : idx) - PALETTE_COLS);
                                buttons[up]?.focus();
                            }
                        }}
                        role="list"
                        aria-label="Question palette"
                        aria-describedby="palette-legend"
                        tabIndex={0}
                        className="grid grid-cols-5 gap-2"
                    >
                        {questions.map((q, idx) => {
                            const ans = answers[q.id];
                            const isAnswered = ans?.options?.length || ans?.text;
                            const isFlagged = ans?.flagged;
                            const isCurrent = idx === currentIndices;

                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    data-q-index={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ', not answered'}${isFlagged ? ', flagged for review' : ''}`}
                                    aria-current={isCurrent ? 'true' : undefined}
                                    className={cn(
                                        "aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500",
                                        isCurrent ? "ring-2 ring-blue-500 z-10" : "",
                                        isFlagged ? "bg-amber-100 text-amber-700 border border-amber-300" :
                                            isAnswered ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                                "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                                    )}
                                >
                                    <span className="sr-only">Go to question {idx + 1}</span>
                                    <span aria-hidden="true">{idx + 1}</span>
                                    {isFlagged && <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                            <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-2 shadow-sm">
                            <Clock className={cn("w-4 h-4", timeLeft && timeLeft < 300 ? "text-red-500 animate-pulse" : "text-gray-700")} />
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
                {/* Mobile Header (Timer & Menu toggle could go here) */}

                {/* Scrollable Question Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Question {currentIndices + 1} of {questions.length}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 capitalize bg-white px-2 py-1 rounded border">{saving ? 'Saving...' : 'Saved'}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFlag}
                                    className={cn(currentAns?.flagged ? "text-amber-600 bg-amber-50" : "text-gray-700")}
                                >
                                    <Flag className={cn("w-4 h-4 mr-2", currentAns?.flagged && "fill-current")} />
                                    {currentAns?.flagged ? 'Flagged' : 'Flag for Review'}
                                </Button>
                            </div>
                        </div>

                        {/* Question Card */}
                        <Card className="p-6 md:p-8 shadow-md border-0 bg-white dark:bg-gray-800">
                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                                <strong>DEBUG:</strong> Question ID: {currentQ?.id} | Type: {currentQ?.type} | Options: {currentQ?.options?.length || 0}
                                <br />
                                Raw question object: {JSON.stringify(currentQ, null, 2)}
                            </div>
                            <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
                                {currentQ?.questionText || 'Question text not found'}
                            </p>

                            {/* Options / Input */}
                            <div className="space-y-4">
                                {(currentQ?.type === 'MCQ' || currentQ?.type === 'TRUE_FALSE') && (
                                    currentQ.options && currentQ.options.length > 0 ? (
                                        currentQ.options.map((opt, idx) => (
                                            <label
                                                key={idx}
                                                className={cn(
                                                    "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50",
                                                    currentAns?.options?.includes(opt)
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-gray-100 dark:border-gray-700"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="question-option"
                                                    checked={currentAns?.options?.includes(opt) || false}
                                                    onChange={() => handleOptionSelect(opt, currentQ.type as any)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4"
                                                />
                                                <span className="text-base text-gray-700 dark:text-gray-200">{opt || `Option ${idx + 1} (empty)`}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded">
                                            <p className="text-red-800 dark:text-red-200">No options found for this question</p>
                                        </div>
                                    )
                                )}

                                {currentQ?.type === 'MULTIPLE_ANSWER' && currentQ.options?.map((opt, idx) => (
                                    <label
                                        key={idx}
                                        className={cn(
                                            "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50",
                                            currentAns?.options?.includes(opt)
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-100 dark:border-gray-700"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            name="question-option"
                                            checked={currentAns?.options?.includes(opt) || false}
                                            onChange={() => handleOptionSelect(opt, currentQ.type as any)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4"
                                        />
                                        <span className="text-base text-gray-700 dark:text-gray-200">{opt}</span>
                                    </label>
                                ))}

                                {currentQ?.type === 'SHORT_ANSWER' && (
                                    <textarea
                                        value={currentAns?.text || ''}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
                                        placeholder="Type your answer here..."
                                    />
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center max-w-full">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndices === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIndices === questions.length - 1}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
