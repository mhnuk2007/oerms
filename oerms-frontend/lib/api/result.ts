import { apiClient } from './client';
import type {
  ResultDTO,
  ResultSummaryDTO,
  ResultDetailsResponse,
  PageResultSummaryDTO,
  PublishResultRequest,
  GradeResultRequest,
  StudentStatisticsDTO,
  ExamResultStatisticsDTO,
} from '@/lib/types';

export const resultService = {
  // =====================
  // Result Management
  // =====================

  unpublishResult(id: string) {
    return apiClient.post<ResultDTO>(
      `/api/results/${id}/unpublish`
    );
  },

  publishResult(id: string, data: PublishResultRequest) {
    return apiClient.post<ResultDTO>(
      `/api/results/${id}/publish`,
      data
    );
  },

  gradeResult(id: string, data: GradeResultRequest) {
    return apiClient.post<ResultDTO>(
      `/api/results/${id}/grade`,
      data
    );
  },

  calculateRankings(examId: string) {
    return apiClient.post<void>(
      `/api/results/exam/${examId}/calculate-rankings`
    );
  },

  // =====================
  // Result Details
  // =====================

  getResult(id: string) {
    return apiClient.get<ResultDTO>(
      `/api/results/${id}`
    );
  },

  deleteResult(id: string) {
    return apiClient.delete<void>(
      `/api/results/${id}`
    );
  },

  getResultDetails(id: string) {
    return apiClient.get<ResultDetailsResponse>(
      `/api/results/${id}/details`
    );
  },

  // =====================
  // Suspicious Results
  // =====================

  getSuspiciousResults() {
    return apiClient.get<ResultSummaryDTO[]>(
      '/api/results/suspicious'
    );
  },

  // =====================
  // Student Statistics
  // =====================

  getStudentStatistics(studentId: string) {
    return apiClient.get<StudentStatisticsDTO>(
      `/api/results/student/${studentId}/statistics`
    );
  },

  // =====================
  // Pending Grading
  // =====================

  getPendingGradingResults() {
    return apiClient.get<ResultSummaryDTO[]>(
      '/api/results/pending-grading'
    );
  },

  // =====================
  // Student Results
  // =====================

  getMyStatistics() {
    return apiClient.get<StudentStatisticsDTO>(
      '/api/results/my-statistics'
    );
  },

  getMyResults(page = 0, size = 20, sortBy = 'publishedAt', sortDir = 'DESC') {
    return apiClient.get<PageResultSummaryDTO>(
      `/api/results/my-results?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  },

  getMyExamResults(examId: string, page = 0, size = 20) {
    return apiClient.get<PageResultSummaryDTO>(
      `/api/results/my-results/exam/${examId}?page=${page}&size=${size}`
    );
  },

  // =====================
  // Health Check
  // =====================

  health() {
    return apiClient.get<string>(
      '/api/results/health'
    );
  },

  // =====================
  // Exam Results
  // =====================

  getExamResults(examId: string, page = 0, size = 20, sortBy = 'submittedAt', sortDir = 'DESC') {
    return apiClient.get<PageResultSummaryDTO>(
      `/api/results/exam/${examId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  },

  getTopScorers(examId: string, limit = 10) {
    return apiClient.get<ResultSummaryDTO[]>(
      `/api/results/exam/${examId}/top-scorers?limit=${limit}`
    );
  },

  getSuspiciousResultsByExam(examId: string) {
    return apiClient.get<ResultSummaryDTO[]>(
      `/api/results/exam/${examId}/suspicious`
    );
  },

  getExamStatistics(examId: string) {
    return apiClient.get<ExamResultStatisticsDTO>(
      `/api/results/exam/${examId}/statistics`
    );
  },

  getPendingGradingByExam(examId: string) {
    return apiClient.get<ResultSummaryDTO[]>(
      `/api/results/exam/${examId}/pending-grading`
    );
  },

  getResultByAttemptId(attemptId: string) {
    return apiClient.get<ResultDTO>(
      `/api/results/attempt/${attemptId}`
    );
  }
};
