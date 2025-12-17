// lib/hooks/use-exam.ts - Custom hooks for exam management

import { useState, useEffect } from 'react';
import { examService } from '@/lib/api/exam';
import { useExamStore } from '@/lib/stores/exam-store';
import type { ExamDTO, CreateExamRequest } from '@/lib/types';

export function useExam(examId?: string) {
  const { currentExam, setCurrentExam, setLoading, setError } = useExamStore();
  const [exam, setExam] = useState<ExamDTO | null>(currentExam);

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        const data = await examService.getExam(examId);
        setExam(data);
        setCurrentExam(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch exam');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, setCurrentExam, setLoading, setError]);

  return { exam };
}

export function useExams() {
  const { exams, setExams, setLoading, setError } = useExamStore();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchExams = async (pageNum = 0, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await examService.getMyExams(pageNum);

      if (append) {
        setExams([...exams, ...response.content]);
      } else {
        setExams(response.content);
      }

      setHasMore(!response.last);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exams');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchExams(0);
  }, []);

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchExams(page + 1, true);
    }
  };

  const refresh = () => {
    fetchExams(0);
  };

  return {
    exams,
    loadMore,
    hasMore,
    isLoadingMore,
    refresh
  };
}

export function useCreateExam() {
  const { addExam, setLoading, setError } = useExamStore();
  const [isCreating, setIsCreating] = useState(false);

  const createExam = async (data: CreateExamRequest): Promise<ExamDTO | null> => {
    try {
      setIsCreating(true);
      setLoading(true);

      const exam = await examService.createExam(data);
      addExam(exam);
      setError(null);

      return exam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create exam';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  return {
    createExam,
    isCreating
  };
}

export function useUpdateExam() {
  const { updateExam, setLoading, setError } = useExamStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const update = async (id: string, updates: Partial<ExamDTO>): Promise<ExamDTO | null> => {
    try {
      setIsUpdating(true);
      setLoading(true);

      const exam = await examService.updateExam(id, updates);
      updateExam(id, exam);
      setError(null);

      return exam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update exam';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  };

  return {
    updateExam: update,
    isUpdating
  };
}

export function useDeleteExam() {
  const { removeExam, setLoading, setError } = useExamStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteExam = async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setLoading(true);

      await examService.deleteExam(id);
      removeExam(id);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete exam';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
      setLoading(false);
    }
  };

  return {
    deleteExam,
    isDeleting
  };
}

export function usePublishExam() {
  const { updateExam, setLoading, setError } = useExamStore();
  const [isPublishing, setIsPublishing] = useState(false);

  const publishExam = async (id: string): Promise<ExamDTO | null> => {
    try {
      setIsPublishing(true);
      setLoading(true);

      const exam = await examService.publishExam(id);
      updateExam(id, exam);
      setError(null);

      return exam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish exam';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsPublishing(false);
      setLoading(false);
    }
  };

  return {
    publishExam,
    isPublishing
  };
}

export function useExamStats() {
  const [stats, setStats] = useState({
    totalExams: 0,
    publishedExams: 0,
    draftExams: 0,
    activeExams: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      const [publishedCount, myExamCount] = await Promise.all([
        examService.getPublishedExamCount(),
        examService.getMyExamCount()
      ]);

      setStats({
        totalExams: myExamCount,
        publishedExams: publishedCount,
        draftExams: myExamCount - publishedCount,
        activeExams: publishedCount
      });
    } catch (error) {
      console.error('Failed to fetch exam stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    refresh: fetchStats
  };
}
