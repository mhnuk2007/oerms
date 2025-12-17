// lib/api/question.ts - Question management service

import { apiClient } from './client';
import type {
  QuestionDTO,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  StudentQuestionDTO,
  QuestionStatisticsDTO,
  QuestionSummaryDTO
} from '@/lib/types';

export const questionService = {
  /**
   * Get question by ID
   */
  async getQuestion(id: string): Promise<QuestionDTO> {
    return apiClient.get<QuestionDTO>(`/api/questions/${id}`);
  },

  /**
   * Update question
   */
  async updateQuestion(id: string, data: UpdateQuestionRequest): Promise<QuestionDTO> {
    return apiClient.put<QuestionDTO>(`/api/questions/${id}`, data);
  },

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/api/questions/${id}`);
  },

  /**
   * Create question
   */
  async createQuestion(data: CreateQuestionRequest): Promise<QuestionDTO> {
    return apiClient.post<QuestionDTO>('/api/questions', data);
  },

  /**
   * Bulk create questions
   */
  async bulkCreateQuestions(data: { questions: CreateQuestionRequest[] }): Promise<QuestionDTO[]> {
    return apiClient.post<QuestionDTO[]>('/api/questions/bulk', data);
  },

  /**
   * Get all questions for exam (teacher/admin)
   */
  async getExamQuestions(examId: string): Promise<QuestionDTO[]> {
    return apiClient.get<QuestionDTO[]>(`/api/questions/exam/${examId}`);
  },

  /**
   * Validate exam questions
   */
  async validateExamQuestions(examId: string): Promise<boolean> {
    return apiClient.get<boolean>(`/api/questions/exam/${examId}/validate`);
  },

  /**
   * Get total marks for exam
   */
  async getTotalMarks(examId: string): Promise<number> {
    return apiClient.get<number>(`/api/questions/exam/${examId}/total-marks`);
  },

  /**
   * Get exam questions summary
   */
  async getExamQuestionsSummary(examId: string): Promise<QuestionSummaryDTO> {
    return apiClient.get<QuestionSummaryDTO>(`/api/questions/exam/${examId}/summary`);
  },

  /**
   * Get questions for student (no answers, shuffled if enabled)
   */
  async getExamQuestionsForStudent(
    examId: string,
    shuffle = false
  ): Promise<StudentQuestionDTO[]> {
    return apiClient.get<StudentQuestionDTO[]>(
      `/api/questions/exam/${examId}/student?shuffle=${shuffle}`
    );
  },

  /**
   * Get exam question statistics
   */
  async getExamStatistics(examId: string): Promise<QuestionStatisticsDTO> {
    return apiClient.get<QuestionStatisticsDTO>(
      `/api/questions/exam/${examId}/statistics`
    );
  },

  /**
   * Get question count for exam
   */
  async getQuestionCount(examId: string): Promise<number> {
    return apiClient.get<number>(`/api/questions/exam/${examId}/count`);
  },

  /**
   * Reorder questions
   */
  async reorderQuestions(examId: string, questionIds: string[]): Promise<QuestionDTO[]> {
    return apiClient.put<QuestionDTO[]>(
      `/api/questions/exam/${examId}/reorder`,
      questionIds
    );
  },

  /**
   * Delete all questions for exam
   */
  async deleteAllExamQuestions(examId: string): Promise<void> {
    await apiClient.delete(`/api/questions/exam/${examId}/all`);
  }
};
