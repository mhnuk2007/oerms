// lib/api/exam.ts - Exam management service

import { apiClient } from './client';
import type { ExamDTO, CreateExamRequest, UpdateExamRequest, ExamStatisticsDTO, PageResponseExamDTO, ExamStartResponse } from '@/lib/types';

export const examService = {
  /**
   * Create new exam (Teacher/Admin)
   */
  async createExam(data: CreateExamRequest): Promise<ExamDTO> {
    return apiClient.post<ExamDTO>('/api/exams', data);
  },

  /**
   * Update exam (DRAFT only)
   */
  async updateExam(id: string, data: UpdateExamRequest): Promise<ExamDTO> {
    return apiClient.put<ExamDTO>(`/api/exams/${id}`, data);
  },

  /**
   * Get exam by ID
   */
  async getExam(id: string): Promise<ExamDTO> {
    return apiClient.get<ExamDTO>(`/api/exams/${id}`);
  },

  /**
   * Delete exam (DRAFT only)
   */
  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`/api/exams/${id}`);
  },

  /**
   * Publish exam (Teacher/Admin)
   */
  async publishExam(id: string): Promise<ExamDTO> {
    return apiClient.post<ExamDTO>(`/api/exams/${id}/publish`);
  },

  /**
   * Unpublish exam
   */
  async unpublishExam(id: string): Promise<ExamDTO> {
    return apiClient.post<ExamDTO>(`/api/exams/${id}/unpublish`);
  },

  /**
   * Archive exam
   */
  async archiveExam(id: string): Promise<ExamDTO> {
    return apiClient.post<ExamDTO>(`/api/exams/${id}/archive`);
  },

  /**
   * Cancel exam
   */
  async cancelExam(id: string, reason?: string): Promise<ExamDTO> {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return apiClient.post<ExamDTO>(`/api/exams/${id}/cancel${params}`);
  },

  /**
   * Validate exam for publishing
   */
  async validatePublish(id: string): Promise<boolean> {
    return apiClient.get<boolean>(`/api/exams/${id}/validate-publish`);
  },

  /**
   * Get exam statistics
   */
  async getStatistics(id: string): Promise<ExamStatisticsDTO> {
    return apiClient.get<ExamStatisticsDTO>(`/api/exams/${id}/statistics`);
  },

  /**
   * Get my exams (current teacher)
   */
  async getMyExams(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC'): Promise<PageResponseExamDTO> {
    return apiClient.get<PageResponseExamDTO>(
      `/api/exams/my-exams?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  },

  /**
   * Get published exams (for students)
   */
  async getPublishedExams(page = 0, size = 10): Promise<PageResponseExamDTO> {
    return apiClient.get<PageResponseExamDTO>(
      `/api/exams/published?page=${page}&size=${size}`
    );
  },

  /**
   * Get all exams (admin only)
   */
  async getAllExams(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC'): Promise<PageResponseExamDTO> {
    return apiClient.get<PageResponseExamDTO>(
      `/api/exams/all?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  },

  /**
   * Get active exams
   */
  async getActiveExams(): Promise<ExamDTO[]> {
    return apiClient.get<ExamDTO[]>('/api/exams/active');
  },

  /**
   * Get ongoing exams
   */
  async getOngoingExams(): Promise<ExamDTO[]> {
    return apiClient.get<ExamDTO[]>('/api/exams/ongoing');
  },

  /**
   * Start exam (student)
   * Returns exam and attempt information
   */
  async startExam(id: string): Promise<ExamStartResponse> {
    return apiClient.post<ExamStartResponse>(`/api/exams/${id}/start`);
  },

  /**
   * Complete exam (student)
   */
  async completeExam(id: string): Promise<void> {
    await apiClient.post(`/api/exams/${id}/complete`);
  },

  /**
   * Get question count for exam
   */
  async getQuestionCount(id: string): Promise<number> {
    return apiClient.get<number>(`/api/exams/${id}/questions/count`);
  },

  /**
   * Get published exam count
   */
  async getPublishedExamCount(): Promise<number> {
    return apiClient.get<number>('/api/exams/published/count');
  },

  /**
   * Get my exam count
   */
  async getMyExamCount(): Promise<number> {
    return apiClient.get<number>('/api/exams/my-exams/count');
  },

  /**
   * Get exam with questions
   */
  async getExamWithQuestions(id: string): Promise<any> {
    return apiClient.get(`/api/exams/${id}/with-questions`);
  },

  /**
   * Get teacher's exams
   */
  async getTeacherExams(teacherId: string, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC'): Promise<PageResponseExamDTO> {
    return apiClient.get<PageResponseExamDTO>(
      `/api/exams/teacher/${teacherId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  },

  /**
   * Get teacher's exam count
   */
  async getTeacherExamCount(teacherId: string): Promise<number> {
    return apiClient.get<number>(`/api/exams/teacher/${teacherId}/count`);
  }
};
