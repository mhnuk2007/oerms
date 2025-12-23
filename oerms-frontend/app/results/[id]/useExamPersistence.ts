import { useEffect, useRef, useState } from 'react';

interface ExamState {
  answers: Record<string, { options?: string[]; text?: string; flagged: boolean }>;
  currentIndex: number;
  lastSaved: string;
}

export function useExamPersistence(attemptId: string, answers: ExamState['answers'], currentIndex: number) {
  const storageKey = `exam_backup_${attemptId}`;
  const [isLoaded, setIsLoaded] = useState(false);
  const [restoredState, setRestoredState] = useState<ExamState | null>(null);
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data: ExamState = JSON.parse(saved);
        setRestoredState(data);
      }
    } catch (error) {
      console.error('Failed to load exam backup:', error);
    } finally {
      setIsLoaded(true); // Always mark as loaded, even if no backup exists
    }
  }, [storageKey]); // Include storageKey in dependencies
  
  // Save to localStorage on changes (debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Don't save until initial load is complete
    if (!isLoaded) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      const state: ExamState = {
        answers,
        currentIndex,
        lastSaved: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to backup exam state:', error);
      }
    }, 1000); // Debounce 1s
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [answers, currentIndex, storageKey, isLoaded]);
  
  // Clear backup on successful submit
  const clearBackup = () => {
    localStorage.removeItem(storageKey);
  };
  
  return { clearBackup, isLoaded, restoredState };
}