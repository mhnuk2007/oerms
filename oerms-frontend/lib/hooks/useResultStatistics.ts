'use client';

import { useQuery } from '@tanstack/react-query';
import { resultService } from '@/lib/api/result';

export function useStudentStatistics(studentId: string) {
  return useQuery({
    queryKey: ['student-statistics', studentId],
    queryFn: () => resultService.getStudentStatistics(studentId),
    enabled: !!studentId,
  });
}

export function useStudentPerformanceTrend(studentId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['student-performance-trend', studentId, startDate, endDate],
    queryFn: () => resultService.getStudentPerformanceTrend(studentId, startDate, endDate),
    enabled: !!studentId,
  });
}