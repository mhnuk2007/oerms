'use client';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';

interface ExamSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    questions: any[];
    answers: Record<string, any>;
    isSubmitting: boolean;
}

export function ExamSummaryModal({ isOpen, onClose, onSubmit, questions, answers, isSubmitting }: ExamSummaryModalProps) {
    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;
    const unanswered = questions.filter(q => !answers[q.id]);

    return (
        <Modal open={isOpen} onClose={onClose} title="Ready to Submit?" size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{answeredCount}</div>
                        <div className="text-sm text-green-800 dark:text-green-300 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Answered
                        </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalCount - answeredCount}</div>
                        <div className="text-sm text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
                            <Circle className="w-4 h-4" /> Unanswered
                        </div>
                    </div>
                </div>

                {unanswered.length > 0 ? (
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            You have skipped {unanswered.length} questions:
                        </h4>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {unanswered.map((q) => (
                                <span key={q.id} className="px-2 py-1 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs rounded font-medium">
                                    Q{q.orderIndex + 1}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-center text-blue-800 dark:text-blue-300">
                        Great job! You've answered all questions.
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Keep Reviewing</Button>
                    <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>
                        Confirm & Submit
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
