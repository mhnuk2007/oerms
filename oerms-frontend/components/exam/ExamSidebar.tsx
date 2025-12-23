'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ExamSidebarProps {
  examTitle: string;
  questions: any[];
  answers: Record<string, any>;
  currentIndex: number;
  timeLeft: number | null;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function QuestionTile({ idx, state, active, onClick }: any) {
  const base = "w-10 h-10 rounded-md text-sm flex items-center justify-center font-medium transition-all";
  const bg =
    state === "flagged" ? "bg-amber-100 text-amber-800 border border-amber-300" :
    state === "answered" ? "bg-blue-100 text-blue-800 border border-blue-200" :
    "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200";

  return (
    <button
      aria-label={`Question ${idx + 1} ${state}`}
      onClick={onClick}
      className={cn(base, bg, active && "ring-2 ring-blue-500 z-10")}
    >
      {idx + 1}
    </button>
  );
}

export default function ExamSidebar({
  examTitle,
  questions,
  answers,
  currentIndex,
  timeLeft,
  onNavigate,
  onSubmit
}: ExamSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("flex flex-col bg-white dark:bg-gray-800 border-r transition-all duration-300 shadow-sm", collapsed ? "w-16" : "w-72")}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <div className={cn("min-w-0", collapsed && "hidden")}>
          <h2 className="font-bold text-gray-900 dark:text-white truncate">{examTitle}</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span>{questions.length} Questions</span> · <span>{Object.keys(answers).length} Answered</span>
          </div>
        </div>
        <button
          aria-pressed={collapsed}
          onClick={() => setCollapsed(s => !s)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className={cn("w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform", collapsed ? "rotate-180" : "")} viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-5 gap-3">
          {questions.map((q: any, idx: number) => {
            const ans = answers[q.id];
            const state = ans?.flagged ? "flagged" : (ans?.options?.length || ans?.text) ? "answered" : "unanswered";
            return (
              <QuestionTile
                key={q.id}
                idx={idx}
                state={state}
                active={idx === currentIndex}
                onClick={() => onNavigate(idx)}
              />
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className={cn("text-center mb-4", collapsed && "hidden")}>
          <span aria-live="polite" className="font-mono text-xl font-bold text-gray-900 dark:text-white">
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time Remaining</p>
        </div>
        <Button
          onClick={onSubmit}
          className={cn("w-full", collapsed && "px-2")}
          variant="primary"
        >
          {collapsed ? "Submit" : "Finish Exam"}
        </Button>
      </div>
    </aside>
  );
}
