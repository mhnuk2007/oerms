// File: components/exam/SubmitExamModal.tsx (NEW FILE - Controlled Component)
'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface SubmitExamModalProps {
  isOpen: boolean;
  questionsAnswered: number;
  totalQuestions: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmitExamModal({
  isOpen,
  questionsAnswered,
  totalQuestions,
  onConfirm,
  onCancel
}: SubmitExamModalProps) {
  if (!isOpen) return null;
  
  const unanswered = totalQuestions - questionsAnswered;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Submit Exam?
          </h2>
        </div>
        
        <div className="mb-6 space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            You have answered <strong>{questionsAnswered}</strong> out of <strong>{totalQuestions}</strong> questions.
          </p>
          {unanswered > 0 && (
            <p className="text-orange-600 font-medium">
              ⚠️ {unanswered} question{unanswered > 1 ? 's' : ''} remain unanswered.
            </p>
          )}
          <p className="text-sm text-gray-500">
            Once submitted, you cannot change your answers.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Review Answers
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            className="flex-1"
          >
            Submit Now
          </Button>
        </div>
      </div>
    </div>
  );
}