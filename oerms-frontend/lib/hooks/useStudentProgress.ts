'use client';

import { useQuery } from '@tanstack/react-query';
import { resultService } from '@/lib/api/result';

/**
 * Hook to get my progress over time
 */
export function useMyProgress(subject?: string, since?: string) {
    return useQuery({
        queryKey: ['my-progress', subject, since],
        queryFn: () => resultService.getMyProgress(subject, since),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook to get subject-wise performance
 */
export function useSubjectPerformance() {
    return useQuery({
        queryKey: ['subject-performance'],
        queryFn: () => resultService.getSubjectPerformance(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook to get improvement areas
 */
export function useImprovementAreas() {
    return useQuery({
        queryKey: ['improvement-areas'],
        queryFn: () => resultService.getImprovementAreas(),
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
}

/**
 * Hook to compare multiple results
 */
export function useCompareMyResults(resultIds: string[]) {
    return useQuery({
        queryKey: ['compare-my-results', resultIds],
        queryFn: () => resultService.compareMyResults(resultIds),
        enabled: resultIds.length > 0,
    });
}

/**
 * Hook to get student performance report (Teacher/Admin view)
 */
export function useStudentPerformanceReport(studentId: string, startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ['student-performance-report', studentId, startDate, endDate],
        queryFn: () => resultService.getStudentPerformanceReport(studentId, startDate, endDate),
        enabled: !!studentId,
    });
}

/**
 * Hook to get student subject performance (Teacher/Admin view)
 */
export function useStudentSubjectPerformance(studentId: string, subject: string) {
    return useQuery({
        queryKey: ['student-subject-performance', studentId, subject],
        queryFn: () => resultService.getStudentSubjectPerformance(studentId, subject),
        enabled: !!studentId && !!subject,
    });
}

/**
 * Hook to get student consistency score
 */
export function useConsistencyScore(studentId: string) {
    return useQuery({
        queryKey: ['consistency-score', studentId],
        queryFn: () => resultService.getConsistencyScore(studentId),
        enabled: !!studentId,
    });
}
