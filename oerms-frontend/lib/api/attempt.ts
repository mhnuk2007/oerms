import { apiClient } from './client';
import type {
  AttemptResponse,
  SaveAnswerRequest,
  SubmitAttemptRequest,
  AttemptAnswerResponse,
  AttemptSummary,
  ExamAttemptStatistics,
  StartAttemptRequest,
  PageResponse
} from '@/lib/types';

export const attemptService = {

  // =====================
  // Student
  // =====================

  startAttempt(request: StartAttemptRequest) {
    return apiClient.post<AttemptResponse>(
      '/api/attempts/start',
      request
    );
  },

  saveAnswer(attemptId: string, request: SaveAnswerRequest) {
    return apiClient.post<AttemptAnswerResponse>(
      `/api/attempts/${attemptId}/answers`,
      request
    );
  },

  submitAttempt(request: SubmitAttemptRequest) {
    return apiClient.post<AttemptResponse>(
      '/api/attempts/submit',
      request
    );
  },

  getAttempt(attemptId: string) {
    return apiClient.get<AttemptResponse>(
      `/api/attempts/${attemptId}`
    );
  },

  getAttemptAnswers(attemptId: string) {
    return apiClient.get<AttemptAnswerResponse[]>(
      `/api/attempts/${attemptId}/answers`
    );
  },

  getMyAttempts(page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/my-attempts?page=${page}&size=${size}`
    );
  },

  getMyExamAttempts(examId: string, page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/my-attempts/exam/${examId}?page=${page}&size=${size}`
    );
  },

  getMyAttemptsCount() {
    return apiClient.get<number>(
      '/api/attempts/my-attempts/count'
    );
  },

  // =====================
  // Proctoring
  // =====================

  recordTabSwitch(attemptId: string) {
    return apiClient.post<void>(
      `/api/attempts/${attemptId}/tab-switch`
    );
  },

  recordWebcamViolation(attemptId: string) {
    return apiClient.post<void>(
      `/api/attempts/${attemptId}/webcam-violation`
    );
  },

  recordCustomViolation(attemptId: string, violationType: string) {
    return apiClient.post<void>(
      `/api/attempts/${attemptId}/violations/custom?violationType=${encodeURIComponent(violationType)}`
    );
  },

  // =====================
  // Teacher / Admin
  // =====================

  getExamAttempts(examId: string, page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/exam/${examId}?page=${page}&size=${size}`
    );
  },

  getExamAttemptStatistics(examId: string) {
    return apiClient.get<ExamAttemptStatistics>(
      `/api/attempts/exam/${examId}/statistics`
    );
  },

  getExamAttemptsCount(examId: string) {
    return apiClient.get<number>(
      `/api/attempts/exam/${examId}/count`
    );
  },

  getStudentAttempts(studentId: string, page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/student/${studentId}?page=${page}&size=${size}`
    );
  },

  getAllAttempts(page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/all?page=${page}&size=${size}`
    );
  },

  health() {
    return apiClient.get<string>(
      '/api/attempts/health'
    );
  }
};
