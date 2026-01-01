'use client';

import { useQuery } from '@tanstack/react-query';
import { resultService, type ResultSearchCriteria } from '../api/result';
export function useMyResults(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['my-results', params],
    queryFn: () => resultService.getMyResults(params?.page, params?.size),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMyExamResults(examId: string, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['my-exam-results', examId, params],
    queryFn: () => resultService.getMyExamResults(examId, params?.page, params?.size),
    enabled: !!examId,
  });
}

export function useMyStatistics() {
  return useQuery({
    queryKey: ['my-statistics'],
    queryFn: () => resultService.getMyStatistics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAllResults(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['all-results', params],
    queryFn: () => resultService.getAllResults(params?.page, params?.size),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useSearchResults(criteria: ResultSearchCriteria) {
  return useQuery({
    queryKey: ['search-results', criteria],
    queryFn: () => resultService.searchResults(criteria),
    enabled: Object.keys(criteria).length > 0,
  });
}

export function useResultsByStatus(status: string, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['results-by-status', status, params],
    queryFn: () => resultService.getResultsByStatus(status as any, params?.page, params?.size),
    enabled: !!status,
  });
}

export function useRecentResults(limit?: number, activityType?: 'SUBMITTED' | 'GRADED' | 'PUBLISHED') {
  return useQuery({
    queryKey: ['recent-results', limit, activityType],
    queryFn: () => resultService.getRecentResults(limit, activityType),
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function usePendingGrading() {
  return useQuery({
    queryKey: ['pending-grading'],
    queryFn: () => resultService.getPendingGradingResults(),
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

export function useSuspiciousResults() {
  return useQuery({
    queryKey: ['suspicious-results'],
    queryFn: () => resultService.getSuspiciousResults(),
  });
}

export function useResultDetails(id: string) {
  return useQuery({
    queryKey: ['result-details', id],
    queryFn: () => resultService.getResultDetails(id),
    enabled: !!id,
  });
}

export function useResult(id: string) {
  return useQuery({
    queryKey: ['result', id],
    queryFn: () => resultService.getResult(id),
    enabled: !!id,
  });
}
