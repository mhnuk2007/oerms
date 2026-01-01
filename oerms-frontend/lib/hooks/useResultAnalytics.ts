'use client';

import { useQuery } from '@tanstack/react-query';
import { resultService } from '@/lib/api/result';

/**
 * Hook to get AI-generated result insights
 */
export function useResultInsights(resultId: string) {
    return useQuery({
        queryKey: ['result-insights', resultId],
        queryFn: () => resultService.getResultInsights(resultId),
        enabled: !!resultId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook to get strengths and weaknesses analysis
 */
export function useStrengthsWeaknesses(resultId: string) {
    return useQuery({
        queryKey: ['strengths-weaknesses', resultId],
        queryFn: () => resultService.getStrengthsWeaknesses(resultId),
        enabled: !!resultId,
    });
}

/**
 * Hook to get question-wise analysis
 */
export function useQuestionAnalysis(resultId: string) {
    return useQuery({
        queryKey: ['question-analysis', resultId],
        queryFn: () => resultService.getQuestionAnalysis(resultId),
        enabled: !!resultId,
    });
}

/**
 * Hook to get time efficiency analysis
 */
export function useTimeEfficiency(resultId: string) {
    return useQuery({
        queryKey: ['time-efficiency', resultId],
        queryFn: () => resultService.getTimeEfficiency(resultId),
        enabled: !!resultId,
    });
}

/**
 * Hook to compare result with class average
 */
export function useCompareWithAverage(resultId: string) {
    return useQuery({
        queryKey: ['compare-with-average', resultId],
        queryFn: () => resultService.compareWithAverage(resultId),
        enabled: !!resultId,
    });
}

/**
 * Hook to get percentile rank
 */
export function usePercentile(resultId: string) {
    return useQuery({
        queryKey: ['percentile', resultId],
        queryFn: () => resultService.getPercentile(resultId),
        enabled: !!resultId,
    });
}

/**
 * Hook to get exam analytics
 */
export function useExamAnalytics(examId: string) {
    return useQuery({
        queryKey: ['exam-analytics', examId],
        queryFn: () => resultService.getExamAnalytics(examId),
        enabled: !!examId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get participation metrics
 */
export function useParticipationMetrics(examId: string) {
    return useQuery({
        queryKey: ['participation-metrics', examId],
        queryFn: () => resultService.getParticipationMetrics(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get score distribution
 */
export function useScoreDistribution(examId: string) {
    return useQuery({
        queryKey: ['score-distribution', examId],
        queryFn: () => resultService.getScoreDistribution(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get time analysis for exam
 */
export function useExamTimeAnalysis(examId: string) {
    return useQuery({
        queryKey: ['exam-time-analysis', examId],
        queryFn: () => resultService.getTimeAnalysis(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get question-wise performance for exam
 */
export function useQuestionPerformance(examId: string) {
    return useQuery({
        queryKey: ['question-performance', examId],
        queryFn: () => resultService.getQuestionPerformance(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get grading suggestions
 */
export function useGradingSuggestions(resultId: string) {
    return useQuery({
        queryKey: ['grading-suggestions', resultId],
        queryFn: () => resultService.getGradingSuggestions(resultId),
        enabled: !!resultId,
    });
}

/**
 * Hook to get performance matrix
 */
export function usePerformanceMatrix(examId: string) {
    return useQuery({
        queryKey: ['performance-matrix', examId],
        queryFn: () => resultService.getPerformanceMatrix(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get item analysis
 */
export function useItemAnalysis(examId: string) {
    return useQuery({
        queryKey: ['item-analysis', examId],
        queryFn: () => resultService.getItemAnalysis(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get discrimination index
 */
export function useDiscriminationIndex(examId: string) {
    return useQuery({
        queryKey: ['discrimination-index', examId],
        queryFn: () => resultService.getDiscriminationIndex(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get reliability score
 */
export function useReliabilityScore(examId: string) {
    return useQuery({
        queryKey: ['reliability-score', examId],
        queryFn: () => resultService.getReliabilityScore(examId),
        enabled: !!examId,
    });
}

/**
 * Hook to get system analytics (Admin)
 */
export function useSystemAnalytics(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ['system-analytics', startDate, endDate],
        queryFn: () => resultService.getSystemAnalytics(startDate, endDate),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get system trends
 */
export function useSystemTrends() {
    return useQuery({
        queryKey: ['system-trends'],
        queryFn: () => resultService.getSystemTrends(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
