// File: components/exam/QuestionPalette.tsx
'use client';

import { cn } from '@/lib/utils';
import { StudentQuestionDTO } from '@/lib/types';

interface QuestionPaletteProps {
  questions: StudentQuestionDTO[];
  currentIndex: number;
  answers: Record<string, { options?: string[]; text?: string; flagged: boolean }>;
  onQuestionSelect: (index: number) => void;
}

export function QuestionPalette({ 
  questions, 
  currentIndex, 
  answers, 
  onQuestionSelect 
}: QuestionPaletteProps) {
  return (
    <div 
      role="navigation" 
      aria-label="Question navigation"
      className="grid grid-cols-5 gap-2 p-4"
    >
      {questions.map((q, idx) => {
        const ans = answers[q.id];
        const isAnswered = ans?.options?.length || ans?.text?.trim();
        const isFlagged = ans?.flagged;
        const isCurrent = idx === currentIndex;
        
        return (
          <button
            key={q.id}
            onClick={() => onQuestionSelect(idx)}
            aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={cn(
              "aspect-square rounded-md text-sm font-bold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isCurrent && "ring-2 ring-blue-500 z-10",
              isFlagged && "bg-amber-500 text-white",
              !isFlagged && isAnswered && "bg-green-500 text-white",
              !isFlagged && !isAnswered && "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            )}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}