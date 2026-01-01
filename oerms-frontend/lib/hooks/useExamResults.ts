'use client';

import { useQuery } from '@tanstack/react-query';
import { resultService } from '@/lib/api/result';

export function useExamResults(examId: string, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['exam-results', examId, params],
    queryFn: () => resultService.getExamResults(examId, params?.page, params?.size),
    enabled: !!examId,
  });
}

export function useExamStatistics(examId: string) {
  return useQuery({
    queryKey: ['exam-statistics', examId],
    queryFn: () => resultService.getExamStatistics(examId),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGradeDistribution(examId: string) {
  return useQuery({
    queryKey: ['grade-distribution', examId],
    queryFn: () => resultService.getGradeDistribution(examId),
    enabled: !!examId,
  });
}

export function usePublicationStatus(examId: string) {
  return useQuery({
    queryKey: ['publication-status', examId],
    queryFn: () => resultService.getPublicationStatus(examId),
    enabled: !!examId,
  });
}

export function useTopScorers(examId: string, limit: number = 10) {
  return useQuery({
    queryKey: ['top-scorers', examId, limit],
    queryFn: () => resultService.getTopScorers(examId, limit),
    enabled: !!examId,
  });
}

export function useLowPerformers(examId: string, threshold: number = 40) {
  return useQuery({
    queryKey: ['low-performers', examId, threshold],
    queryFn: () => resultService.getLowPerformers(examId, threshold),
    enabled: !!examId,
  });
}