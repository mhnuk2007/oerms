'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resultService, type PublishResultRequest, type GradeResultRequest } from '@/lib/api/result';

export function usePublishResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<PublishResultRequest, 'resultId'> }) =>
      resultService.publishResult(id, data as PublishResultRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      queryClient.invalidateQueries({ queryKey: ['result'] });
      queryClient.invalidateQueries({ queryKey: ['publication-status'] });
    },
  });
}

export function useUnpublishResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resultService.unpublishResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      queryClient.invalidateQueries({ queryKey: ['result'] });
    },
  });
}

export function useGradeResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<GradeResultRequest, 'resultId'> }) =>
      resultService.gradeResult(id, data as GradeResultRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-grading'] });
      queryClient.invalidateQueries({ queryKey: ['result'] });
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
    },
  });
}

export function useCalculateRankings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => resultService.calculateRankings(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      queryClient.invalidateQueries({ queryKey: ['top-scorers'] });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resultService.deleteResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      queryClient.invalidateQueries({ queryKey: ['all-results'] });
    },
  });
}

// New mutation hooks for additional operations

export function useBulkGradeResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { resultGrades: Array<{ resultId: string; obtainedMarks: number; comments?: string }> }) =>
      resultService.bulkGrade(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-grading'] });
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      queryClient.invalidateQueries({ queryKey: ['all-results'] });
    },
  });
}

export function useBulkPublishResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { resultIds: string[]; comments?: string }) =>
      resultService.bulkPublish(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      queryClient.invalidateQueries({ queryKey: ['publication-status'] });
      queryClient.invalidateQueries({ queryKey: ['all-results'] });
    },
  });
}

export function useNotifyStudent() {
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request?: { message?: string } }) =>
      resultService.notifyStudent(id, request),
  });
}

export function useNotifyAllStudents() {
  return useMutation({
    mutationFn: (examId: string) => resultService.notifyAllStudents(examId),
  });
}