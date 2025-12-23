import { apiClient } from './client';
import type {
  AttemptResponse,
  SaveAnswerRequest,
  SubmitAttemptRequest,
  AttemptAnswerResponse,
  AttemptSummary,
  StartAttemptRequest,
  PageResponse
} from '@/lib/types';

export const attemptService = {
  // =====================
  // Proctoring
  // =====================

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

  recordTabSwitch(attemptId: string) {
    return apiClient.post<void>(
      `/api/attempts/${attemptId}/tab-switch`
    );
  },

  // =====================
  // Answers
  // =====================

  getAttemptAnswers(attemptId: string) {
    return apiClient.get<AttemptAnswerResponse[]>(
      `/api/attempts/${attemptId}/answers`
    );
  },

  saveAnswer(attemptId: string, data: SaveAnswerRequest) {
    return apiClient.post<AttemptAnswerResponse>(
      `/api/attempts/${attemptId}/answers`,
      data
    );
  },

  // =====================
  // Attempts
  // =====================

  submitAttempt(data: SubmitAttemptRequest) {
    return apiClient.post<AttemptResponse>(
      '/api/attempts/submit',
      data
    );
  },

  startAttempt(data: StartAttemptRequest) {
    return apiClient.post<AttemptResponse>(
      '/api/attempts/start',
      data
    );
  },

  getAttempt(attemptId: string) {
    return apiClient.get<AttemptResponse>(
      `/api/attempts/${attemptId}`
    );
  },

  // =====================
  // Student Attempts
  // =====================

  getStudentAttempts(studentId: string, page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/student/${studentId}?page=${page}&size=${size}`
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
  // Teacher/Admin Attempts
  // =====================

  getExamAttempts(examId: string, page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/exam/${examId}?page=${page}&size=${size}`
    );
  },

  getExamAttemptsCount(examId: string) {
    return apiClient.get<number>(
      `/api/attempts/exam/${examId}/count`
    );
  },

  getAllAttempts(page = 0, size = 20) {
    return apiClient.get<PageResponse<AttemptSummary>>(
      `/api/attempts/all?page=${page}&size=${size}`
    );
  },

  // =====================
  // Health
  // =====================

  health() {
    return apiClient.get<string>(
      '/api/attempts/health'
    );
  }
};
