'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExamTimerProps {
    /** Duration in minutes */
    durationMinutes: number;
    /** Start time ISO string */
    startTime: string;
    /** Called when timer reaches zero */
    onTimeUp?: () => void;
    /** Called every second with remaining seconds */
    onTick?: (remainingSeconds: number) => void;
    /** Optional class name */
    className?: string;
}

export function ExamTimer({
    durationMinutes,
    startTime,
    onTimeUp,
    onTick,
    className = '',
}: ExamTimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        const startMs = new Date(startTime).getTime();
        const endMs = startMs + durationMinutes * 60 * 1000;
        const nowMs = Date.now();
        return Math.max(0, Math.floor((endMs - nowMs) / 1000));
    });

    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);

    useEffect(() => {
        if (remainingSeconds <= 0) {
            onTimeUp?.();
            return;
        }

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                const next = prev - 1;
                onTick?.(next);

                // Set warning states
                setIsWarning(next <= 300 && next > 60); // 5 min warning
                setIsCritical(next <= 60); // 1 min critical

                if (next <= 0) {
                    onTimeUp?.();
                    clearInterval(interval);
                }
                return Math.max(0, next);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingSeconds, onTimeUp, onTick]);

    const formatTime = useCallback((totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const getTimerStyles = () => {
        if (isCritical) {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 animate-pulse';
        }
        if (isWarning) {
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
        }
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    };

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-mono ${getTimerStyles()} ${className}`}
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span className="text-lg font-bold tabular-nums">
                {formatTime(remainingSeconds)}
            </span>
            {isCritical && (
                <span className="text-xs font-medium uppercase tracking-wide">
                    Hurry!
                </span>
            )}
        </div>
    );
}

export default ExamTimer;
