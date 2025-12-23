import { useEffect, useRef, useState } from "react";

export interface AutosaveOptions {
  saveFn: (payload: any) => Promise<void>;
  delay?: number; // milliseconds
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export function useAutosave(options: AutosaveOptions) {
  const { saveFn, delay = 3000, onSaveStart, onSaveSuccess, onSaveError } = options;

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<any>(null);

  const timer = useRef<NodeJS.Timeout | null>(null);
  const lastPayload = useRef<any>(null);
  const lastSaveAttempt = useRef<number>(0);

  const saveNow = async () => {
    if (!lastPayload.current || saving) return;

    const payload = lastPayload.current;
    const attemptId = ++lastSaveAttempt.current;

    setSaving(true);
    setError(null);
    onSaveStart?.();

    try {
      await saveFn(payload);
      setLastSaved(new Date());
      onSaveSuccess?.();
    } catch (err) {
      // Only update error if this is the most recent save attempt
      if (attemptId === lastSaveAttempt.current) {
        setError(err);
        onSaveError?.(err);
      }
    } finally {
      // Only update saving state if this is the most recent save attempt
      if (attemptId === lastSaveAttempt.current) {
        setSaving(false);
      }
    }
  };

  const setPayload = (payload: any) => {
    lastPayload.current = payload;

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(saveNow, delay);
  };

  const forceSave = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    saveNow();
  };

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return {
    saving,
    lastSaved,
    error,
    setPayload,
    saveNow: forceSave,
    hasUnsavedChanges: !!lastPayload.current,
  };
}
