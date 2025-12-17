// lib/hooks/use-auto-save.ts - Auto-save hook for exam attempts

import { useEffect, useRef } from 'react';
import { attemptService } from '@/lib/api/attempt';

interface AutoSaveOptions {
  attemptId: string;
  answers: Record<string, any>;
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: (saved: boolean) => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  attemptId,
  answers,
  enabled = true,
  interval = 10000, // 10 seconds default
  onSave,
  onError
}: AutoSaveOptions) {
  const lastSavedAnswers = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !attemptId) return;

    const currentAnswers = JSON.stringify(answers);

    // Only save if answers have changed
    if (currentAnswers === lastSavedAnswers.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return; // Prevent concurrent saves

      try {
        isSavingRef.current = true;

        // Prepare save promises for all answers
        const savePromises = Object.entries(answers).map(([questionId, answer]) => {
          const saveData = {
            questionId,
            selectedOptions: answer.selectedOptions || [],
            answerText: answer.answerText || '',
            flagged: answer.flagged || false,
            timeSpentSeconds: answer.timeSpent || 0
          };

          return attemptService.saveAnswer(attemptId, saveData);
        });

        // Save all answers concurrently
        await Promise.all(savePromises);

        // Update last saved state
        lastSavedAnswers.current = currentAnswers;

        // Call success callback
        onSave?.(true);

      } catch (error) {
        console.error('Auto-save failed:', error);
        onError?.(error instanceof Error ? error : new Error('Auto-save failed'));
      } finally {
        isSavingRef.current = false;
      }
    }, interval);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [attemptId, answers, enabled, interval, onSave, onError]);

  // Manual save function
  const saveNow = async (): Promise<boolean> => {
    if (!enabled || !attemptId || isSavingRef.current) {
      return false;
    }

    try {
      isSavingRef.current = true;

      const savePromises = Object.entries(answers).map(([questionId, answer]) =>
        attemptService.saveAnswer(attemptId, {
          questionId,
          selectedOptions: answer.selectedOptions || [],
          answerText: answer.answerText || '',
          flagged: answer.flagged || false,
          timeSpentSeconds: answer.timeSpent || 0
        })
      );

      await Promise.all(savePromises);

      lastSavedAnswers.current = JSON.stringify(answers);
      onSave?.(true);

      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      onError?.(error instanceof Error ? error : new Error('Manual save failed'));
      return false;
    } finally {
      isSavingRef.current = false;
    }
  };

  // Force immediate save (useful before exam submission)
  const forceSave = async (): Promise<boolean> => {
    // Clear any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return saveNow();
  };

  return {
    saveNow,
    forceSave,
    isSaving: isSavingRef.current
  };
}

// Simplified version for basic usage
export function useAutoSaveSimple(
  attemptId: string,
  answers: Record<string, any>,
  enabled = true
) {
  return useAutoSave({
    attemptId,
    answers,
    enabled,
    onSave: (saved) => {
      if (saved) {
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      }
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
    }
  });
}
