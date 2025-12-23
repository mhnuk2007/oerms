'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionPanelProps {
  question: any;
  answer: any;
  index: number;
  total: number;
  saving: boolean;
  timeLeft: number | null;
  onPrev: () => void;
  onNext: () => void;
  onFlag: () => void;
  onOptionSelect: (option: string, type: 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE') => void;
  onTextChange: (text: string) => void;
}

function Option({ id, label, checked, onChange, type }: any) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-200",
        checked
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-600"
      )}
    >
      <input
        id={id}
        name="option"
        type={type}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
        aria-checked={checked}
      />
      <span className="text-base text-gray-700 dark:text-gray-200">{label}</span>
    </label>
  );
}

export default function QuestionPanel({
  question,
  answer,
  index,
  total,
  saving,
  onPrev,
  onNext,
  onFlag,
  onOptionSelect,
  onTextChange
}: QuestionPanelProps) {
  if (!question) {
    return (
      <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-center py-12">
            <div className="text-2xl mb-4">📋</div>
            <p>Question not found</p>
          </div>
        </div>
      </main>
    );
  }

  const progressPercent = ((index + 1) / total) * 100;

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Question {index + 1} of {total}</div>
          <div className="w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
            {saving ? "Saving..." : "Saved"}
          </span>
          <button
            onClick={onFlag}
            aria-pressed={answer?.flagged}
            className={cn(
              "text-sm px-3 py-1.5 rounded-md transition-colors border",
              answer?.flagged
                ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            )}
          >
            <Flag className="w-4 h-4 inline mr-1" />
            {answer?.flagged ? "Flagged" : "Flag"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 id="question-label" className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white leading-relaxed">
              {question.questionText || 'Question text not found'}
            </h3>

            {question.type === "SHORT_ANSWER" ? (
              <textarea
                value={answer?.text || ""}
                onChange={e => onTextChange(e.target.value)}
                className="w-full min-h-[150px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                aria-label="Short answer"
                placeholder="Type your answer here..."
              />
            ) : (
              <div className="space-y-4" role="radiogroup" aria-labelledby="question-label">
                {question.options?.map((opt: string, idx: number) => (
                  <Option
                    key={idx}
                    id={`opt-${idx}`}
                    label={opt}
                    type={question.type === "MULTIPLE_ANSWER" ? "checkbox" : "radio"}
                    checked={answer?.options?.includes(opt) || false}
                    onChange={() => onOptionSelect(opt, question.type)}
                  />
                ))}
              </div>
            )}
          </article>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center shadow-sm">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={index === 0}
          className="flex items-center gap-2 px-6 py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {/* Quick save draft if needed */}}
            className="px-6 py-2"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            disabled={index === total - 1}
            className="flex items-center gap-2 px-6 py-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
