"use client";

import { useEffect, useState } from 'react';

interface ExamTimerProps {
  seconds: number;
  onExpire?: () => void;
  showWarning?: boolean;
  warningThreshold?: number; // seconds before warning
}

export default function ExamTimer({ 
  seconds, 
  onExpire, 
  showWarning = true,
  warningThreshold = 300 // 5 minutes
}: ExamTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    setRemaining(seconds);
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(t);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, onExpire]);

  useEffect(() => {
    if (showWarning) {
      setIsWarning(remaining <= warningThreshold && remaining > 60);
      setIsCritical(remaining <= 60 && remaining > 0);
    }
  }, [remaining, warningThreshold, showWarning]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const hours = Math.floor(remaining / 3600);

  const getTimerColor = () => {
    if (isCritical) return 'text-error-600 bg-error-50 border-error-200';
    if (isWarning) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-neutral-600 bg-neutral-50 border-neutral-200';
  };

  const getIconColor = () => {
    if (isCritical) return 'text-error-600';
    if (isWarning) return 'text-warning-600';
    return 'text-neutral-500';
  };

  const formatTime = () => {
    if (hours > 0) {
      return `${hours}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition-all duration-300 ${getTimerColor()}`}>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors ${getIconColor()}`}
      >
        <path 
          d="M12 7V12L15 14" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-mono text-sm font-medium">
        {formatTime()}
      </span>
      {isCritical && (
        <div className="w-2 h-2 bg-error-600 rounded-full animate-pulse"></div>
      )}
      {isWarning && !isCritical && (
        <div className="w-2 h-2 bg-warning-600 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}
